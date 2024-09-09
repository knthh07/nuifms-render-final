import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import JobOrderTracking from '../Components/JobOrderTracking';

const SuperAdminJobOrderTracking = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <JobOrderTracking />
            </div>
        </div>
    );
};

export default SuperAdminJobOrderTracking;
