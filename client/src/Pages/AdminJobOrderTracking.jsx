import React from 'react';
import SideNav from '../Components/sidenav/SideNav';
import JobOrderTracking from '../Components/JobOrderTracking';

const AdminJobOrderTracking = () => {
    return (
        <div>
            <SideNav />
            <div>
                <JobOrderTracking />
            </div>
        </div>
    );
};

export default AdminJobOrderTracking;
