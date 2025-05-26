// models/Recommendation.js
const mongoose = require('mongoose');
require("../models/UserInfo"); // Don't assign it to a variable

const recommendationSchema = new mongoose.Schema({
  message: String,
  object: String,
  scenario: String,
  reqOffice: String,
  count: Number,
  daysBetween: Number,
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' },
  resolvedAt: Date,
  notes: String,
  history: [{
    timestamp: Date,
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' },
    details: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);