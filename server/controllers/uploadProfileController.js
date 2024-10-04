const Account = require('../models/Account');
const UserInfo = require('../models/UserInfo');
const jwt = require('jsonwebtoken');

// Update profile picture controller
const updateProfilePicture = async (req, res) => {
    const { token } = req.cookies;
    try {
        if (token) {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            const userDetails = await UserInfo.findOne({ email: decodeToken.email });

            if (userDetails) {
                if (req.file) {
                    const updated = await UserInfo.findOneAndUpdate(
                        { email: userDetails.email },
                        { profilePicture: req.file.path }, // Store Cloudinary URL
                        { new: true }
                    );
                    return res.json(updated);
                }

                return res.status(400).json({ error: 'Please Upload a File' });
            }

            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(401).json({ error: 'Token required' });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProfilePictureSuperAdmin = async (req, res) => {
    const { token } = req.cookies;
    try {
        if (token) {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            const superAdminDetails = await UserInfo.findOne({ email: decodeToken.email });

            if (superAdminDetails) {
                if (req.file) {
                    const updated = await UserInfo.findOneAndUpdate(
                        { email: superAdminDetails.email },
                        { profilePicture: req.file.path }, // Store Cloudinary URL
                        { new: true }
                    );
                    return res.json(updated);
                }

                return res.status(400).json({ error: 'Please Upload a File' });
            }

            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(401).json({ error: 'Token required' });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateProfilePictureUser = async (req, res) => {
    const { token } = req.cookies;
    try {
        if (token) {
            const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
            const userDetails = await UserInfo.findOne({ email: decodeToken.email });

            if (userDetails) {
                if (req.file) {
                    const updated = await UserInfo.findOneAndUpdate(
                        { email: userDetails.email },
                        { profilePicture: req.file.path }, // Store Cloudinary URL
                        { new: true }
                    );
                    return res.json(updated);
                }

                return res.status(400).json({ error: 'Please Upload a File' });
            }

            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(401).json({ error: 'Token required' });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    updateProfilePicture,
    updateProfilePictureSuperAdmin,
    updateProfilePictureUser
};
