const express = require("express");
const Joi = require("joi");
const { validateBody } = require("../middlewares/validation.middleware");
const { registerSardStudent } = require("../controllers/sard.controller");

const sardRegistrationSchema = Joi.object({
  studentName: Joi.string().trim().min(2).max(120).required(),
  ageOrGrade: Joi.string().trim().min(1).max(40).required(),
  talent: Joi.string().trim().max(200).allow("").default(""),
  studentEmail: Joi.string().email().lowercase().required(),
  studentPassword: Joi.string().min(8).max(128).required(),
  parentName: Joi.string().trim().min(2).max(120).required(),
  parentPhone: Joi.string().trim().min(5).max(30).required(),
  parentEmail: Joi.string().email().lowercase().required(),
  parentPassword: Joi.string().min(8).max(128).required(),
}).unknown(false);

const router = express.Router();

router.post(
  "/sard-register",
  validateBody(sardRegistrationSchema),
  registerSardStudent,
);

module.exports = router;
