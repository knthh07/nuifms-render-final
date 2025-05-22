import React from 'react';
import CampusManagement from '../Components/CampusManagement';
import { Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button } from '@mui/material';
import LayoutComponent from '../Components/LayoutComponent';

const SuperAdminCampusManagement = () => {
    return (
        <LayoutComponent>
            <div>
                <Link to="/SuperAdminDashboard" className="text-decoration-none">
                    <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />}
                        sx={{
                            padding: '6px 12px', borderRadius: '8px', border: '1px solid #3f51b5', color: '#3f51b5',
                            '&:hover': { backgroundColor: '#3f51b5', color: '#fff' }, marginLeft: '24px', marginTop: '16px'
                        }}>
                        Back
                    </Button>
                </Link>
                <CampusManagement />
            </div>
        </LayoutComponent>
    );
};

export default SuperAdminCampusManagement;
