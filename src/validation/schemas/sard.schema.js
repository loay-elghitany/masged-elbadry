const Joi = require("joi");

const sardRegistrationSchema = Joi.object({
  children: Joi.array()
    .items(
      Joi.object({
        childName: Joi.string().trim().min(2).max(120).required(),
        ageOrGrade: Joi.string().trim().min(1).max(40).required(),
      }).unknown(false),
    )
    .min(1)
    .max(20)
    .required(),
  parentName: Joi.string().trim().min(2).max(120).required(),
  parentPhone: Joi.string().trim().min(8).max(30).required(),
  parentPassword: Joi.string().trim().min(8).max(128).allow(""),
}).unknown(false);

module.exports = { sardRegistrationSchema };
