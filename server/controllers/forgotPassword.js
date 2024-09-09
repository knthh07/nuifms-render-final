const express = require('express');
const { sendEmailVerification } = require('../helpers/SendEmail');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerificationToken');

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
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

module.exports = {
    forgotPassword
};
