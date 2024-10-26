import React from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuthContextProvider } from './context/AuthContext';

import Login from './Pages/login/Login';
import Signup from './Pages/Signup';
import ForgotPass from './Pages/ForgotPass';
import AddInfo from './Pages/AdditionalInfo';

import Dashboard from './Pages/Dashboard';
import JobOrder from './Pages/jobOrder';
import AdminApplicationPage from './Pages/ApplicationPage';
import Feedback from './Pages/Feedback';
import AdminProfile from './Pages/AdminProfile';
import Report from './Pages/Reports';
import Archive from './Pages/Archive';
import ManageAcc from './Pages/manageAcc';
import AdminJobOrderTracking from './Pages/AdminJobOrderTracking';

import SuperAdminDashboard from './SuperAdmin/superAdminDashboard';
import SuperAdminProfile from './SuperAdmin/SuperAdminProfile';
import SuperAdminManagementPage from './SuperAdmin/manageAccAdmin';
import SuperAdminJobOrderTracking from './SuperAdmin/SuperAdminJobOrderTracking';
import SuperAdminApplicationPage from './SuperAdmin/SuperAdminApplicationPage';
import SuperAdminJobOrder from './SuperAdmin/SuperAdminJobOrdersPage';
import SuperAdminArchive from './SuperAdmin/SuperAdminArchive';
import SuperAdminFeedback from './SuperAdmin/SuperAdminFeedback';
import SuperAdminReport from './SuperAdmin/SuperAdminReport';

import UserDashboard from './User/UserDashboard';
import UserApplication from './User/UserApplication';
import UserProfile from './User/UserProfile';
import UserHistory from './User/UserHistory';
import UserTrackOrder from './User/UserTrackOrder';

import ProtectedRoutes from './hooks/ProtectedRoutes';
axios.defaults.baseURL = 'https://nuifms.onrender.com/';
axios.defaults.baseURL = 'https://nuifms-9d4130efadd1.herokuapp.com/';
// axios.defaults.baseURL = 'http://localhost:5080/';
axios.defaults.withCredentials = true;

function App() {
  return (
    <div>
      <AuthContextProvider>
        <Toaster position='top-left' toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotPass" element={<ForgotPass />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/addInfo" element={<AddInfo />} />

          {/* Protected Routes for Admin */}
          <Route element={<ProtectedRoutes allowedRoles={['admin']} />}>
            <Route path="/AdminDashboard" element={<Dashboard />} />
            <Route path="/jobOrder" element={<JobOrder />} />
            <Route path="/application" element={<AdminApplicationPage />} />
            <Route path="/tracking" element={<AdminJobOrderTracking />} />
            <Route path="/report" element={<Report />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/manageAcc" element={<ManageAcc />} />
            <Route path="/profile" element={<AdminProfile />} />
          </Route>

          {/* Protected Routes for Super Admin */}
          <Route element={<ProtectedRoutes allowedRoles={['superAdmin']} />}>
            <Route path="/SuperAdminDashboard" element={<SuperAdminDashboard />} />
            <Route path="/SuperAdminProfile" element={<SuperAdminProfile />} />
            <Route path="/SuperAdminManagementPage" element={<SuperAdminManagementPage />} />
            <Route path="/SuperAdminTracking" element={<SuperAdminJobOrderTracking />} />
            <Route path="/SuperAdminApplicationPage" element={<SuperAdminApplicationPage />} />
            <Route path="/SuperAdminJobOrder" element={<SuperAdminJobOrder />} />
            <Route path="/SuperAdminArchive" element={<SuperAdminArchive />} />
            <Route path="/SuperAdminFeedback" element={<SuperAdminFeedback />} />
            <Route path="/SuperAdminReport" element={<SuperAdminReport />} />
          </Route>

          {/* Protected Routes for User */}
          <Route element={<ProtectedRoutes allowedRoles={['user']} />}>
            <Route path="/UserDashboard" element={<UserDashboard />} />
            <Route path="/UserApplication" element={<UserApplication />} />
            <Route path="/UserHistory" element={<UserHistory />} />
            <Route path="/UserProfile" element={<UserProfile />} />
            <Route path="/UserTrackOrder" element={<UserTrackOrder />} />
          </Route>
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
