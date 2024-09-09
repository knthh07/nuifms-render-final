// controllers/resetPassword.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerificationToken');

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
        await User.updateOne({ email }, { password: hashedPassword });

        // Delete the OTP record after a successful password reset
        await EmailVerification.deleteOne({ owner: email });

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error, please try again later' });
    }
};

module.exports = {
    resetPassword,
};
