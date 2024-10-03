const validator = require('validator');
const UserInfo = require('../models/UserInfo');
const Account = require('../models/Account');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is working');
};

// Register Endpoint
const registerAdmin = async (req, res) => {
    try {
        const {
            email,
            password,
            confirmPassword,
        } = req.body;

        // Check Email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'A valid email is required' });
        }

        const exist = await Account.findOne({ email });
        if (exist) {
            return res.status(400).json({ error: 'Email is already taken' });
        }

        // Check if password is strong
        if (!validator.isStrongPassword(password) || password.length <= 6) {
            return res.status(400).json({
                error: 'Password is required. Password should be at least 6 characters long, contains an uppercase and lowercase letter, and at least 1 symbol'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await hashPassword(password);

        // Create admin in database
        const admin = await Account.create({
            email,
            password: hashedPassword,
        });

        return res.json(admin);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Login Endpoint
const adminLoginAuth = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if Admin exists
        const admin = await Account.findOne({ email });

        if (!admin) {
            return res.status(400).json({ error: 'Incorrect Email or Password' });
        }

        // Check if password matches
        const match = await comparePassword(password, admin.password);

        if (!match) {
            return res.status(400).json({ error: 'Incorrect Email or Password' });
        }

        // Sign JWT token
        jwt.sign({

            email: admin.email,
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            role: admin.role

        }, process.env.JWT_SECRET, { expiresIn: '10m' }, (err, token) => {
            if (err) throw err;
            // Set cookie with token
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None'
            }).json(admin);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error submitting form.' });
    }
};

const updateAdminProfile = async (req, res) => {
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
            idNum1,
            idNum2,
            dept,
            campus
        } = req.body;

        // Log the decoded token and request body for debugging
        console.log("Decoded Token:", decoded);
        console.log("Request body:", req.body);

        // Use the email to find the user and update their profile
        const adminData = await UserInfo.findOneAndUpdate(
            { email: decoded.email },  // Match the document using the email from the token
            {
                $set: {
                    firstName,
                    lastName,
                    email,
                    idNum1,
                    idNum2,
                    dept,
                    campus
                }
            },
            { new: true }
        );

        if (!adminData) {
            return res.status(404).json({ error: 'Admin data not found' });
        }

        res.json(adminData);
    } catch (error) {
        console.error('Error updating admin data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const adminData = await UserInfo.findOne({ email: decoded.email });

        if (!adminData) {
            return res.status(404).json({ error: 'Admin data not found' });
        }

        res.json(adminData);
    } catch (error) {
        console.error('Error fetching admin data:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Logout Function
const logout = (req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'You have been logged out successfully' });
};

module.exports = {
    test,
    registerAdmin,
    adminLoginAuth,
    updateAdminProfile,
    getAdminProfile,
    logout
};