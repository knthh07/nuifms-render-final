require('dotenv').config({ path: '../.env' });
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for job orders
const jobOrderStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'JobOrders', // Cloudinary folder for job orders
    allowed_formats: ['jpeg', 'png', 'gif'], // Allowed image formats
    public_id: (req, file) => Date.now() + '-' + file.originalname, // Filename
  },
});

// Set up Cloudinary storage for profile pictures
const profilePictureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'Profile_Pictures', // Cloudinary folder for profile pictures
    allowed_formats: ['jpeg', 'png', 'gif'], // Allowed image formats
    public_id: (req, file) => Date.now() + '-' + file.originalname, // Filename
  },
});

// Multer configurations for job orders
const jobOrdersUpload = multer({ storage: jobOrderStorage });

// Multer configurations for profile pictures
const profileUploads = multer({ storage: profilePictureStorage });

module.exports = { jobOrdersUpload, profileUploads };
