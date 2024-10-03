const mongoose = require('mongoose');

const UserInfoSchema = new mongoose.Schema({
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
  idNum: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  dept: {
    type: String,
    required: true,
  },
  campus: {
    type: String,
  },
  position: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String
  }, // Add this line

}, {
  timestamps: true
});

const UserInfo = mongoose.model('userInfo', UserInfoSchema);

module.exports = UserInfo;
