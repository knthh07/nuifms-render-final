import React from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import { AuthContextProvider } from './context/AuthContext';

import UserHomePage from './Components/homepage/UserHomePage';
import AdminHomePage from './Components/homepage/AdminHomePage';
import SuperAdminHomePage from './Components/homepage/SuperAdminHomePage';

import CampusManagement from './Components/CampusManagement';
import CreateReport from './Components/CreateReport';
import DashboardComponent from './Components/DashboardComponent';
import AnalyticsDashboard from './Components/DataAnalytics/AnalyticsDashboard';

import Login from './Pages/login/Login';
import Signup from './Pages/Signup';
import ForgotPass from './Pages/ForgotPass';
import AddInfo from './Pages/AdditionalInfo';
import Profile from './Components/Profile';

import Dashboard from './Pages/Dashboard';
import JobOrder from './Pages/jobOrder';
import AdminApplicationPage from './Pages/ApplicationPage';
import Feedback from './Pages/Feedback';
import Archive from './Pages/Archive';
import ManageAcc from './Pages/manageAcc';
import AdminJobOrderTracking from './Pages/AdminJobOrderTracking';

import SuperAdminDashboard from './SuperAdmin/superAdminDashboard';
import SuperAdminManagementPage from './SuperAdmin/manageAccAdmin';
import SuperAdminJobOrderTracking from './SuperAdmin/SuperAdminJobOrderTracking';
import SuperAdminApplicationPage from './SuperAdmin/SuperAdminApplicationPage';
import SuperAdminJobOrder from './SuperAdmin/SuperAdminJobOrdersPage';
import SuperAdminArchive from './SuperAdmin/SuperAdminArchive';
import SuperAdminFeedback from './SuperAdmin/SuperAdminFeedback';

import UserDashboard from './User/UserDashboard';
import UserApplication from './User/UserApplication';
import UserHistory from './User/UserHistory';
import UserTrackOrder from './User/UserTrackOrder';
import UserDashboardComponent from './Components/UserDashboardComponent';

import ProtectedRoutes from './hooks/ProtectedRoutes';
// axios.defaults.baseURL = 'https://nuifms.onrender.com/';
/* axios.defaults.baseURL = 'https://nuifms-9d4130efadd1.herokuapp.com/'; */
axios.defaults.baseURL = 'http://localhost:5080/';
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


          <Route element={<ProtectedRoutes allowedRoles={['superAdmin', 'admin']} />}>
            <Route path="/campus-management" element={<CampusManagement />} />
            <Route path="/CreateReport" element={<CreateReport />} />
            <Route path="/DashboardComponent" element={<DashboardComponent />} />
            <Route path="/AnalyticsDashboard" element={<AnalyticsDashboard />} />
          </Route>

          <Route element={<ProtectedRoutes allowedRoles={['superAdmin', 'admin', 'user']} />}>
            <Route path="/AllProfile" element={<Profile />} />
          </Route>

          {/* Protected Routes for Admin */}
          <Route element={<ProtectedRoutes allowedRoles={['admin']} />}>
            <Route path="/AdminHomePage" element={<AdminHomePage />} />
            <Route path="/AdminDashboard" element={<Dashboard />} />
            <Route path="/jobOrder" element={<JobOrder />} />
            <Route path="/application" element={<AdminApplicationPage />} />
            <Route path="/tracking" element={<AdminJobOrderTracking />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/manageAcc" element={<ManageAcc />} />
          </Route>

          {/* Protected Routes for Super Admin */}
          <Route element={<ProtectedRoutes allowedRoles={['superAdmin']} />}>
            <Route path="/SuperAdminHomePage" element={<SuperAdminHomePage />} />
            <Route path="/SuperAdminDashboard" element={<SuperAdminDashboard />} />
            <Route path="/SuperAdminManagementPage" element={<SuperAdminManagementPage />} />
            <Route path="/SuperAdminTracking" element={<SuperAdminJobOrderTracking />} />
            <Route path="/SuperAdminApplicationPage" element={<SuperAdminApplicationPage />} />
            <Route path="/SuperAdminJobOrder" element={<SuperAdminJobOrder />} />
            <Route path="/SuperAdminArchive" element={<SuperAdminArchive />} />
            <Route path="/SuperAdminFeedback" element={<SuperAdminFeedback />} />
          </Route>

          {/* Protected Routes for User */}
          <Route element={<ProtectedRoutes allowedRoles={['user']} />}>
            <Route path="/UserHomePage" element={<UserHomePage />} />
            <Route path="/UserDashboardComponent" element={<UserDashboardComponent />} />
            <Route path="/UserApplication" element={<UserApplication />} />
            <Route path="/UserHistory" element={<UserHistory />} />
            <Route path="/UserTrackOrder" element={<UserTrackOrder />} />
          </Route>
        </Routes>
      </AuthContextProvider>
    </div>
  );
}

export default App;
