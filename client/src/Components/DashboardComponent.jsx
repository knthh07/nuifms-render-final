import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button } from '@mui/material';
import JobOrderTable from './JobOrder/JobOrderPage';

const DashboardComponent = () => {
  return (
    <div className="flex flex-col p-4"> {/* Added padding for spacing */}
      <div className="flex items-center justify-between mb-4"> {/* Align items with space between */}
        
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
          
          <Link to="/CreateReport" className="text-decoration-none">
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
      <JobOrderTable />
    </div>
  );
};

export default DashboardComponent;
