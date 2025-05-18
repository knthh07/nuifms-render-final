const mongoose = require('mongoose');

// Define the Office Schema
const officeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  allowedPositions: [{ type: String, enum: ['Faculty', 'Facilities Employee', 'ASP'], required: true }] // Allowed positions
});

// Define the Floor Schema
const floorSchema = new mongoose.Schema({
  number: { type: String, required: true },
  offices: [officeSchema], // Embed offices within a floor
});

// Define the Building Schema
const buildingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  floors: [floorSchema], // Embed floors within a building
});

// Define the Campus Schema
const campusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  buildings: [buildingSchema], // Embed buildings within a campus
});

// Export the Campus model
const Campus = mongoose.model('Campus', campusSchema);

module.exports = Campus;
