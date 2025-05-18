const express = require("express");
const router = express.Router();
const cors = require("cors");
const { registerUser, UserAddInfo, verifyOTPSignup, loginAuth, updateProfile, forgotPassword, sendOTP, resetPassword, verifyOTP, logout, getHistory, getRole, changePassword } = require("../controllers/authControllers");
const { AddJobOrder, getRequests, approveRequest, rejectRequest, followUpJobOrder, getJobOrders, getJobOrdersArchive, updateJobOrder, completeWithRemarks, completeJobOrder, getApplicationCount, getJobOrderTracking, updateJobOrderTracking, getUserJobOrdersByDate, getUserJobOrders, submitFeedback, getFeedbacks, getJobRequestsByDepartmentAndSemester, getReports, getStatusCounts, getAllStatusCounts, getJobOrdersCountByDepartment, getStatusUsers, StatusList, getUsersJobOrders, getUserStatusCounts } = require("../controllers/jobOrderController");
const { activateUser, deactivateUser, deleteUser, addUser, addUserInfo, getUsersData, getAdminData } = require("../controllers/userController");
const authMiddleware = require("../middleware/requireAuth");
const { getProfileConsolidated } = require("../controllers/profileController");
const { jobOrdersUpload, profileUploads } = require("../controllers/uploadController");
const { uploadProfile, updateProfilePicture, updateProfilePictureSuperAdmin, updateProfilePictureUser } = require("../controllers/uploadProfileController");
const { createCampus, getAllCampuses, updateCampus, deleteCampus, createBuilding, updateBuilding, deleteBuilding, createFloor, updateFloor, deleteFloor, createOffice, updateOffice, deleteOffice, getOffices } = require("../controllers/entity");
const { analytics } = require("../controllers/Analytics");

const corsOptions = { origin: "http://localhost:5173", methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], credentials: true };
router.use(cors(corsOptions));

// User routes
router.post("/signup", registerUser);
router.post("/login", loginAuth);
router.post("/addInfo", UserAddInfo);
router.get("/history", authMiddleware(["user"]), getHistory);
router.put("/changePassword", authMiddleware(), changePassword);

// Profile
router.get("/profile", getProfileConsolidated);
router.put("/updateProfile", authMiddleware(), updateProfile);

// OTP
router.post("/forgot-password", forgotPassword);
router.post("/signupOTP", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/verify-otp-signup", verifyOTPSignup);
router.post("/reset-password", resetPassword);

// Account management
router.get("/users", authMiddleware(["admin", "superAdmin"]), getUsersData);
router.post("/addUser", authMiddleware(["admin", "superAdmin"]), addUser);
router.post("/addUserInfo", authMiddleware(["admin", "superAdmin"]), addUserInfo);
router.get("/admins", authMiddleware(["superAdmin"]), getAdminData);
router.put("/users/:email/deactivate", authMiddleware(["admin", "superAdmin"]), deactivateUser);
router.put("/admins/:email/deactivate", authMiddleware(["superAdmin"]), deactivateUser);
router.put("/users/:email/activate", authMiddleware(["admin", "superAdmin"]), activateUser);
router.put("/admins/:email/activate", authMiddleware(["superAdmin"]), activateUser);
router.delete("/users/:email", authMiddleware(["admin", "superAdmin"]), deleteUser);
router.delete("/admins/:email", authMiddleware(["superAdmin"]), deleteUser);

// JobOrder routes
router.get("/requests", authMiddleware(["admin", "superAdmin"]), getRequests);
router.patch("/requests/:id/approve", authMiddleware(["admin", "superAdmin"]), approveRequest);
router.patch("/requests/:id/reject", authMiddleware(["admin", "superAdmin"]), rejectRequest);
router.post("/jobOrders/:id/follow-up", authMiddleware(), followUpJobOrder);
router.get("/jobOrders", authMiddleware(), getJobOrders);
router.get("/archive", authMiddleware(), getJobOrdersArchive);
router.patch("/jobOrders/:id/update", authMiddleware(["admin", "superAdmin"]), updateJobOrder);
router.patch("/jobOrders/:id/completeRemarks", authMiddleware(["admin", "superAdmin"]), completeWithRemarks);
router.patch("/jobOrders/:id/complete", authMiddleware(["admin", "superAdmin"]), completeJobOrder);
router.get("/jobOrders/count", authMiddleware(["admin", "superAdmin"]), getApplicationCount);
router.patch("/jobOrders/:id/tracking", authMiddleware(["admin", "superAdmin"]), updateJobOrderTracking);
router.get("/jobOrders/:id/tracking", authMiddleware(), getJobOrderTracking);
router.put("/jobOrders/:id/feedback", authMiddleware(), submitFeedback);
router.get("/feedbacks", authMiddleware(["admin", "superAdmin"]), getFeedbacks);
router.get("/status", authMiddleware(), getStatusCounts);
router.get("/allStatus", authMiddleware(["admin", "superAdmin"]), getAllStatusCounts);
router.get("/department", authMiddleware(), getJobOrdersCountByDepartment);
router.get("/countByDepartment", authMiddleware(), getJobOrdersCountByDepartment);
router.get("/getStatusUsers", authMiddleware(), getStatusUsers);
router.get("/statusList", authMiddleware(), StatusList);
router.get('/getUserJobOrders', authMiddleware(), getUserJobOrders);
router.get('/user/status-counts', getUserStatusCounts);

// Report
router.get("/report", authMiddleware(), getReports);

// Upload files
router.post("/addJobOrder", authMiddleware(), jobOrdersUpload.single("file"), AddJobOrder);
router.post("/uploadProfilePicture", authMiddleware(), profileUploads.single("profilePicture"), updateProfilePicture);
router.post("/uploadProfilePictureSuperAdmin", authMiddleware(), profileUploads.single("profilePicture"), updateProfilePictureSuperAdmin);
router.post("/uploadProfilePictureUser", authMiddleware(), profileUploads.single("profilePicture"), updateProfilePictureUser);

// Entity management
router.post("/campuses", authMiddleware(), createCampus);
router.get("/campuses", authMiddleware(), getAllCampuses);
router.put("/campuses/:campusId", authMiddleware(), updateCampus);
router.delete("/campuses/:campusId", authMiddleware(), deleteCampus);
router.post("/campuses/:campusId/buildings", authMiddleware(), createBuilding);
router.put("/campuses/:campusId/buildings/:buildingId", authMiddleware(), updateBuilding);
router.delete("/campuses/:campusId/buildings/:buildingId", authMiddleware(), deleteBuilding);
router.post("/campuses/:campusId/buildings/:buildingId/floors", authMiddleware(), createFloor);
router.put("/campuses/:campusId/buildings/:buildingId/floors/:floorId", authMiddleware(), updateFloor);
router.delete("/campuses/:campusId/buildings/:buildingId/floors/:floorId", authMiddleware(), deleteFloor);
router.post("/campuses/:campusId/buildings/:buildingId/floors/:floorId/offices", authMiddleware(), createOffice);
router.put("/campuses/:campusId/buildings/:buildingId/floors/:floorId/offices/:officeId", authMiddleware(), updateOffice);
router.delete("/campuses/:campusId/buildings/:buildingId/floors/:floorId/offices/:officeId", authMiddleware(), deleteOffice);
router.get("/offices", getOffices);

// Miscellaneous
router.post("/logout", logout);
router.get("/jobOrders/byUserByDate", authMiddleware(), getUserJobOrdersByDate);
router.get("/jobOrders/byUser", authMiddleware(), getUserJobOrders);
router.get("/jobOrders/ByDepartmentAndSemester", authMiddleware(), getJobRequestsByDepartmentAndSemester);
router.get("/analytics", authMiddleware(), analytics);
router.get("/getRole", getRole);

module.exports = router;