const mongoose = require("mongoose");
const User = require("../models/user.model");
const Sequence = require("../models/sequence.model");
const SardEvaluation = require("../models/sardEvaluation.model");
const SystemSettings = require("../models/systemSettings.model");
const juzAmmaSurahs = require("../utils/juzAmmaSurahs");

const defaultSardSettings = {
  maxScore: 100,
  hesitationPenalty: 0,
  alertPenalty: 3,
  correctionPenalty: 6,
};

const getSettings = async () => {
  let settings = await SystemSettings.findOne();
  if (!settings) settings = await SystemSettings.create({});
  return {
    ...defaultSardSettings,
    ...(settings.sardSettings?.toObject?.() || settings.sardSettings || {}),
  };
};

const registerSardStudent = async (req, res, next) => {
  const students = [];
  let parent;
  try {
    const {
      children,
      parentName,
      parentPhone,
      parentPassword,
    } = req.body;
    const [parentFirstName, ...parentLastParts] = parentName.trim().split(/\s+/);
    const parentLastName = parentLastParts.join(" ") || parentFirstName;

    try {
      await Sequence.updateOne(
        { _id: "sard-registration" },
        [
          {
            $set: {
              value: { $max: [{ $ifNull: ["$value", 0] }, 100] },
            },
          },
        ],
        { upsert: true },
      );
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
    const registeredChildren = [];
    for (const child of children) {
      const sequence = await Sequence.findOneAndUpdate(
        { _id: "sard-registration" },
        { $inc: { value: 1 } },
        { new: true },
      );
      const competitionCode = `BDR-${sequence.value}`;
      const [firstName, ...lastParts] = child.childName.trim().split(/\s+/);
      const lastName = lastParts.join(" ") || firstName;
      const sanitizedFirstName =
        firstName
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, ".")
          .replace(/^\.+|\.+$/g, "") || "student";
      let studentEmail = `${sanitizedFirstName}.${sequence.value}@albadri.local`;
      let emailSuffix = 1;
      while (await User.exists({ email: studentEmail })) {
        studentEmail = `${sanitizedFirstName}.${sequence.value}.${emailSuffix}@albadri.local`;
        emailSuffix += 1;
      }

      const sharedPassword =
        parentPassword ||
        (parentPhone.length >= 8 ? parentPhone : `Sard@${sequence.value}`);
      const student = await User.create({
        firstName,
        lastName,
        email: studentEmail,
        password: sharedPassword,
        role: "Student",
        competitionCode,
        ageOrGrade: child.ageOrGrade,
        parentPhone,
      });
      students.push(student);
      registeredChildren.push({
        childName: `${firstName} ${lastName}`.trim(),
        sardCode: competitionCode,
        email: studentEmail,
        password: sharedPassword,
        id: student._id,
      });
    }

    const parentPhoneSlug =
      parentPhone.replace(/[^a-zA-Z0-9]+/g, "") ||
      registeredChildren[0].sardCode.replace("BDR-", "");
    const baseParentEmail = `parent.${parentPhoneSlug}@albadri.local`.toLowerCase();
    const sharedPassword =
      parentPassword ||
      (parentPhone.length >= 8
        ? parentPhone
        : `Sard@${registeredChildren[0].sardCode.replace("BDR-", "")}`);
    for (let suffix = 0; suffix < 100; suffix += 1) {
      const email =
        suffix === 0
          ? baseParentEmail
          : `parent.${parentPhoneSlug}.${suffix}@albadri.local`.toLowerCase();
      if (await User.exists({ email })) continue;
      try {
        parent = await User.create({
          firstName: parentFirstName,
          lastName: parentLastName,
          email,
          password: sharedPassword,
          role: "Parent",
          phone: parentPhone,
          childrenIds: students.map((student) => student._id),
        });
        break;
      } catch (error) {
        if (
          error.code === 11000 &&
          (error.keyPattern?.email || error.message.includes("email_1"))
        ) {
          continue;
        }
        throw error;
      }
    }
    if (!parent) throw new Error("Unable to generate a unique parent email.");

    await User.updateMany(
      { _id: { $in: students.map((student) => student._id) } },
      { $set: { parentId: parent._id } },
    );

    return res.status(201).json({
      success: true,
      message: "تم التسجيل في تحدي سرد جزء عمّ بنجاح.",
      competitionCode: registeredChildren[0].sardCode,
      children: registeredChildren,
      student: {
        id: students[0]._id,
        fullName: registeredChildren[0].childName,
        email: registeredChildren[0].email,
        password: registeredChildren[0].password,
      },
      parent: {
        id: parent._id,
        fullName: `${parent.firstName} ${parent.lastName}`,
        email: parent.email,
        password: sharedPassword,
      },
    });
  } catch (error) {
    if (parent) await User.deleteOne({ _id: parent._id });
    if (students.length) {
      await User.deleteMany({ _id: { $in: students.map((student) => student._id) } });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "البريد الإلكتروني أو كود المسابقة مسجل بالفعل.",
      });
    }
    return next(error);
  }
};

const getSardSettings = async (req, res, next) => {
  try {
    res.json({ settings: await getSettings() });
  } catch (error) {
    next(error);
  }
};

const updateSardSettings = async (req, res, next) => {
  try {
    const settings = { ...defaultSardSettings };
    for (const field of Object.keys(settings)) {
      const value = Number(req.body[field]);
      if (!Number.isFinite(value) || value < 0 || (field === "maxScore" && value < 1)) {
        return res.status(400).json({
          success: false,
          message: `قيمة غير صالحة للحقل ${field}.`,
        });
      }
      settings[field] = value;
    }

    let systemSettings = await SystemSettings.findOne();
    if (!systemSettings) systemSettings = new SystemSettings();
    systemSettings.sardSettings = settings;
    await systemSettings.save();
    return res.json({ success: true, settings });
  } catch (error) {
    return next(error);
  }
};

const getSardLeaderboard = async (req, res, next) => {
  try {
    const students = await User.find({
      role: "Student",
      competitionCode: { $exists: true, $ne: "" },
    })
      .select("firstName lastName email competitionCode parentPhone talent assignedCommittee teacherId parentId")
      .populate("teacherId", "firstName lastName")
      .populate("parentId", "firstName lastName phone")
      .sort({ competitionCode: 1 })
      .lean();
    const evaluations = await SardEvaluation.find({
      studentId: { $in: students.map((student) => student._id) },
    })
      .sort({ createdAt: -1 })
      .populate("teacherId", "firstName lastName")
      .lean();
    const latestByStudent = new Map();
    for (const evaluation of evaluations) {
      const studentId = evaluation.studentId.toString();
      if (!latestByStudent.has(studentId)) latestByStudent.set(studentId, evaluation);
    }

    return res.json({
      students: students.map((student) => ({
        ...student,
        latestEvaluation: latestByStudent.get(student._id.toString()) || null,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const assignSardCommittee = async (req, res, next) => {
  try {
    const { assignedCommittee = "", teacherId = "" } = req.body;
    if (!mongoose.isValidObjectId(req.params.studentId)) {
      return res.status(400).json({ success: false, message: "معرف المتسابق غير صالح." });
    }
    if (typeof assignedCommittee !== "string" || assignedCommittee.length > 100) {
      return res.status(400).json({
        success: false,
        message: "اسم اللجنة أو المكان غير صالح.",
      });
    }

    let teacher = null;
    if (teacherId) {
      if (!mongoose.isValidObjectId(teacherId)) {
        return res.status(400).json({ success: false, message: "المعلم المحدد غير صالح." });
      }
      teacher = await User.findOne({ _id: teacherId, role: "Teacher" });
      if (!teacher) {
        return res.status(400).json({ success: false, message: "المعلم المحدد غير موجود." });
      }
    }

    const student = await User.findOne({
      _id: req.params.studentId,
      role: "Student",
      competitionCode: { $exists: true },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "المتسابق غير موجود." });
    }
    student.assignedCommittee = assignedCommittee.trim();
    student.teacherId = teacher?._id || null;
    await student.save();
    return res.json({ student });
  } catch (error) {
    return next(error);
  }
};

const getTeacherSardStudents = async (req, res, next) => {
  try {
    const students = await User.find({
      role: "Student",
      competitionCode: { $exists: true, $ne: "" },
    })
      .select("firstName lastName competitionCode assignedCommittee teacherId")
      .sort({ firstName: 1, lastName: 1 })
      .lean();
    return res.json({ students });
  } catch (error) {
    return next(error);
  }
};

const createSardEvaluation = async (req, res, next) => {
  try {
    const {
      studentId,
      hesitationCount = 0,
      alertCount = 0,
      correctionCount = 0,
      mistakes = [],
      notes,
    } = req.body;
    if (!mongoose.isValidObjectId(studentId)) {
      return res.status(400).json({ success: false, message: "يجب تحديد متسابق صالح." });
    }
    const counts = [hesitationCount, alertCount, correctionCount].map(Number);
    if (counts.some((count) => !Number.isInteger(count) || count < 0)) {
      return res.status(400).json({ success: false, message: "أعداد الأخطاء يجب أن تكون أعداداً صحيحة غير سالبة." });
    }
    if (!Array.isArray(mistakes)) {
      return res.status(400).json({ success: false, message: "قائمة الآيات غير صالحة." });
    }
    for (const mistake of mistakes) {
      if (!mistake || typeof mistake !== "object") {
        return res.status(400).json({ success: false, message: "بيانات موضع المراجعة غير صالحة." });
      }
      const surah = juzAmmaSurahs.find((item) => item.surahName === mistake.surahName);
      const ayah = mistake.ayahNumber === null ? 0 : Number(mistake.ayahNumber);
      const type = mistake.type || "alert";
      if (
        !surah ||
        !Number.isInteger(ayah) ||
        ayah < 0 ||
        ayah > surah.ayahCount ||
        !["hesitation", "alert", "correction"].includes(type)
      ) {
        return res.status(400).json({ success: false, message: "تحتوي قائمة المراجعة على سورة أو آية غير صالحة." });
      }
    }

    const student = await User.findOne({
      _id: studentId,
      role: "Student",
      competitionCode: { $exists: true },
    });
    if (!student) {
      return res.status(404).json({ success: false, message: "المتسابق غير موجود." });
    }

    const settings = await getSettings();
    const teacherName = `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim();
    const evaluation = await SardEvaluation.create({
      studentId,
      teacherId: req.user._id,
      evaluatedBy: {
        teacherId: req.user._id,
        name: teacherName,
      },
      maxScore: settings.maxScore,
      hesitationCount: counts[0],
      alertCount: counts[1],
      correctionCount: counts[2],
      hesitationPenalty: settings.hesitationPenalty,
      alertPenalty: settings.alertPenalty,
      correctionPenalty: settings.correctionPenalty,
      mistakes: mistakes.map((mistake) => ({
        surahName: mistake.surahName,
        ayahNumber:
          mistake.ayahNumber === null || Number(mistake.ayahNumber) === 0
            ? null
            : Number(mistake.ayahNumber),
        type: mistake.type || "alert",
      })),
      notes,
    });
    student.teacherId = req.user._id;
    await student.save();
    return res.status(201).json({ success: true, evaluation });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerSardStudent,
  getSardSettings,
  updateSardSettings,
  getSardLeaderboard,
  assignSardCommittee,
  getTeacherSardStudents,
  createSardEvaluation,
};
