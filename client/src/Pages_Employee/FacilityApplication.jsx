import React from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FacilityJobOrderForm from '../Components/formsComponents/facilityJobOrderForm';
import LayoutComponent from '../Components/LayoutComponent';
const FacilityApplication = () => {
    return (
        <>
            <LayoutComponent>
                <div className="flex items-center p-4">
                    <Link to="/FacilitiesDashboardComponent" className="text-decoration-none">
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
                    <FacilityJobOrderForm />
                </div>
            </LayoutComponent>
        </>
    );
};

export default FacilityApplication;
