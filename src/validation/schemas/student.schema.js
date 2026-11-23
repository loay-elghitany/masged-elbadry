const Joi = require("joi");
const { objectIdSchema } = require("../../middlewares/validation.middleware");

const assignmentReadParamsSchema = Joi.object({
  id: objectIdSchema,
});

const quizSubmitParamsSchema = Joi.object({
  id: objectIdSchema,
});

const quizSubmitSchema = Joi.object({
  answers: Joi.array()
    .items(Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean()))
    .min(1)
    .required(),
});

const redeemRewardSchema = Joi.object({
  rewardId: objectIdSchema,
});

const avatarUpdateSchema = Joi.object({
  avatar: Joi.string().uri().required(),
});

const leaderboardConsentSchema = Joi.object({
  enabled: Joi.boolean().required(),
});

module.exports = {
  assignmentReadParamsSchema,
  quizSubmitParamsSchema,
  quizSubmitSchema,
  redeemRewardSchema,
  avatarUpdateSchema,
  leaderboardConsentSchema,
};
