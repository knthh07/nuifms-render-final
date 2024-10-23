const jwt = require('jsonwebtoken');
const Account = require('../models/Account');
const UserInfo = require('../models/UserInfo');

// Auth middleware with role-based access control
const authMiddleware = (roles = []) => async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.sendStatus(401);
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Make sure that decoded.email exists
        if (!decoded.email) {
            return res.status(400).json({ error: 'Email not found in token' });
        }

        const user = await Account.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).json({ error: 'User Not Found!' });
        }

        // Fetch additional user info from UserInfo collection
        const userInfo = await UserInfo.findOne({ email: decoded.email });

        if (!userInfo) {
            return res.status(404).json({ error: 'User Info Not Found!' });
        }

        // Attach user information to req.user
        req.user = {
            name: userInfo.firstName + ' ' + userInfo.lastName,
            id: user._id,
            email: user.email,
            position: userInfo.position,
            role: user.role
        };

        // Check if the user's role is authorized to access the route
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
