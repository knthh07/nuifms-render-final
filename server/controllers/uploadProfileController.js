// File: controllers/uploadProfileController.js
const multer = require('multer');
const path = require('path');
const Account = require('../models/Account');
const UserInfo = require('../models/UserInfo');
const jwt = require('jsonwebtoken');

// Configure Multer storage for profile pictures
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../Uploads/Profile_Pictures'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const uploadProfile = multer({ storage });

// Update profile picture controller
const updateProfilePicture = async (req, res) => {
    const {token} = req.cookies;
    try {

        if(token) {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            const adminDetails = await UserInfo.findOne({email: decodeToken.email})

            if(adminDetails) {
                if(req.file) {
                    const updated = await UserInfo.findOneAndUpdate({email: adminDetails.email}, {profilePicture: req.file.path})
                    return res.json(updated);
                }

                return res.json({
                    error: 'Please Upload a File'
                })
            }

            return res.json({
                error: 'User not found'
            })
        }
        return res.json({
            error: 'Token required'
        })
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProfilePictureSuperAdmin = async (req, res) => {
    const {token} = req.cookies;
    try {

        if(token) {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            const superAdminDetails = await UserInfo.findOne({email: decodeToken.email})

            if(superAdminDetails) {
                if(req.file) {
                    const updated = await UserInfo.findOneAndUpdate({email: superAdminDetails.email}, {profilePicture: req.file.path})
                    return res.json(updated);
                }

                return res.json({
                    error: 'Please Upload a File'
                })
            }

            return res.json({
                error: 'User not found'
            })
        }
        return res.json({
            error: 'Token required'
        })
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProfilePictureUser = async (req, res) => {
    const {token} = req.cookies;
    try {

        if(token) {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            const UserDetails = await UserInfo.findOne({email: decodeToken.email})

            if(UserDetails) {
                if(req.file) {
                    const updated = await UserInfo.findOneAndUpdate({email: UserDetails.email}, {profilePicture: req.file.path})
                    return res.json(updated);
                }

                return res.json({
                    error: 'Please Upload a File'
                })
            }

            return res.json({
                error: 'User not found'
            })
        }
        return res.json({
            error: 'Token required'
        })
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    uploadProfile,
    updateProfilePicture,
    updateProfilePictureSuperAdmin,
    updateProfilePictureUser
};
