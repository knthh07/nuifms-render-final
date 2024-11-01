const mongoose = require('mongoose');

// Define the Office Schema
const officeSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

// Define the Floor Schema
const floorSchema = new mongoose.Schema({
  name: { type: String, required: true },
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
module.exports = mongoose.model('Campus', campusSchema);
