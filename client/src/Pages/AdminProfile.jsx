import React from 'react';
import SideNav from '../Components/sidenav/SideNav';
import Profile from '../Components/Profile';

const AdminProfile = () => {
    return (
        <div>
            <SideNav />
            <div>
                <Profile />
            </div>
        </div>
    );
};

export default AdminProfile;
