const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const normalizePhone = require("../utils/normalizePhone");

const login = async (req, res, next) => {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = String(identifier || email || "").trim();
    const normalizedPhone = normalizePhone(loginIdentifier);
    const isPhoneIdentifier = normalizedPhone.replace(/\D/g, "").length >= 8;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "البريد الإلكتروني أو رقم الهاتف أو كود المسابقة وكلمة المرور مطلوبة.",
      });
    }

    const codeDigits = loginIdentifier.match(/^(?:BDR-)?(\d+)$/i)?.[1];
    const lookup = [
      { email: loginIdentifier.toLowerCase() },
      { phone: loginIdentifier },
      { parentPhone: loginIdentifier },
    ];
    if (isPhoneIdentifier) {
      lookup.push(
        { phone: normalizedPhone },
        { parentPhone: normalizedPhone },
        { parentPhoneNormalized: normalizedPhone },
      );
    }
    if (codeDigits) lookup.push({ competitionCode: `BDR-${codeDigits}` });
    let user = null;
    if (!loginIdentifier.includes("@")) {
      let directPhoneAccount = await User.findOne({
        phone: isPhoneIdentifier ? normalizedPhone : loginIdentifier,
      });
      if (!directPhoneAccount && isPhoneIdentifier) {
        directPhoneAccount = await User.findOne({
          role: "Parent",
          parentPhoneNormalized: normalizedPhone,
        });
      }
      if (
        directPhoneAccount &&
        (await directPhoneAccount.comparePassword(password))
      ) {
        user = directPhoneAccount;
      }
    }
    if (!user) {
      const candidates = await User.find({ $or: lookup });
      for (const candidate of candidates) {
        if (await candidate.comparePassword(password)) {
          user = candidate;
          break;
        }
      }
    }
    if (!user && isPhoneIdentifier) {
      const legacyParents = await User.find({
        role: "Parent",
        parentPhoneNormalized: { $exists: false },
        phone: { $exists: true, $ne: "" },
      });
      const matchingParent = legacyParents.find(
        (candidate) =>
          normalizePhone(candidate.phone) === normalizedPhone,
      );
      if (matchingParent && (await matchingParent.comparePassword(password))) {
        user = matchingParent;
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "خطأ في اسم المستخدم أو كلمة المرور. يرجى التحقق وإعادة المحاولة.",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "تم تسجيل الدخول بنجاح.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
};
