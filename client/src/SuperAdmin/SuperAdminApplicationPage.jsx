import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import ApplicationPage from '../Components/ApplicationPage';

const SuperAdminApplicationPage = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <ApplicationPage />
            </div>
        </div>
    );
};

export default SuperAdminApplicationPage;
