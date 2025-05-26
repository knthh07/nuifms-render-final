// models/Counter.js
const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  _id: String,       // e.g., "jobOrder-2025-05-27"
  seq: { type: Number, default: 0 }
});

module.exports = mongoose.model("Counter", CounterSchema);
