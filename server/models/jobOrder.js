const mongoose = require('mongoose');
const JobOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobType: {
    type: String,
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
  campus: {
    type: String,
  },
  dateOfRequest: {
    type: Date,
    required: true,
  },
  building: {
    type: String,
  },
  floor: {
    type: String,
  },
  reqOffice: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  jobDesc: {
    type: String,
    required: true,
  },
  scenario: {
    type: String,
  },
  object: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'ongoing', 'rejected', 'completed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    required: false,
  },
  remarks: {
    type: String,
    required: false,
  },
  urgency: {
    type: String,
  },
  assignedTo: {
    type: String, // Update to store full name
  },
  dateAssigned: {
    type: Date
  },
  scheduleWork: {
    type: String
  },
  dateFrom: {
    type: Date
  },
  dateTo: {
    type: Date
  },
  costRequired: {
    type: Number
  },
  chargeTo: {
    type: String
  },
  tracking: [
    {
      status: {
        type: String,
        enum: ['on-hold', 'ongoing', 'completed', 'pending', 'notCompleted'], // Add all valid statuses
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
  jobOrderNumber: { // New field for job order reference code
    type: String,
    required: true,
    unique: true,
  }
}, { timestamps: true });

const JobOrder = mongoose.model('JobOrder', JobOrderSchema);

module.exports = JobOrder;
