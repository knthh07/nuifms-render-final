const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'inactive'
  }
},
  {
    timestamps: true
  });

const Account = mongoose.model('accounts', AccountSchema);

module.exports = Account;
