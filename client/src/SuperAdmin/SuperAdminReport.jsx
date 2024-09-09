import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import CreateReport from '../Components/CreateReport';

const SuperAdminReport = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <CreateReport />
            </div>
        </div>
    );
};

export default SuperAdminReport;
