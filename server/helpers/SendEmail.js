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
        
        // Plain text version (important for email clients that don't support HTML)
        const textMessage = `
Dear User,

To verify your email address, please use the following One-Time Pin (OTP):

${otp}

This OTP is valid for the next 10 minutes. Please do not share this code with anyone.

If you did not request this verification, please ignore this email.

Best regards,
Physical Facilities Management Office
        `;

        // HTML version with styling
        const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin-bottom: 10px;">Email Verification</h1>
            <p style="color: #7f8c8d;">Your One-Time Pin (OTP) for verification</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin-bottom: 25px; text-align: center;">
            <p style="margin-bottom: 15px;">Please use the following verification code:</p>
            <div style="background-color: #f0f4f8; display: inline-block; padding: 15px 25px; border-radius: 5px; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #2c3e50;">
                ${otp}
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #e74c3c;">Valid for 10 minutes only</p>
        </div>
        
        <div style="margin-bottom: 25px;">
            <p style="margin-bottom: 10px;">Dear User,</p>
            <p>We received a request to verify your email address. If you didn't make this request, please ignore this email or contact support if you have concerns.</p>
        </div>
        
        <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; font-size: 12px; color: #7f8c8d;">
            <p style="margin: 0;">Best regards,</p>
            <p style="margin: 0; font-weight: bold;">Physical Facilities Management Office</p>
            <p style="margin-top: 10px;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
        `;

        // Send OTP email with both HTML and text versions
        await transporter.sendMail({
            from: process.env.SMTP_USERNAME,
            to: email,
            subject,
            text: textMessage,
            html: htmlMessage
        });

    } catch (error) {
        console.log('Error sending email:', error);
        throw error; // Consider throwing the error so calling functions can handle it
    }
};

// Function to send a general email
const sendGeneralEmail = async (email, subject, message, htmlMessage) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USERNAME,
            to: email,
            subject: subject,
            text: message, // plain text version (required)
        };

        // Add HTML version if provided
        if (htmlMessage) {
            mailOptions.html = htmlMessage;
        }

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.log('Error sending email:', error);
        throw error; // Consider throwing the error so calling functions can handle it
    }
};

module.exports = {
    sendEmailVerification,
    sendGeneralEmail
};
