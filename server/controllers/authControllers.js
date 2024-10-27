const bcrypt = require('bcryptjs'); //library

//database
const validator = require('validator');
const Account = require('../models/Account');
const UserInfo = require('../models/UserInfo');
const JobOrder = require('../models/jobOrder');
const EmailVerification = require('../models/EmailVerificationToken');

//helpers
const { sendEmailVerification } = require('../helpers/SendEmail');
const { hashPassword, comparePassword } = require('../helpers/auth');
const jwt = require('jsonwebtoken');

const test = (req, res) => {
    res.json('test is working');
};

const registerUser = async (req, res) => { // /api/signup
    try {
        const { email, password } = req.body;

        // Email domain validation regex
        const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students\.)?national-u\.edu\.ph$/;

        // Validation checks
        if (!emailDomainRegex.test(email)) {
            return res.status(400).json({ error: 'Please provide a valid email.' });
        }

        // Check if email already exists
        if (await Account.findOne({ email })) {
            return res.status(400).json({ error: 'Email is already taken.' });
        }

        // Strong password validation
        if (!validator.isStrongPassword(password) || password.length <= 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long, contain uppercase, lowercase letters, and at least 1 symbol.' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Store the user data as pending
        await Account.create({ email, password: hashedPassword });

        // Call sendOTP to send an OTP for email verification
        const otpResponse = await sendOTP({ body: { email } }, res);
        if (otpResponse.status !== 200) {
            return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }

        // Respond to the user indicating that the OTP has been sent
        return res.status(200).json({ message: 'OTP sent to your email for verification.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const loginAuth = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if User exists
        const userData = await Account.findOne({ email: email });

        if (!userData) {
            return res.json({
                error: 'User does not exist in the database.'
            });
        }

        // Check if the user account is active
        if (userData.status !== 'active') {
            return res.json({
                error: 'Your account is not active. Please contact your administrator.'
            });
        }

        const match = await comparePassword(password, userData.password);
        if (!match) {
            return res.json({
                error: 'Incorrect username or password'
            });
        }

        if (match) {
            jwt.sign({ email: userData.email, role: userData.role }, process.env.JWT_SECRET, (err, token) => {
                if (err) throw err;
                return res.cookie('token', token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None'
                }).json({ user: userData, role: userData.role });
            });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error. Please try again later.' });
    }
};

const updateProfile = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { firstName, lastName, email, dept } = req.body;

        // Use the email from the token to find the user and update their profile
        const userData = await UserInfo.findOneAndUpdate(
            { email: decoded.email },  // Match the document using the email from the token
            { $set: { firstName, lastName, email, dept } },  // Update common fields
            { new: true }
        );

        if (!userData) {
            return res.status(404).json({ error: 'User data not found' });
        }

        res.json(userData);
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getRole = async (req, res) => {
    const { token } = req.cookies;
    try {
        if (token) {
            const decode = jwt.verify(token, process.env.JWT_SECRET)
            const role = await Account.findOne({ email: decode.email });
            return res.json(role.role)
        }
        else {
            return res.json(null)
        }
    }
    catch {
    }
}

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await Account.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send OTP to user's email
        await sendEmailVerification(email);

        res.status(200).json({ message: 'OTP sent to your email address' });
    } catch (error) {
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

const sendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        // Send OTP to user's email
        await sendEmailVerification(email);

        // Return a response object instead of sending it directly
        return { status: 200, message: 'OTP sent to your email address' };
    } catch (error) {
        return { status: 500, message: 'Server error, please try again later' };
    }
};

const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Find OTP record in the database
        const record = await EmailVerification.findOne({ owner: email });
        if (!record) {
            return res.status(404).json({ message: 'Invalid OTP or email' });
        }

        // Compare OTP with hashed value in the database
        const isMatch = await bcrypt.compare(otp, record.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        await Account.updateOne({ email }, { password: hashedPassword });

        // Delete the OTP record after a successful password reset
        await EmailVerification.deleteOne({ owner: email });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find OTP record in the database
        const record = await EmailVerification.findOne({ owner: email });
        if (!record) {
            return res.status(404).json({ message: 'Invalid OTP or email' });
        }

        // Compare OTP with hashed value in the database
        const isMatch = await bcrypt.compare(otp, record.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is correct, proceed with password reset or other action
        res.status(200).json({ message: 'OTP verified successfully' });

        // Do NOT delete the OTP record here. It will be deleted after the password is reset.
        // await EmailVerification.deleteOne({ owner: email });
    } catch (error) {
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

const verifyOTPSignup = async (req, res) => { // /api/verify-otp-signup
    const { email, otp } = req.body;

    try {
        // Find OTP record in the database
        const record = await EmailVerification.findOne({ owner: email });
        if (!record) {
            return res.status(404).json({ message: 'Invalid OTP or email' });
        }

        // Compare OTP with hashed value in the database
        const isMatch = await bcrypt.compare(otp, record.otp);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // OTP is correct, proceed with token creation
        const token = jwt.sign({ email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Adjust role as necessary

        // Set the token in cookies
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None'
        });

        // Delete the OTP record after successful verification
        await EmailVerification.deleteOne({ owner: email });

        return res.status(200).json({ message: 'OTP verified successfully. Please proceed with registration.' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error, please try again later.' });
    }
};

const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Secure only in production
        sameSite: 'None' // Apply sameSite to match login and register
    });
    return res.json({ message: 'You have been logged out successfully' });
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
            status: { $in: ['completed', 'rejected', 'notCompleted'] }
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

const changePassword = async (req, res) => {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { currentPassword, newPassword } = req.body;

        // Find the user account based on the email from the decoded token
        const account = await Account.findOne({ email: decoded.email });

        if (!account) {
            return res.status(404).json({ error: 'Account not found.' });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, account.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect.' });
        }

        // Validate new password strength
        if (!validator.isStrongPassword(newPassword) || newPassword.length <= 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long, contain uppercase, lowercase letters, and at least 1 symbol.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        account.password = hashedPassword;
        await account.save();

        // Send success message to the frontend
        return res.status(200).json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ error: 'An error occurred while changing the password.' });
    }
};

module.exports = {
    registerUser,
    loginAuth,
    updateProfile,
    forgotPassword,
    sendOTP,
    resetPassword,
    verifyOTP,
    verifyOTPSignup,
    logout,
    getHistory,
    getRole,
    changePassword
};
