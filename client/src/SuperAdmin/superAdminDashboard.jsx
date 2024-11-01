import React from 'react';
import { Button } from '@mui/material';
import DashboardComponent from '../Components/DashboardComponent';
import LayoutComponent from '../Components/LayoutComponent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon
import { Link } from 'react-router-dom';

const SuperAdminDashboard = () => {
    return (
        <LayoutComponent>
            <div className="flex flex-col p-4"> {/* Added padding for spacing */}

                <div className="flex items-center mb-4"> {/* Align buttons horizontally */}
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

                <div className="flex items-center justify-between"> {/* Align items with space between */}

                    {/* Status Containers */}
                    <div className="flex space-x-3"> {/* Flex container for status boxes */}
                        {["Pending", "Ongoing", "Completed", "Rejected"].map((status) => (
                            <div
                                key={status}
                                className="flex flex-col items-center justify-center border border-gray-300 rounded-lg bg-gray-100 h-10 w-32" // Style for each container
                            >
                                <span className="text-gray-600 font-medium">{status}</span>
                            </div>
                        ))}
                    </div>

                    {/* Button Group */}
                    <div className="flex space-x-2"> {/* Container for aligning buttons */}
                        <Link to="/campus-management" className="text-decoration-none">
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    '&:hover': { backgroundColor: '#2563eb' },
                                    transition: 'background-color 0.3s, transform 0.2s',
                                }}
                            >
                                Manage Campuses
                            </Button>
                        </Link>

                        <Link to="/AnalyticsDashboard" className="text-decoration-none">
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    '&:hover': { backgroundColor: '#2563eb' },
                                    transition: 'background-color 0.3s, transform 0.2s',
                                }}
                            >
                                Analytics
                            </Button>
                        </Link>

                        <Link to="/SuperAdminReport" className="text-decoration-none">
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    borderRadius: '8px',
                                    padding: '10px 20px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    '&:hover': { backgroundColor: '#2563eb' },
                                    transition: 'background-color 0.3s, transform 0.2s',
                                }}
                            >
                                Report
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <div>
                <DashboardComponent />
            </div>
        </LayoutComponent>
    );
};

export default SuperAdminDashboard;
