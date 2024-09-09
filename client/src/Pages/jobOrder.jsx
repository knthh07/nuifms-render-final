import React from 'react';
import SideNav from '../Components/sidenav/SideNav';
import JobOrderTable from '../Components/JobOrder/JobOrderPage';

const JobOrder = () => {
    return (
        <div>
            <SideNav />
            <div>
                <JobOrderTable />
            </div>
        </div>
    );
};

export default JobOrder;
