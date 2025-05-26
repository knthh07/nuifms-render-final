// helpers/jobOrderNumber.js
const Counter = require('../models/Counter');

const getNextJobOrderNumber = async () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const key = `jobOrder-${year}-${month}-${day}`;

  const counter = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return `${year}-${month}${day}${String(counter.seq).padStart(2, "0")}`;
};

module.exports = getNextJobOrderNumber;
