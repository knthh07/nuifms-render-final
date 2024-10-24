import React from 'react';
import UserSideNav from '../Components/user_sidenav/UserSideNav';
import DashboardComponent from '../Components/DashboardComponent';

const SuperAdminDashboard = () => {
    return (
        <div>
            <UserSideNav />
            <div>
                <DashboardComponent />
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
