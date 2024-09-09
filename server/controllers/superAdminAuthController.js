const validator = require('validator');
const SuperAdmin = require('../models/SuperAdmin');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is working');
};

// Register Endpoint
const registerSuperAdmin = async (req, res) => {
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
            return res.status(400).json({ error: 'Super Admin Full Name is required' });
        }

        const nameExists = await SuperAdmin.findOne({ firstName, lastName });
        if (nameExists) {
            return res.status(400).json({ error: 'User Name is already taken' });
        }

        // Check Email
        if (!validator.isEmail(email)) {
            return res.status(400).json({ error: 'A valid email is required (Ex. user@national-u.edu.ph)' });
        }
        const exist = await SuperAdmin.findOne({ email });
        if (exist) {
            return res.status(400).json({ error: 'Email is already taken' });
        }

        // Check if password is strong
        if (!validator.isStrongPassword(password) || password.length <= 6) {
            return res.status(400).json({
                error: 'Password is required. Password should be at least' +
                    ' 6 characters long, contains an uppercase and lowercase letter, and at least 1 symbol'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await hashPassword(password);

        if (!idNum1 || !idNum2) {
            return res.status(400).json({ error: 'ID Number is required' });
        }

        const idNum = `${idNum1}-${idNum2}`;

        // Check if an admin with the same ID Number already exists
        const exist2 = await SuperAdmin.findOne({ idNum });
        if (exist2) {
            return res.json({ error: 'An ID Number with the same value already exists.' });
        }

        if (!dept) {
            return res.status(400).json({ error: 'Department is required' });
        }
        if (!campus) {
            return res.status(400).json({ error: 'Campus is required' });
        }

        // Create admin in database (Table)
        const superAdmin = await SuperAdmin.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            idNum,
            dept,
            campus
        });

        await superAdmin.save();
        return res.json(superAdmin);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const superAdminLoginAuth = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if Super Admin exists
        const superAdmin = await SuperAdmin.findOne({ email });

        if (!superAdmin) {
            return res.status(400).json({ error: 'Incorrect Email or Password' });
        }

        // Check if password matches
        const match = await comparePassword(password, superAdmin.password);

        if (!match) {
            return res.status(400).json({ error: 'Incorrect Email or Password' });
        }

        // Sign JWT token
        jwt.sign({ email: superAdmin.email, 
            id: superAdmin._id, 
            firstName: superAdmin.firstName, 
            lastName: superAdmin.lastName, 
            role: superAdmin.role }, 
            process.env.JWT_SECRET, 
            {}, (err, token) => {
            if (err) {
                console.error('JWT signing error:', err);
                return res.status(500).json({ error: 'Server error' });
            }
            // Set cookie with token
            res.cookie('token', token, { httpOnly: true }).json(superAdmin); // Set to HTTP ONLY for additional protection
        });
    } catch (error) {
        console.error('Error in super admin login:', error);
        return res.status(500).json({ error: 'Error submitting form.' });
    }
};


//update super admin profile
const updateSuperAdminProfile = async (req, res) => {
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

        const superAdminData = await SuperAdmin.findOneAndUpdate(
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

        if (!superAdminData) {
            return res.status(404).json({ error: 'Admin data not found' });
        }

        res.json(superAdminData);
    } catch (error) {
        console.error('Error updating admin data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// Endpoint getProfile with get res
const getSuperAdminProfile = async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const superAdminData = await SuperAdmin.findOne({ email: decoded.email });

        if (!superAdminData) {
            return res.status(404).json({ error: 'Super Admin data not found' });
        }

        res.json(superAdminData);
    } catch (error) {
        console.error('Error fetching super admin data:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// Logout function
const logout = (req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'You have been logged out successfully' });
};

module.exports = {
    test,
    registerSuperAdmin,
    superAdminLoginAuth,
    updateSuperAdminProfile,
    getSuperAdminProfile,
    logout
};
