import React from 'react';
import UserSideNav from '../Components/user_sidenav/UserSideNav';
import UserDashboardComponent from '../Components/UserDashboardComponent';

const SuperAdminDashboard = () => {
  return (
    <div>
      <UserSideNav />
      <div>
        <UserDashboardComponent />
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
