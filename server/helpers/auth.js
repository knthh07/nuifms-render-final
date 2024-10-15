const bcrypt = require('bcryptjs');
const EmailVerificationToken = require('../models/EmailVerificationToken');

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
};

const comparePassword = (password, hashed) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hashed, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });
};

const OTPChecker = async (email, otp) => {
    const userOTP = await EmailVerificationToken.finOne({owner: email});
    const isOTPCorrect = await comparePassword(otp, userOTP.Otp);

    if(!isOTPCorrect) {
        return res.json({error: 'Incorrect One Time Pin'})
    }

    await EmailVerificationToken.findOneAndDelete({Otp: userOTP.Otp})
}

module.exports = {
    hashPassword,
    comparePassword,
    OTPChecker
};
