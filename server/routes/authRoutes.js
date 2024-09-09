const express = require('express');
const router = express.Router();
const cors = require('cors');
const { test, registerUser, loginAuth, getProfile, logout, updateUserProfile, getHistory } = require('../controllers/authControllers');
const { registerAdmin, adminLoginAuth, getAdminProfile, updateAdminProfile } = require('../controllers/adminAuthController');
const { registerSuperAdmin, superAdminLoginAuth, updateSuperAdminProfile, getSuperAdminProfile } = require('../controllers/superAdminAuthController');
const { UserAddInfo } = require('../controllers/addInfoController');
const { getUsersData } = require('../controllers/userTable');
const { getAdminData } = require('../controllers/adminTable');
const { AddJobOrder, getRequests, approveRequest, rejectRequest, getJobOrders, updateJobOrder, deleteJobOrder,
    completeJobOrder, getApplicationCount, updateJobOrderTracking, getJobOrderTracking, getJobOrdersByDate,
    getJobRequestsByDepartment, submitFeedback, getFeedbacks, getJobRequestsByDepartmentAndSemester, analyzeJobOrders, getReports } = require('../controllers/jobOrderController');
const { deleteUser, updateAdmin, deleteAdmin, addUser, addUserInfo } = require('../controllers/userController');
const authMiddleware = require('../middleware/requireAuth');
const getProfileConsolidated = require('../controllers/profileController');

const { jobOrdersUpload, profileUploads } = require('../controllers/uploadController');
const { uploadProfile, updateProfilePicture, updateProfilePictureSuperAdmin, updateProfilePictureUser } = require('../controllers/uploadProfileController');

const { forgotPassword } = require ('../controllers/forgotPassword');
const { verifyOTP } = require('../controllers/verifyOTP');
const { resetPassword } = require('../controllers/resetPassword');

// Configure CORS middleware
const corsOptions = {
    origin: 'http://localhost:5173', // Update this with your client's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Add the allowed HTTP methods
    credentials: true // Allow credentials (cookies, authorization headers)
};

router.use(cors(corsOptions));

// user routes
router.get('/', test);
router.post('/signup', registerUser);
router.post('/login', loginAuth);
router.post('/addInfo', UserAddInfo);
router.get('/profileUser', authMiddleware(), getProfile);
router.put('/updateProfileUser', authMiddleware(['user']), updateUserProfile);
router.get('/history', authMiddleware(['user']), getHistory);

// OTP 
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);


// admin routes
router.post('/signupAdmin', authMiddleware(['superAdmin']), registerAdmin);
router.post('/loginAdmin', adminLoginAuth);
router.get('/profileAdmin', authMiddleware(['admin']), getAdminProfile);
router.put('/updateProfileAdmin', authMiddleware(['admin']), updateAdminProfile);

// super admin routes
router.post('/signupSuperAdmin', registerSuperAdmin);
router.post('/loginSuperAdmin', superAdminLoginAuth);
router.get('/profileSuperAdmin', authMiddleware(['superAdmin']), getSuperAdminProfile);
router.put('/updateProfileSuperAdmin', authMiddleware(['superAdmin']), updateSuperAdminProfile);

// acct mgmt
router.get('/users', authMiddleware(['admin', 'superAdmin']), getUsersData);
// router.put('/users/:email', authMiddleware(['user', 'admin', 'superAdmin']), updateUser); 
router.delete('/users/:email', authMiddleware(['admin', 'superAdmin']), deleteUser);
router.post('/addUser', authMiddleware(['admin', 'superAdmin']), addUser);
router.post('/addUserInfo', authMiddleware(['admin', 'superAdmin']), addUserInfo);

router.get('/admins', authMiddleware(['superAdmin']), getAdminData);
router.put('/admins/:email', authMiddleware(['superAdmin']), updateAdmin);
router.delete('/admins/:email', authMiddleware(['superAdmin']), deleteAdmin);

// JobOrder route
// router.post('/addJobOrder', authMiddleware(), upload.single('file'), AddJobOrder);
router.get('/requests', authMiddleware(['admin', 'superAdmin']), getRequests);
router.patch('/requests/:id/approve', authMiddleware(['admin', 'superAdmin']), approveRequest);
router.patch('/requests/:id/reject', authMiddleware(['admin', 'superAdmin']), rejectRequest);
router.get('/jobOrders', authMiddleware(), getJobOrders);
router.patch('/jobOrders/:id/update', authMiddleware(['admin', 'superAdmin']), updateJobOrder);
router.patch('/jobOrders/:id/delete', authMiddleware(['admin', 'superAdmin']), deleteJobOrder);
router.patch('/jobOrders/:id/complete', authMiddleware(['admin', 'superAdmin']), completeJobOrder);
router.get('/jobOrders/count', authMiddleware(['admin', 'superAdmin']), getApplicationCount);
router.patch('/jobOrders/:id/tracking', authMiddleware(['admin', 'superAdmin']), updateJobOrderTracking);
router.get('/jobOrders/:id/tracking', authMiddleware(), getJobOrderTracking);
router.put('/jobOrders/:id/feedback', authMiddleware(), submitFeedback);
router.get('/feedbacks', authMiddleware(['admin', 'superAdmin']), getFeedbacks);

// report
router.get('/report', authMiddleware(), getReports);

// upload files
router.post('/addJobOrder', authMiddleware(), jobOrdersUpload.single('file'), AddJobOrder);
router.post('/uploadProfilePicture', authMiddleware(), profileUploads.single('profilePicture'), updateProfilePicture);
router.post('/uploadProfilePictureSuperAdmin', authMiddleware(), profileUploads.single('profilePicture'), updateProfilePictureSuperAdmin);
router.post('/uploadProfilePictureUser', authMiddleware(), profileUploads.single('profilePicture'), updateProfilePictureUser);

router.post('/logout', logout);

//experiment
router.get('/profile', authMiddleware(), getProfileConsolidated);

// charts
router.get('/jobOrders/byDate', authMiddleware(), getJobOrdersByDate);
router.get('/jobOrders/byDepartment', authMiddleware(), getJobRequestsByDepartment);
router.get('/jobOrders/ByDepartmentAndSemester', authMiddleware(), getJobRequestsByDepartmentAndSemester);
router.get('/analytics/analyzeJobOrders', authMiddleware(), analyzeJobOrders);

module.exports = router;