import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import ViewUserFeedback from '../Components/ViewUserFeedback';

const SuperAdminArchive = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <ViewUserFeedback />
            </div>
        </div>
    );
};

export default SuperAdminArchive;
