const Account = require('../models/Account'); // Adjust the path according to your project structure
const UserInfo = require('../models/UserInfo'); // Adjust the path according to your project structure
const { sendGeneralEmail } = require('../helpers/SendEmail'); // Import your helper function
const validator = require('validator');
const { hashPassword, comparePassword } = require('../helpers/auth');

// Account Management
const activateUser = async (req, res) => {
    const { email } = req.params;

    try {
        // Set the user's status to active
        const updatedUser = await Account.findOneAndUpdate(
            { email },
            { $set: { status: 'active' } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send email notification upon activation
        const subject = 'Your account has been activated';
        const message = `Dear User,\n\nYour account has been activated. You can now access your account.\n\nBest Regards,\nPhysical Facilities Management Office`;
        await sendGeneralEmail(updatedUser.email, subject, message);

        res.json({ message: 'User activated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error activating user', error });
    }
};

const deactivateUser = async (req, res) => {
    const { email } = req.params;

    try {
        // Set the user's status to inactive
        const updatedUser = await Account.findOneAndUpdate(
            { email },
            { $set: { status: 'inactive' } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send email notification upon deactivation
        const subject = 'Your account has been deactivated';
        const message = `Dear User,\n\nYour account has been deactivated. If you wish to reactivate it, please contact support.\n\nBest Regards,\nPhysical Facilities Management Office`;
        await sendGeneralEmail(updatedUser.email, subject, message);

        res.json({ message: 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating user', error });
    }
};

const deleteUser = async (req, res) => {
    const { email } = req.params;

    try {
        // Check if the user exists in both collections
        const user = await Account.findOne({ email });
        const userInfo = await UserInfo.findOne({ email });

        if (!user || !userInfo) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the user from both collections
        await Account.findOneAndDelete({ email });
        await UserInfo.findOneAndDelete({ email });

        // Send email notification upon deletion
        const subject = 'Your account has been deleted';
        const message = `Dear User,\n\nYour account has been deleted. If this was a mistake, please contact support.\n\nBest Regards,\nPhysical Facilities Management Office`;
        await sendGeneralEmail(email, subject, message); // Use email directly, since you already have it

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error); // Log the error for debugging
        res.status(500).json({ message: 'Error deleting user', error: error.message });
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

        if (!validator.isStrongPassword(password) || password.length <= 7) {
            return res.json({
                error: 'Password should be at least 8 characters long, contain an uppercase, lowercase letter, and at least 1 symbol'
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

        // Send email with credentials
        const subject = 'Your account has been created';
        const message = `Dear User,\n\nYour account has been created successfully.\n\nEmail: ${email}\nPassword: ${password}\n\nPlease keep your credentials safe.\n\nBest Regards,\nPhysical Facilities Management Office`;
        await sendGeneralEmail(email, subject, message);

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

const getUsersData = async (req, res) => {
    try {
        const { role } = req.params; // Get the role from the route parameters
        const { page = 1, limit = 6 } = req.query;
        const skip = (page - 1) * limit;

        // Validate the role
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }

        // Fetch accounts based on role and paginate the results
        const accounts = await Account.find({ role })
            .skip(skip)
            .limit(Number(limit));

        // Extract the emails of the fetched accounts
        const emails = accounts.map(account => account.email);

        // Fetch corresponding userInfo for these emails
        const userInfos = await UserInfo.find({ email: { $in: emails } });

        // Combine data
        const combinedData = accounts.map(account => {
            const userInfo = userInfos.find(info => info.email === account.email);
            return {
                ...account.toObject(),
                firstName: userInfo ? userInfo.firstName : null,
                lastName: userInfo ? userInfo.lastName : null,
                idNum: userInfo ? userInfo.idNum : null,
                position: userInfo ? userInfo.position : null,
                dept: userInfo ? userInfo.dept : null
            };
        });

        // Respond with combined data and pagination info
        res.json({
            [role + 's']: combinedData,
            totalPages: Math.ceil(await Account.countDocuments({ role }) / limit), // Count only based on the specified role
            currentPage: Number(page)
        });
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).send('Server error');
    }
};

// Use this route handler in your routes
// Example: router.get('/api/accounts/:role', getUserDataByRole);


module.exports = {
    activateUser,
    deactivateUser,
    deleteUser,
    addUser,
    addUserInfo,
    getUsersData
};
