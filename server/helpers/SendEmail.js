const nodemailer = require('nodemailer');
require('dotenv').config({ path: '../.env' });  // Corrected dotenv import
const bcrypt = require('bcryptjs');
const EmailVerification = require('../models/EmailVerificationToken');

// Set up transporter with Gmail SMTP settings
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,  // Fixed typo in 'port'
    secure: true,  // Set to true if using port 465, otherwise false for 587
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
});

const sendEmailVerification = async (email) => {
    try {
        // Generate OTP and hash it
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
        const hashedOTP = await bcrypt.hash(otp, 12);

        // Check if a record already exists for this email
        const userRecord = await EmailVerification.findOne({ owner: email });

        if (!userRecord) {
            // Create new record if none exists
            await EmailVerification.create({
                owner: email,
                otp: hashedOTP,
            });
        } else {
            // Update existing record
            await EmailVerification.updateOne({ owner: email }, { otp: hashedOTP });
        }

        // Email content
        const subject = 'Email Verification - Your One-Time Pin (OTP)';
        const message = `
        Dear User,
  
        To verify your email address, please use the following One-Time Pin (OTP):
  
        **${otp}**
  
        This OTP is valid for the next 10 minutes. Please do not share this code with anyone.
  
        If you did not request this verification, please ignore this email.
  
        Best regards,
        Physical Facilities Management Office
      `;

        // Send OTP email
        await transporter.sendMail({
            from: process.env.SMTP_USERNAME,
            to: email,
            subject,
            text: message,
        });

    } catch (error) {
        console.log('Error sending email:', error);
    }
};

// Function to send a general email
const sendGeneralEmail = async (email, subject, message) => {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USERNAME,
            to: email,
            subject: subject,
            text: message,
        });
        console.log('General email sent successfully');
    } catch (error) {
        console.log('Error sending general email:', error);
    }
};

module.exports = {
    sendEmailVerification,
    sendGeneralEmail
};
