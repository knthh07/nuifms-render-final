import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import ArchivePage from '../Components/Archive/ArchivePage';

const SuperAdminArchive = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div className="w-[77%] ml-[21.5%] mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
                <ArchivePage />
            </div>
        </div>
    );
};

export default SuperAdminArchive;
