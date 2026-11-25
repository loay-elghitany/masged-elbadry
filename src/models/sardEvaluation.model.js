const mongoose = require("mongoose");

const { Schema } = mongoose;

const SardEvaluationSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  evaluatedBy: {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  maxScore: {
    type: Number,
    required: true,
    min: 1,
  },
  hesitationCount: { type: Number, default: 0, min: 0 },
  alertCount: { type: Number, default: 0, min: 0 },
  correctionCount: { type: Number, default: 0, min: 0 },
  hesitationPenalty: { type: Number, default: 0, min: 0 },
  alertPenalty: { type: Number, default: 3, min: 0 },
  correctionPenalty: { type: Number, default: 6, min: 0 },
  finalScore: {
    type: Number,
    required: true,
    min: 0,
  },
  mistakes: [
    {
      surahName: { type: String, required: true, trim: true },
      ayahNumber: { type: Number, default: null, min: 0 },
      type: {
        type: String,
        enum: ["hesitation", "alert", "correction"],
        default: "alert",
      },
    },
  ],
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

SardEvaluationSchema.pre("validate", function () {
  this.finalScore = Math.max(
    0,
    this.maxScore -
      this.hesitationCount * this.hesitationPenalty -
      this.alertCount * this.alertPenalty -
      this.correctionCount * this.correctionPenalty,
  );
});

SardEvaluationSchema.index({ studentId: 1, createdAt: -1 });
SardEvaluationSchema.index({ finalScore: -1, createdAt: -1 });

module.exports = mongoose.model("SardEvaluation", SardEvaluationSchema);
