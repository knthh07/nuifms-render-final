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

// Step 1: Register User
const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email validation with regex
        const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students\.)?(national-u\.edu\.ph|nu-nazareth\.edu\.ph|nu-laguna\.edu\.ph|nu-moa\.edu\.ph|nu-fairview\.edu\.ph|nu-baliwag\.edu\.ph|nu-dasma\.edu\.ph|lipa\.nu\.edu\.ph|apc\.edu\.ph)$/;
        const isValidEmail = emailDomainRegex.test(email) && validator.isEmail(email);
        if (!isValidEmail) {
            return res.status(400).json({ error: 'Please provide a valid National University email' });
        }

        // Check if email already exists
        const existingAccount = await Account.findOne({ email });
        if (existingAccount && existingAccount.status !== 'pending') {
            return res.status(400).json({ error: 'Email is already taken.' });
        }

        // Validate password
        if (!validator.isStrongPassword(password) || password.length <= 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long and contain uppercase, lowercase letters, and at least 1 symbol.' });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create or update a pending account record
        await Account.findOneAndUpdate(
            { email },
            { email, password: hashedPassword, status: 'pending' },
            { upsert: true }
        );

        // Send OTP for verification
        const otpResponse = await sendOTP({ body: { email } }, res);
        if (otpResponse.status !== 200) {
            return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }

        return res.status(200).json({ message: 'OTP sent to your email for verification.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

// Step 2: Verify OTP
const verifyOTPSignup = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const record = await EmailVerification.findOne({ owner: email });
        if (!record || !await bcrypt.compare(otp, record.otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        // Set a token with the email for the next step, and save it to cookies
        const token = jwt.sign({ email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None'
        });

        // Remove OTP record after successful verification
        await EmailVerification.deleteOne({ owner: email });
        return res.status(200).json({ message: 'OTP verified. Proceed with additional information.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Step 3: Add User Info and Activate Account
const UserAddInfo = async (req, res) => { 
    try {
        const { firstName, lastName, dept, position, idNum1, idNum2 } = req.body;

        if (!firstName || !lastName || !dept || !position || !idNum1 || !idNum2) {
            return res.json({ error: 'All fields are required.' });
        }

        if (!/^\d{2}$/.test(idNum1) || !/^\d{4}$/.test(idNum2)) {
            return res.status(400).json({ error: 'ID Numbers must be in the correct format.' });
        }

        const idNum = `${idNum1}-${idNum2}`;
        const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token must be provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        if (await UserInfo.findOne({ idNum })) {
            return res.json({ error: 'An ID Number with the same value already exists.' });
        }

        await UserInfo.create({ role: decoded.role, firstName, lastName, email, dept, position, idNum });
        await Account.findOneAndUpdate({ email }, { status: 'active' });

        res.clearCookie('token');
        return res.json({ message: 'Additional information submitted successfully! Your account is now active.' });
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};

const loginAuth = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user in Account
    const userData = await Account.findOne({ email });
    if (!userData) {
      return res.json({ error: 'User does not exist in the database.' });
    }

    // Check if active
    if (userData.status !== 'active') {
      return res.json({ error: 'Your account is not active. Please contact your administrator.' });
    }

    // Check password
    const match = await comparePassword(password, userData.password);
    if (!match) {
      return res.json({ error: 'Incorrect username or password' });
    }

    // Find additional user info
    const userInfo = await UserInfo.findOne({ email });

    if (!userInfo) {
      return res.json({ error: 'User information not found. Please contact administrator.' });
    }

    // Create JWT and return full info
    jwt.sign({ email: userData.email, role: userData.role }, process.env.JWT_SECRET, (err, token) => {
      if (err) throw err;

      return res
        .cookie('token', token, {
          httpOnly: true,
          secure: true,
          sameSite: 'None'
        })
        .json({
          user: { ...userData.toObject(), ...userInfo.toObject() }, // Merge both user data
          role: userData.role
        });
    });

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
        const perPage = 25;
        const skip = (page - 1) * perPage;

        // Define the query to fetch job orders specific to the user and status 'completed' or 'rejected'
        const query = {
            userId, // Filter by the logged-in user's ID
            status: { $in: ['completed', 'rejected', 'notCompleted', 'pending', 'ongoing'] }
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
    UserAddInfo,
    verifyOTPSignup,
    loginAuth,
    updateProfile,
    forgotPassword,
    sendOTP,
    resetPassword,
    verifyOTP,
    logout,
    getHistory,
    getRole,
    changePassword
};
