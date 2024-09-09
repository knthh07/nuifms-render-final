const multer = require('multer');
const path = require('path');

// Configure Multer storage
const jobOrderStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/JobOrders/'); // Adjust path if needed
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});

const profilePictureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/Profile_Pictures/'); // Adjust path if needed
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});

const jobOrdersUpload = multer({
  storage: jobOrderStorage,
})

const profileUploads = multer({
  storage: profilePictureStorage,

})


module.exports = { jobOrdersUpload, profileUploads};
