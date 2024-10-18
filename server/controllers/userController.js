const Account = require('../models/Account'); // Adjust the path according to your project structure
const UserInfo = require('../models/UserInfo'); // Adjust the path according to your project structure
const validator = require('validator');
const { hashPassword, comparePassword } = require('../helpers/auth');

// Account Management

// Delete user
const deleteUser = async (req, res) => {
    const { email } = req.params;

    try {
        const user = await Account.findOneAndDelete({ email });
        const userData = await UserInfo.findOneAndDelete({ email });
        if (!user || !userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

const deleteAdmin = async (req, res) => {
    const { email } = req.params;

    try {
        const admin = await Account.findOneAndDelete({ email });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Admin', error });
    }
};

const addUser = async (req, res) => {
    try {
        const { role, email, password, confirmPassword } = req.body;

        if (!validator.isEmail(email)) {
            return res.json({ error: 'A valid email is required' });
        }

        const exist = await Account.findOne({ email });
        if (exist) {
            return res.json({ error: 'Email is already taken' });
        }

        if (!validator.isStrongPassword(password) || password.length <= 6) {
            return res.json({
                error: 'Password should be at least 6 characters long, contain an uppercase, lowercase letter, and at least 1 symbol'
            });
        }

        if (password !== confirmPassword) {
            return res.json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await hashPassword(password);

        // Create the user in the Account collection
        const user = await Account.create({
            role,
            email,
            password: hashedPassword
        });

        await user.save();

        // Respond with the newly created user and email
        res.json({ user, email });

    } catch (error) {
        console.log(error);
        return res.json({ error: 'An unexpected error occurred while creating the user' });
    }
};

const addUserInfo = async (req, res) => {
    try {
        const { firstName, lastName, dept, position, idNum1, idNum2, email } = req.body;

        // Validation checks
        if (!firstName || !lastName || !dept || !position || !idNum1 || !idNum2 || !email) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Validate ID Numbers
        if (!/^\d{2}$/.test(idNum1) || !/^\d{4}$/.test(idNum2)) {
            return res.status(400).json({ error: 'ID Numbers must be in the correct format.' });
        }

        const idNum = `${idNum1}-${idNum2}`;

        // Check if a user with the same ID Number already exists
        const exist = await UserInfo.findOne({ idNum });
        if (exist) {
            return res.json({ error: 'An ID Number with the same value already exists.' });
        }

        // Verify if the email exists in the Account collection
        const user = await Account.findOne({ email });
        if (!user) {
            return res.json({ error: 'User with this email does not exist' });
        }

        // Create user info in the UserInfo collection
        const userInfo = await UserInfo.create({
            firstName,
            lastName,
            email,
            dept,
            position,
            idNum
        });

        await userInfo.save();

        // Optionally, update the account status to 'active'
        await Account.findOneAndUpdate({ email }, { status: 'active' });

        // Respond with the created user info
        return res.json({ message: 'User information added successfully!', userInfo });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'An unexpected error occurred while creating user info' });
    }
};

// Endpoint to fetch and combine users with role 'user'
const getUsersData = async (req, res) => {
    try {
        const { page = 1, limit = 6 } = req.query;
        const skip = (page - 1) * limit;

        // Fetch users with role 'user' and paginate the results
        const users = await Account.find({ role: 'user' })
            .skip(skip)
            .limit(Number(limit));

        // Extract the emails of the fetched users
        const userEmails = users.map(user => user.email);

        // Fetch corresponding userInfo for these emails
        const userInfos = await UserInfo.find({ email: { $in: userEmails } });

        // Combine data
        const combinedData = users.map(user => {
            const userInfo = userInfos.find(info => info.email === user.email);
            return {
                ...user.toObject(),
                firstName: userInfo ? userInfo.firstName : null,
                lastName: userInfo ? userInfo.lastName : null,
                idNum: userInfo ? userInfo.idNum : null,
                position: userInfo ? userInfo.position : null,
                dept: userInfo ? userInfo.dept : null
            };
        });

        // Respond with combined data and pagination info
        res.json({
            users: combinedData,
            totalPages: Math.ceil(await Account.countDocuments({ role: 'user' }) / limit), // Count only users with role 'user'
            currentPage: Number(page)
        });
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).send('Server error');
    }
};

const getAdminData = async (req, res) => {
    try {
        const { page = 1, limit = 6 } = req.query;
        const skip = (page - 1) * limit;

        // Fetch admin with role 'user' and paginate the results
        const admins = await Account.find({ role: 'admin' })
            .skip(skip)
            .limit(Number(limit));

        // Extract the emails of the fetched admin
        const adminEmails = admins.map(admin => admin.email);

        // Fetch corresponding adminInfos for these emails
        const adminInfos = await UserInfo.find({ email: { $in: adminEmails } });

        // Combine data
        const combinedData = admins.map(admin => {
            const adminInfo = adminInfos.find(info => info.email === admin.email);
            return {
                ...admin.toObject(),
                firstName: adminInfo ? adminInfo.firstName : null,
                lastName: adminInfo ? adminInfo.lastName : null,
                idNum: adminInfo ? adminInfo.idNum : null,
                position: adminInfo ? adminInfo.position : null,
                dept: adminInfo ? adminInfo.dept : null
            };
        });

        // Respond with combined data and pagination info
        res.json({
            admins: combinedData,
            totalPages: Math.ceil(await Account.countDocuments({ role: 'admin' }) / limit), // Count only admin with role 'admin'
            currentPage: Number(page)
        });
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).send('Server error');
    }
};

module.exports = {
    deleteUser,
    deleteAdmin,
    addUser,
    addUserInfo,
    getUsersData,
    getAdminData
};
