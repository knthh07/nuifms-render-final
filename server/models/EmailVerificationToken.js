const mongoose = require('mongoose');

const EmailTokenSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {  // Use lowercase 'otp' for consistency
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    expires: 180,  // The document will expire after 3 minutes
    default: Date.now,
  }
}, {
    timestamps: true
});

const EmailVerificationToken = mongoose.model('EmailVerificationToken', EmailTokenSchema); // Updated model name for clarity

module.exports = EmailVerificationToken;
