const AdminData = require('../models/Admin');

const getAdminData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Parse the page parameter from the query string
        const perPage = 5; // Number of requests per page
        const skip = (page - 1) * perPage; // Calculate the number of documents to skip

        // Fetch user information from the database
        const totalAdmins = await AdminData.countDocuments();
        const totalPages = Math.ceil(totalAdmins / perPage);
        const adminData = await AdminData.find().skip(skip).limit(perPage);

        return res.json({
            admins: adminData,
            totalPages: totalPages,
            currentPage: page,
            totalAdmins: totalAdmins
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getAdminData
};
