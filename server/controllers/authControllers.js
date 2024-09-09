const validator = require('validator');
const User = require('../models/User');
const UserInfo = require('../models/AddInfo');
const JobOrder = require('../models/jobOrder');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is working');
};

// Register Endpoint
const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;
        console.log('Submitting form', req.body);

        // Check if name is entered
        if (!firstName || !lastName) {
            return res.json({ error: 'Name is required' });
        }

        // Check Email
        if (!validator.isEmail(email)) {
            return res.json({ error: 'Please provide a valid email.' });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.json({ error: 'Email is already taken' });
        }

        // Check if password is strong
        if (!validator.isStrongPassword(password) || password.length <= 6) {
            return res.json({
                error: 'Password should be at least 6 characters long, contains an ' +
                    'uppercase and lowercase letter, and at least 1 symbol'
            });
        }

        if (password !== confirmPassword) {
            return res.json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await hashPassword(password);

        // Create user in database (Table)
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await user.save();

        // Sign JWT token
        jwt.sign({ email: user.email, id: user._id, firstName: user.firstName, lastName: user.lastName }, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) throw err;
            // Set cookie with token
            res.cookie('token', token, { httpOnly: true }).json(user);
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const loginAuth = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if User exists
        const user = await User.findOne({ email });
        const userInfoData = await UserInfo.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'Incorrect Email or Password' });
        }

        const match = await comparePassword(password, user.password);

        if (!match) {
            return res.status(400).json({ error: 'Incorrect Email or Password' });
        }

        if (!userInfoData) {
            return res.status(400).json({ error: 'Incomplete Credentials. Please Contact Administrator.' });
        }

        // Sign JWT token
        jwt.sign({
            email: user.email,
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        },
            process.env.JWT_SECRET,
            {}, (err, token) => {
                if (err) throw err;
                // Set cookie with token
                res.cookie('token', token, { httpOnly: true }).json(user);
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

// Endpoint getProfile with get res
const getProfile = async (req, res) => {
    const { token } = req.cookies;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userData = await User.findOne({ email: decoded.email });

        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userInfoData = await UserInfo.findOne({ email: userData.email });

        if (!userInfoData) {
            return res.status(404).json({ error: 'User info not found' });
        }

        const combinedUserData = {
            ...userData.toObject(),
            ...userInfoData.toObject(),
        };

        res.json(combinedUserData);
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

const updateUserProfile = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const {
            firstName,
            lastName,
            email,
            dept
        } = req.body;

        const userData = await User.findOneAndUpdate(
            { _id: decoded.id },
            {
                $set: {
                    firstName,
                    lastName,
                    email,
                    dept
                }
            },
            { new: true }
        );

        if (!userData) {
            return res.status(404).json({ error: 'User data not found' });
        }

        res.json(userData);
    } catch (error) {
        console.error('Error updating User data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getHistory = async (req, res) => {
    try {
        const { page = 1, status } = req.query;
        const userId = req.user.id; // Extract userId from req.user
        const perPage = 8;
        const skip = (page - 1) * perPage;

        // Define the query to fetch job orders specific to the user and status 'completed' or 'rejected'
        const query = {
            userId, // Filter by the logged-in user's ID
            status: { $in: ['completed', 'rejected', 'pending'] }
        };

        // Apply additional filters if needed
        if (status) {
            query.status = status;
        }

        const totalRequests = await JobOrder.countDocuments(query);
        const totalPages = Math.ceil(totalRequests / perPage);

        const requests = await JobOrder.find(query)
            .skip(skip)
            .limit(perPage)
            .lean();

        return res.json({ requests, totalPages });
    } catch (error) {
        console.error('Error fetching job history:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Logout function
const logout = (req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'You have been logged out successfully' });
};

module.exports = {
    test,
    registerUser,
    loginAuth,
    getProfile,
    updateUserProfile,
    getHistory,
    logout
};
