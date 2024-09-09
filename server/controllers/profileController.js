const User = require('../models/User');
const UserInfo = require('../models/AddInfo');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const jwt = require('jsonwebtoken');

const getProfileConsolidated = async (req, res) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let user;
        let profile;

        switch (decoded.role) {
            case 'user':
                user = await User.findOne({ email: decoded.email });
                profile = await UserInfo.findOne({ email: user.email });
                profile = { ...user.toObject(), ...profile.toObject(), role: 'user' };
                break;
            case 'admin':
                user = await Admin.findOne({ email: decoded.email });
                profile = { ...user.toObject(), role: 'admin' };
                break;
            case 'superAdmin':
                user = await SuperAdmin.findOne({ email: decoded.email });
                profile = { ...user.toObject(), role: 'superAdmin' };
                break;
            default:
                return res.status(401).json({ error: 'Invalid role' });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = getProfileConsolidated;