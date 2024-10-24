import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import axios from 'axios';

export default function PieChartGraph() {  // No need to pass userId
  const [statusData, setStatusData] = useState({
    approved: 0,
    rejected: 0,
    completed: 0,
    notCompleted: 0,
  });

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const response = await axios.get(`/api/status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,  // JWT token passed in header
          },
        });
        setStatusData(response.data);
      } catch (error) {
        console.error('Error fetching job order status counts:', error);
      }
    };

    fetchStatusCounts();
  }, []);

  // Prepare data for PieChart
  const pieData = [
    { id: 'Approved', value: statusData.approved },
    { id: 'Rejected', value: statusData.rejected },
    { id: 'Completed', value: statusData.completed },
    { id: 'Not Completed', value: statusData.notCompleted },
  ];

  return (
    <Box
      sx={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
      }}
    >
      <Typography variant="h6" align="center" sx={{ marginBottom: '10px' }}>
        Job Order Status
      </Typography>
      <PieChart
        series={[{ data: pieData }]}
        width={400}
        height={200}
        sx={{
          '& .MuiChart-root': {
            padding: '20px',
          },
          '& .MuiChart-sector': {
            stroke: '#fff',
            strokeWidth: 1,
          },
          '& .MuiChart-label': {
            fontSize: '0.875rem',
            fontWeight: '500',
            fill: '#333',
          },
        }}
      />
    </Box>
  );
}
