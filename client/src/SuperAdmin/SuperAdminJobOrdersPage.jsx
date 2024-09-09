import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import JobOrderTable from '../Components/JobOrder/JobOrderPage';

const SuperAdminJobOrder = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div className="w-[77%] ml-[21.5%] mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
                <JobOrderTable />
            </div>
        </div>
    );
};

export default SuperAdminJobOrder;
