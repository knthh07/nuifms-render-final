const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  dept: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  idNum: {
    type: String,
    required: true,
    unique: true,
  }
}, {
  timestamps: true
});

const UserInfo = mongoose.model('UserInfo', UserSchema);

module.exports = UserInfo;
