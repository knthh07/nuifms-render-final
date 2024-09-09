const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    maxlength: 32
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 32
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
  role: {
    type: String,
    default: 'user'
  },
  profilePicture: {
    type: String
  }, // Add this line

},
  {
    timestamps: true
  });

const User = mongoose.model('User', UserSchema);

module.exports = User;
