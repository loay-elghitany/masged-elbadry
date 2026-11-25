const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const login = async (req, res, next) => {
  try {
    const { identifier, email, password } = req.body;
    const loginIdentifier = String(identifier || email || "").trim();

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
    if (codeDigits) lookup.push({ competitionCode: `BDR-${codeDigits}` });
    let user = null;
    if (!loginIdentifier.includes("@")) {
      const directPhoneAccount = await User.findOne({ phone: loginIdentifier });
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
