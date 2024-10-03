import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import JobOrderTable from '../Components/JobOrder/JobOrderPage';

const SuperAdminJobOrder = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <JobOrderTable />
            </div>
        </div>
    );
};

export default SuperAdminJobOrder;
