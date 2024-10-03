import React from 'react';
import SideNav from '../Components/sidenav/SideNav';
import CreateReport from '../Components/CreateReport';

const Report = () => {
    return (
        <div>
            <SideNav />
            <div>
                <CreateReport />
            </div>
        </div>
    );
};

export default Report;
