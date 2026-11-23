const Joi = require("joi");
const { objectIdSchema } = require("../../middlewares/validation.middleware");

const childAssignmentsParamsSchema = Joi.object({
  studentId: objectIdSchema,
});

const leaveRequestCreateSchema = Joi.object({
  studentId: objectIdSchema,
  date: Joi.date().iso().required(),
  reason: Joi.string().trim().min(5).max(1000).required(),
});

const childLeaderboardConsentParamsSchema = Joi.object({
  studentId: objectIdSchema,
});

const leaderboardConsentSchema = Joi.object({
  enabled: Joi.boolean().required(),
});

module.exports = {
  childAssignmentsParamsSchema,
  leaveRequestCreateSchema,
  childLeaderboardConsentParamsSchema,
  leaderboardConsentSchema,
};
