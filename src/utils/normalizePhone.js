const normalizePhone = (value) =>
  String(value || "")
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776))
    .replace(/[^\d+]/g, "")
    .replace(/(?!^)\+/g, "");

module.exports = normalizePhone;
