const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  message: String,
  createdAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
});

module.exports = mongoose.model("Recommendation", recommendationSchema);
