import React, { useState } from 'react';
import { Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import UserSideNav from '../Components/user_sidenav/UserSideNav';
import JobOrderForm from '../Components/formsComponents/jobOrderForm';
import BorrowForm from '../Components/formsComponents/borrowForm';
import MaintenanceForm from '../Components/formsComponents/maintenanceForm';

const UserApplication = () => {
    return (
        <div>
            <UserSideNav />
            <div>
                <JobOrderForm />
            </div>
        </div>
    );
};

export default UserApplication;
