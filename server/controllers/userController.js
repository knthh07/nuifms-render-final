const User = require('../models/User'); // Adjust the path according to your project structure
const UserInfo = require('../models/AddInfo'); // Adjust the path according to your project structure
const Admin = require('../models/Admin')
const validator = require('validator');
const { hashPassword, comparePassword } = require('../helpers/auth');

// Account Management
// Update user
// const updateUser = async (req, res) => {
//     const { email } = req.params;
//     const { firstName, lastName } = req.body; // Adjusted to receive firstName and lastName

//     try {
//         const user = await User.findOneAndUpdate(
//             { email },
//             { firstName, lastName, email, dept },
//             { new: true }
//         );
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }
//         res.json(user);
//     } catch (error) {
//         res.status(500).json({ message: 'Error updating user', error });
//     }
// };


// Delete user
const deleteUser = async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOneAndDelete({ email });
        const userData = await UserInfo.findOneAndDelete({ email });
        if (!user || !userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

const updateAdmin = async (req, res) => {
    const { email } = req.params;
    const { firstName, lastName } = req.body; // Adjusted to receive firstName and lastName

    try {
        const admin = await Admin.findOneAndUpdate(
            { email },
            { firstName, lastName, email },
            { new: true }
        );
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error updating Admin', error });
    }
};

const deleteAdmin = async (req, res) => {
    const { email } = req.params;

    try {
        const admin = await Admin.findOneAndDelete({ email });
        if (!admin ) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Admin', error });
    }
};

const addUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        // Validate input
        if (!firstName || !lastName) {
            return res.json({ error: 'Name is required' });
        }
        if (!validator.isEmail(email)) {
            return res.json({ error: 'A valid email is required' });
        }
        const exist = await User.findOne({ email });
        if (exist) {
            return res.json({ error: 'Email is already taken' });
        }
        if (!validator.isStrongPassword(password) || password.length <= 6) {
            return res.json({
                error: 'Password should be at least 6 characters long, contains an ' +
                    'uppercase and lowercase letter, and at least 1 symbol'
            });
        }
        if (password !== confirmPassword) {
            return res.json({ error: 'Passwords do not match' });
        }

        const hashedPassword = await hashPassword(password);

        // Create user in database
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await user.save();

        // Respond with the new user data including email
        res.json({ user, email });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

const addUserInfo = async (req, res) => {
    try {
        const { email, dept, position, idNum1, idNum2 } = req.body;

        // Validate input
        if (!dept) {
            return res.status(400).json({ error: 'Department is required' });
        }
        if (!position) {
            return res.status(400).json({ error: 'Position is required' });
        }
        if (!idNum1 || !idNum2) {
            return res.status(400).json({ error: 'ID Number is required' });
        }

        // Validate ID Numbers
        if (!/^\d{2}$/.test(idNum1)) {
            return res.status(400).json({ error: 'ID Number 1 must be exactly 2 digits' });
        }
        if (!/^\d{4}$/.test(idNum2)) {
            return res.status(400).json({ error: 'ID Number 2 must be exactly 4 digits' });
        }

        const idNum = `${idNum1}-${idNum2}`;

        // Check if a user with the same ID Number already exists
        const exist = await UserInfo.findOne({ idNum });

        if (exist) {
            return res.status(400).json({ error: 'An ID Number with the same value already exists.' });
        }

        // Check if the email is valid and exists in the User collection
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User with this email does not exist' });
        }

        // Create user info in database
        const userInfo = await UserInfo.create({
            email, // Use the email from the request body
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
    // updateUser,
    deleteUser,
    updateAdmin,
    deleteAdmin,
    addUser,
    addUserInfo
};
