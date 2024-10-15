const jwt = require('jsonwebtoken');
const UserInfo = require('../models/UserInfo');
const Account = require('../models/Account');

const UserAddInfo = async (req, res) => {
    try {
        const { firstName, lastName, dept, position, idNum1, idNum2 } = req.body;

        // Validation checks...
        if (!firstName || !lastName || !dept || !position || !idNum1 || !idNum2) {
            return res.json({ error: 'All fields are required.' });
        }

        // Validate ID Numbers
        if (!/^\d{2}$/.test(idNum1) || !/^\d{4}$/.test(idNum2)) {
            return res.status(400).json({ error: 'ID Numbers must be in the correct format.' });
        }

        const idNum = `${idNum1}-${idNum2}`;

        // Get the token from cookies or headers
        const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token must be provided.' });
        }

        // Decode the token
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const role = decoded.role;

        // Check if a user with the same ID Number already exists
        const exist = await UserInfo.findOne({ idNum });

        if (exist) {
            return res.json({ error: 'An ID Number with the same value already exists.' });
        }

        // Create user in database
        const userInfo = await UserInfo.create({
            role,
            firstName,
            lastName,
            email,
            dept,
            position,
            idNum
        });

        await userInfo.save();

        // Update the account status to 'active'
        await Account.findOneAndUpdate({ email }, { status: 'active' });

        // Clear the authentication cookie for web clients
        res.clearCookie('token');

        return res.json({ message: 'Additional information submitted successfully! Your account is now active.' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    UserAddInfo
};
