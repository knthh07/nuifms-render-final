import React from 'react';
import { Button } from "@mui/material";
import ArchivePage from '../Components/ArchivePage';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon
import { Link } from 'react-router-dom';
import LayoutComponent from "../Components/LayoutComponent";

const Archive = () => {
    return (
        <LayoutComponent>
            <div>
                <div className="flex items-center p-4"> {/* Align buttons horizontally */}
                    {/* Back Button */}
                    <Link to="/AdminHomePage" className="text-decoration-none">
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
                <ArchivePage />
            </div>
        </LayoutComponent>
    );
};

export default Archive;
