const mongoose = require('mongoose');
const JobOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  reqOffice: {
    type: String,
    required: true,
  },
  campus: {
    type: String,
    required: true,
  },
  building: {
    type: String,
  },
  floor: {
    type: String,
  },
  room: {
    type: String,
  },
  position: {
    type: String,
    required: true,
  },
  jobDesc: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    required: false,
  },
  priority: {
    type: String,
  },
  assignedTo: {
    type: String, // Update to store full name
  },
  tracking: [
    {
      status: {
        type: String,
        enum: ['on-hold', 'ongoing', 'completed', 'pending'], // Add all valid statuses
      },
      date: {
        type: Date,
        default: Date.now
      },
      note: {
        type: String,
      },
    }
  ],
  fileUrl: {
    type: String, // URL or path to the file
  },
  feedback: {
    type: String,
    default: '',
  },
  feedbackSubmitted: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const JobOrder = mongoose.model('JobOrder', JobOrderSchema);

module.exports = JobOrder;
