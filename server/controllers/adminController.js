const Admin = require('../models/Admin'); // Adjust the path according to your project structure

// Update admin
const updateAdmin = async (req, res) => {
    const { idNum } = req.params;
    const { firstName, lastName, email } = req.body;

    try {
        const admin = await Admin.findOneAndUpdate({ idNum }, { firstName, lastName, email }, { new: true });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error updating admin', error });
    }
};

// Delete admin
const deleteAdmin = async (req, res) => {
    const { idNum } = req.params;

    try {
        const admin = await Admin.findOneAndDelete({ idNum });
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting Admin', error });
    }
};

module.exports = {
    updateAdmin,
    deleteAdmin
};
