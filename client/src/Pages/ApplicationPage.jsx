import React from 'react';
import SideNav from '../Components/sidenav/SideNav';
import ApplicationPage from '../Components/ApplicationPage';

const AdminApplicationsPage = () => {
    return (
        <div>
            <SideNav />
            <div>
                <ApplicationPage />
            </div>
        </div>
    );
};

export default AdminApplicationsPage;
