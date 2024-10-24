import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import DashboardComponent from '../Components/DashboardComponent';

const SuperAdminDashboard = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <DashboardComponent />
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
