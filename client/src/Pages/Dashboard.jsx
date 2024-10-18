import React from 'react';
import SideNav from '../Components/sidenav/SideNav';
import DashboardComponent from '../Components/DashboardComponent';

const Dashboard = () => {
    return (
        <div>
            <SideNav />
            <div>
                <DashboardComponent />
            </div>
        </div>
    );
};

export default Dashboard;
