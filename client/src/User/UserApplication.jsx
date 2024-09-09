import React, { useState } from 'react';
import { Box, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import UserSideNav from '../Components/user_sidenav/UserSideNav';
import JobOrderForm from '../Components/formsComponents/jobOrderForm';
import BorrowForm from '../Components/formsComponents/borrowForm';
import MaintenanceForm from '../Components/formsComponents/maintenanceForm';

const UserApplication = () => {
    const [selectedForm, setSelectedForm] = useState('JobOrderForm');

    const handleChange = (event) => {
        setSelectedForm(event.target.value);
    };

    const renderForm = () => {
        switch (selectedForm) {
            case 'JobOrderForm':
                return <JobOrderForm />;
            case 'BorrowForm':
                return <BorrowForm />;
            case 'MaintenanceForm':
                return <MaintenanceForm />;
            default:
                return <JobOrderForm />;
        }
    };

    return (
        <Box display="flex" flexDirection="row">
            <UserSideNav />
            <Box flex="1" display="flex" flexDirection="column">
                <Box display="left" justifyContent="center" mt={4} ml={53}>
                    <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                        <InputLabel id="form-select-label">Select Form</InputLabel>
                        <Select
                            labelId="form-select-label"
                            id="form-select"
                            value={selectedForm}
                            onChange={handleChange}
                            label="Select Form"
                        >
                            <MenuItem value="JobOrderForm">Job Order Form</MenuItem>
                            <MenuItem value="BorrowForm">Borrow Form</MenuItem>
                            <MenuItem value="MaintenanceForm">Maintenance Form</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box mt={3} px={3}>
                    {renderForm()}
                </Box>
            </Box>
        </Box>
    );
};

export default UserApplication;
