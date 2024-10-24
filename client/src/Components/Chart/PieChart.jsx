import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import axios from 'axios';

export default function PieChartGraph() {
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

  // Total job orders for calculating percentages
  const totalOrders = statusData.approved + statusData.rejected + statusData.completed + statusData.notCompleted;

  // Prepare data for PieChart with labels (legend) and percentages
  const pieData = [
    { id: 'Approved', value: statusData.approved, label: `Approved (${((statusData.approved / totalOrders) * 100).toFixed(1)}%)` },
    { id: 'Rejected', value: statusData.rejected, label: `Rejected (${((statusData.rejected / totalOrders) * 100).toFixed(1)}%)` },
    { id: 'Completed', value: statusData.completed, label: `Completed (${((statusData.completed / totalOrders) * 100).toFixed(1)}%)` },
    { id: 'Not Completed', value: statusData.notCompleted, label: `Not Completed (${((statusData.notCompleted / totalOrders) * 100).toFixed(1)}%)` },
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
      {totalOrders > 0 ? (
        <Grid container spacing={2} alignItems="center">
          {/* Pie Chart */}
          <Grid item xs={8}>
            <PieChart
              series={[{ data: pieData }]}
              width={300}
              height={200}
              sx={{
                '& .MuiChart-root': {
                  padding: '20px',
                },
                '& .MuiChart-sector': {
                  stroke: '#fff',
                  strokeWidth: 1,
                },
              }}
            />
          </Grid>

          {/* Legend */}
          <Grid item xs={4}>
            <Box>
              {pieData.map((slice) => (
                <Box key={slice.id} sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Box
                    sx={{
                      width: '15px',
                      height: '15px',
                      backgroundColor: slice.id === 'Approved' ? '#4caf50' :
                                      slice.id === 'Rejected' ? '#f44336' :
                                      slice.id === 'Completed' ? '#2196f3' : '#ff9800',
                      marginRight: '10px',
                    }}
                  />
                  <Typography>{slice.label}</Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Typography align="center" sx={{ marginTop: '20px' }}>
          No data to display.
        </Typography>
      )}
    </Box>
  );
}
