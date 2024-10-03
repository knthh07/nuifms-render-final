const Account = require('../models/Account');
const UserInfo = require('../models/UserInfo');
const jwt = require('jsonwebtoken');

const getProfileConsolidated = async (req, res) => {
    const { token } = req.cookies;
    try {
        if (token) {
            const decode = jwt.verify(token, process.env.JWT_SECRET);

            const userAccount = await Account.findOne({ email: decode.email });
            const userInfo = await UserInfo.findOne({ email: decode.email });

            return res.json({
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                position: userInfo.position,
                dept: userInfo.dept,
                idNum: userInfo.idNum,
                email: userInfo.email,
                profilePicture: userInfo.profilePicture  // Assuming userInfo has profilePicture
            });
        } else {
            return res.json(null);
        }
    } catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

module.exports = {
    getProfileConsolidated
};