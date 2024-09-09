const jwt = require('jsonwebtoken');
const UserInfo = require('../models/AddInfo');

const UserAddInfo = async (req, res) => {
    try {
        const { dept, position, idNum1, idNum2 } = req.body;

        // Check if dept is entered
        if (!dept) {
            return res.json({ error: 'Department is required' });
        }

        // Check if position is entered
        if (!position) {
            return res.json({ error: 'Position is required' });
        }

        // Check if idNum1 and idNum2 are entered
        if (!idNum1 || !idNum2) {
            return res.json({ error: 'ID Number is required' });
        }

        // Validate ID Numbers
        if (!/^\d{2}$/.test(idNum1)) {
            return res.json({ error: 'ID Number 1 must be exactly 2 digits' });
        }
        if (!/^\d{4}$/.test(idNum2)) {
            return res.json({ error: 'ID Number 2 must be exactly 4 digits' });
        }

        const idNum = `${idNum1}-${idNum2}`;

        // Decode the token to get the user's email
        const { token } = req.cookies;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // Check if a user with the same ID Number already exists
        const exist = await UserInfo.findOne({ idNum });

        if (exist) {
            return res.json({ error: 'An ID Number with the same value already exists.' });
        }

        // Create user in database (Table)
        const userInfo = await UserInfo.create({
            email,  // Include the email here
            dept,
            position,
            idNum
        });

        await userInfo.save();
        return res.json(userInfo);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    UserAddInfo
};
