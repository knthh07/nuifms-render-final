const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  idNum: {
    type: String,
    required: true,
  },
  dept: {
    type: String,
    required: true,
  },
  campus: {
    type: String,
    required: true,
  },
  role: {
    type: String, default: 'admin' 
  },
  profilePicture: {
    type: String
  }, // Add this line
},

  {
    timestamps: true
  },

);

const Admin = mongoose.model('Admin', AdminSchema);

module.exports = Admin;