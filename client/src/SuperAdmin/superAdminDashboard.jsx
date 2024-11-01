import React from 'react';
import {
    Button,
} from '@mui/material';
import DashboardComponent from '../Components/DashboardComponent';
import LayoutComponent from '../Components/LayoutComponent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
    return (
        <LayoutComponent>
            <div className="flex items-center p-4"> {/* Align buttons horizontally */}
                {/* Back Button */}
                <Link to="/SuperAdminHomePage" className="text-decoration-none">
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #3f51b5', // Primary color border
                            color: '#3f51b5',
                            '&:hover': {
                                backgroundColor: '#3f51b5', // Darken on hover
                                color: '#fff', // Change text color on hover
                            },
                            marginRight: '16px', // Space between the back button and the title
                        }}
                    >
                        Back
                    </Button>
                </Link>
            </div>
            <div>
                <DashboardComponent />
            </div>
        </LayoutComponent>
    );
};

export default SuperAdminDashboard;
