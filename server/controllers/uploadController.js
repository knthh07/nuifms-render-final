const multer = require('multer');
const path = require('path');

// Configure Multer storage for job orders
const jobOrderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/JobOrders/'); // Adjust path if needed
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Preserve file extension
  }
});

// Configure Multer storage for profile pictures
const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/Profile_Pictures/'); // Adjust path if needed
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Preserve file extension
  }
});

// File filter function to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']; // Add other types if needed
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('File type not allowed'), false); // Reject the file
  }
};

// Multer configurations for job orders
const jobOrdersUpload = multer({
  storage: jobOrderStorage,
  fileFilter: fileFilter, // Apply the file filter
});

// Multer configurations for profile pictures
const profileUploads = multer({
  storage: profilePictureStorage,
  fileFilter: fileFilter, // Apply the file filter
});

module.exports = { jobOrdersUpload, profileUploads };
