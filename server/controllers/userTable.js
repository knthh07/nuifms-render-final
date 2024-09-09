const User = require('../models/User');
const UserInfo = require('../models/AddInfo'); // Ensure this is the correct path

// Endpoint to fetch and combine users and admins
const getUsersData = async (req, res) => {
    try {
        const { page = 1, limit = 6 } = req.query;
        const skip = (page - 1) * limit;

        // Fetch users and userInfo based on email
        const users = await User.find().skip(skip).limit(Number(limit));
        const userEmails = users.map(user => user.email);

        // Fetch corresponding userInfo for these emails
        const userInfos = await UserInfo.find({ email: { $in: userEmails } });

        // Combine data
        const combinedData = users.map(user => {
            const userInfo = userInfos.find(info => info.email === user.email);
            return {
                ...user.toObject(),
                idNum: userInfo ? userInfo.idNum : null,
                position: userInfo ? userInfo.position: null,
                dept: userInfo ? userInfo.dept: null
            };
        });

        // Respond with combined data
        res.json({
            users: combinedData,
            totalPages: Math.ceil((await User.countDocuments() + await UserInfo.countDocuments()) / limit),
            currentPage: Number(page)
        });
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).send('Server error');
    }
};

module.exports = { getUsersData };
