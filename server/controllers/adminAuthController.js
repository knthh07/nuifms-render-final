const validator = require('validator');
const Admin = require('../models/Admin');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is working');
};

// Register Endpoint
const registerAdmin = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            idNum1,
            idNum2,
            dept,
            campus
        } = req.body;

        // Check if name is entered
        if (!firstName || !lastName) {
            return res.status(400).json({ error: 'Admin Full Name is required' });
        }

        const nameExists = await Admin.findOne({ firstName, lastName });
        if (nameExists) {
            return res.status(400).json({ error: 'User Name is already taken' });
        }

        // Check Email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'A valid email is required' });
        }

        const exist = await Admin.findOne({ email });
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

        if (!idNum1 || !idNum2 ) {
            return res.status(400).json({ error: 'ID Number is required' });
        }

        const idNum = `${idNum1}-${idNum2}`;

        // Check if an admin with the same ID Number already exists
        const exist2 = await Admin.findOne({ idNum });

        if (exist2) {
            return res.json({ error: 'An ID Number with the same value already exists.' });
        }

        if (!dept) {
            return res.status(400).json({ error: 'Department is required' });
        }
        if (!campus) {
            return res.status(400).json({ error: 'Campus is required' });
        }

        // Create admin in database
        const admin = await Admin.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            idNum,
            dept,
            campus
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
        const admin = await Admin.findOne({ email });

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

        }, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) throw err;
            // Set cookie with token
            res.cookie('token', token, { httpOnly: true }).json(admin);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error submitting form.' });
    }
};

// Update Admin Profile
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

        const adminData = await Admin.findOneAndUpdate(
            { _id: decoded.id },
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

        const adminData = await Admin.findOne({ email: decoded.email });

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