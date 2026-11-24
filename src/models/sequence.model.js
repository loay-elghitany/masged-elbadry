const mongoose = require("mongoose");

const SequenceSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  value: { type: Number, required: true, default: 100 },
});

module.exports = mongoose.model("Sequence", SequenceSchema);
