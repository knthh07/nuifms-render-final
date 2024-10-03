import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import ArchivePage from '../Components/Archive/ArchivePage';

const SuperAdminArchive = () => {
    return (
        <div>
            <SuperAdminSideNav />
            <div>
                <ArchivePage />
            </div>
        </div>
    );
};

export default SuperAdminArchive;
