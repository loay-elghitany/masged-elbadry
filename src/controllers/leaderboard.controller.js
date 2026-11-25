const Group = require("../models/group.model");
const SardEvaluation = require("../models/sardEvaluation.model");

const getTopStudents = async (req, res) => {
  try {
    const evaluations = await SardEvaluation.find()
      .sort({ createdAt: -1, _id: -1 })
      .populate("studentId", "firstName lastName competitionCode")
      .populate("teacherId", "firstName lastName")
      .populate("evaluatedBy.teacherId", "firstName lastName")
      .lean();
    const latestByStudent = new Map();
    for (const evaluation of evaluations) {
      const student = evaluation.studentId;
      if (!student?.competitionCode || latestByStudent.has(student._id.toString())) {
        continue;
      }
      latestByStudent.set(student._id.toString(), { evaluation, student });
    }
    const leaderboard = [...latestByStudent.values()]
      .sort(
        (first, second) =>
          second.evaluation.finalScore - first.evaluation.finalScore ||
          new Date(second.evaluation.createdAt) - new Date(first.evaluation.createdAt),
      )
      .map(({ evaluation, student }, index) => ({
        rank: index + 1,
        firstName: student.firstName,
        lastName: student.lastName,
        competitionCode: student.competitionCode,
        finalScore: evaluation.finalScore,
        maxScore: evaluation.maxScore,
        evaluatedBy:
          evaluation.evaluatedBy?.name ||
          (evaluation.teacherId
            ? `${evaluation.teacherId.firstName || ""} ${evaluation.teacherId.lastName || ""}`.trim()
            : ""),
      }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً.",
    });
  }
};

const getGroupsLeaderboard = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate("teacherId", "firstName lastName")
      .populate("studentIds", "firstName lastName points avatar")
      .lean();

    const groupsLeaderboard = groups.map((group) => {
      const sortedStudents = (group.studentIds || [])
        .map((student) => ({
          studentId: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          points: student.points || 0,
          avatar: student.avatar || "",
        }))
        .sort((a, b) => b.points - a.points);

      const totalGroupPoints = sortedStudents.reduce(
        (sum, student) => sum + student.points,
        0,
      );

      return {
        groupId: group._id,
        groupName: group.name,
        teacherName: group.teacherId
          ? `${group.teacherId.firstName || ""} ${group.teacherId.lastName || ""}`.trim()
          : "غير محدد",
        totalGroupPoints,
        studentsCount: sortedStudents.length,
        students: sortedStudents,
      };
    });

    groupsLeaderboard.sort((a, b) => b.totalGroupPoints - a.totalGroupPoints);

    res.json({ success: true, groupsLeaderboard });
  } catch (error) {
    console.error("Failed to fetch groups leaderboard:", error);
    res.status(500).json({
      success: false,
      message: "حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً.",
    });
  }
};

module.exports = {
  getTopStudents,
  getGroupsLeaderboard,
};
