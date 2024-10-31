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
    required: true,
  },
  dateOfRequest: {
    type: String,
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
    enum: ['pending', 'ongoing',  'approved', 'rejected', 'completed', 'not completed'],
    default: 'pending'
  },
  rejectionReason: {
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
}, { timestamps: true });

const JobOrder = mongoose.model('JobOrder', JobOrderSchema);

module.exports = JobOrder;
