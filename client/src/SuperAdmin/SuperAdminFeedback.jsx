import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import ViewUserFeedback from '../Components/ViewUserFeedback';

const SuperAdminFeedback = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <ViewUserFeedback />
            </div>
        </div>
    );
};

export default SuperAdminFeedback;
