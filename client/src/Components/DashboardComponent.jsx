import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import JobOrderTable from './JobOrder/JobOrderPage';

const DashboardComponent = () => {
  return (
    <div className="flex flex-col p-4"> {/* Added padding for spacing */}
      <JobOrderTable />
    </div>
  );
};

export default DashboardComponent;
