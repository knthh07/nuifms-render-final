import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import Profile from '../Components/Profile';

const SuperAdminProfile = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <Profile />
            </div>
        </div>
    );
};

export default SuperAdminProfile;
