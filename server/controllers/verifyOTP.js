const express = require('express');
const bcrypt = require('bcrypt');
const EmailVerification = require('../models/EmailVerificationToken');
const User = require('../models/User');

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

module.exports = {
    verifyOTP
};
