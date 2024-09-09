const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

// Helper function to find a user by ID across different models
const findUserById = async (id) => {
    let user = await User.findById(id);
    if (!user) user = await Admin.findById(id);
    if (!user) user = await SuperAdmin.findById(id);
    return user;
};

// Auth middleware with role-based access control
const authMiddleware = (roles = []) => async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        console.log('No token provided');
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Make sure that decoded.id exists
        if (!decoded.id) {
            console.log('User ID not found in token');
            return res.status(401).json({ error: 'Invalid token' });
        }

        const user = await findUserById(decoded.id);

        if (!user) {
            console.log('User not found with ID:', decoded.id);
            return res.status(404).json({ error: 'User not found' });
        }

        // Attach user information to req.user
        req.user = {
            name: user.firstName,
            id: user._id,
            email: user.email,
            position: user.position,
            role: user.role
        };

        // Check if the user's role is authorized to access the route
        if (roles.length && !roles.includes(req.user.role)) {
            console.log('Role not authorized:', req.user.role);
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};


module.exports = authMiddleware;
