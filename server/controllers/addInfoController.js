const jwt = require('jsonwebtoken');
const UserInfo = require('../models/UserInfo');
const Account = require('../models/Account');

const UserAddInfo = async (req, res) => {
    try {
        const { firstName, lastName, dept, position, idNum1, idNum2 } = req.body;

        if (!firstName) {
            return res.json({ error: 'First Name is required.' });
        }
        
        if (!lastName) {
            return res.json({ error: 'Last Name is required.' });
        }
        
        if (!dept) {
            return res.json({ error: 'Department is required' });
        }

        if (!position) {
            return res.json({ error: 'Position is required' });
        }

        if (!idNum1 || !idNum2) {
            return res.json({ error: 'ID Number is required' });
        }

        // Validate ID Numbers
        if (!/^\d{2}$/.test(idNum1) || !/^\d{4}$/.test(idNum2)) {
            return res.status(400).json({ error: 'ID Numbers must be in the correct format.' });
        }

        const idNum = `${idNum1}-${idNum2}`;

        // Decode the token to get the user's email
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        const role = decoded.role;

        // Check if a user with the same ID Number already exists
        const exist = await UserInfo.findOne({ idNum });

        if (exist) {
            return res.json({ error: 'An ID Number with the same value already exists.' });
        }

        // Create user in database (Table)
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
        await Account.findOneAndUpdate(
            { email }, // Find the account by email
            { status: 'active' } // Set the status to active
        );

        // Clear the authentication cookie
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
