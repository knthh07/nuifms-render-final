import React from 'react';
import SideNav from '../Components/sidenav/SideNav';
import DashboardComponent from '../Components/DashboardComponent';

const Dashboard = () => {
    return (
        <div className="flex h-screen">
            <SideNav />
            <div className="flex-1 p-6 bg-gray-50 rounded-lg shadow-lg">
                <DashboardComponent />
            </div>
        </div>
    );
};

export default Dashboard;
