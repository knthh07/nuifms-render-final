import { Routes, Route } from "react-router-dom";
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuthContextProvider } from "./context/AuthContext";

import Login from "./Pages/login/Login";
import Signup from "./Pages/Signup";
import ForgotPass from "./Pages/ForgotPass";
import Dashboard from "./Pages/Dashboard";
import JobOrder from "./Pages/jobOrder";
import Requests from "./Pages/Requests";
import Feedback from "./Pages/Feedback";
import Profile from "./Pages/Profile";
import Report from "./Pages/Reports";
import Archive from "./Pages/Archive";
import ManageAcc from "./Pages/manageAcc";
import AddInfo from "./Pages/AdditionalInfo";
import AdminJobOrderTracking from "./Pages/AdminJobOrderTracking";
import ResetPassword from "./Pages/ResetPassword";

import SuperAdminDashboard from "./SuperAdmin/superAdminDashboard";
import SuperAdminProfile from "./SuperAdmin/SuperAdminProfile";
import SuperAdminManagementPage from "./SuperAdmin/manageAccAdmin";
import SuperAdminJobOrderTracking from "./SuperAdmin/SuperAdminJobOrderTracking";
import SuperAdminRequests from "./SuperAdmin/SuperAdminRequests";
import SuperAdminJobOrder from "./SuperAdmin/SuperAdminJobOrdersPage";
import SuperAdminArchive from "./SuperAdmin/SuperAdminArchive";
import SuperAdminFeedback from "./SuperAdmin/SuperAdminFeedback";
import SuperAdminReport from "./SuperAdmin/SuperAdminReport";

import UserDashboard from "./User/UserDashboard";
import UserApplication from "./User/UserApplication";
import UserProfile from "./User/UserProfile";
import UserHistory from "./User/UserHistory";
import UserTrackOrder from "./User/UserTrackOrder";

axios.defaults.baseURL = 'http://localhost:5080';
axios.defaults.withCredentials = true;

function App() {

  return (

    <div>
      <AuthContextProvider>

        {/* Notification */}
        <Toaster position='top-left' toastOptions={{ duration: 3000 }} />
        <Routes>

          {/* Login and Signup */}
          <Route index path='/' element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/addInfo" element={<AddInfo />} />

          {/* Admin Side Interface */}
          <Route path="/AdminDashboard" element={<Dashboard />} />
          <Route path="/jobOrder" element={<JobOrder />} />
          <Route path="/request" element={<Requests />} />
          <Route path="/tracking" element={<AdminJobOrderTracking />} />
          <Route path="/report" element={<Report />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/manageAcc" element={<ManageAcc />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/report" element={<Report />} />

          {/* Super Admin Side Interface */}
          <Route path="/SuperAdminDashboard" element={<SuperAdminDashboard />} />
          <Route path="/SuperAdminProfile" element={<SuperAdminProfile />} />
          <Route path="/SuperAdminManagementPage" element={<SuperAdminManagementPage />} />
          <Route path="/SuperAdminTracking" element={<SuperAdminJobOrderTracking />} />
          <Route path="/SuperAdminRequests" element={<SuperAdminRequests />} />
          <Route path="/SuperAdminJobOrder" element={<SuperAdminJobOrder />} />
          <Route path="/SuperAdminArchive" element={<SuperAdminArchive />} />
          <Route path="/SuperAdminFeedback" element={<SuperAdminFeedback />} />
          <Route path="/SuperAdminReport" element={<SuperAdminReport />} />
          {/* Same functions as admin but with some additional functions only available to super admins */}

          {/* User Side Interface */}
          <Route path="/UserDashboard" element={<UserDashboard />} />
          <Route path="/UserApplication" element={<UserApplication />} />
          <Route path="/UserHistory" element={<UserHistory />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          <Route path="/UserTrackOrder" element={<UserTrackOrder />} />

        </Routes>

      </AuthContextProvider>


    </div>
  );
}

export default App;
