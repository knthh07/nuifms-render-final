import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import axios from 'axios';
import Loader from '../../hooks/Loader';
import { toast } from 'react-hot-toast';

export default function PieChartGraph() {
  const [statusData, setStatusData] = useState({
    approved: 0,
    rejected: 0,
    completed: 0,
    notCompleted: 0,
    pending: 0,
  });

  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/allStatus`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,  // JWT token passed in header
          },
        });
        setStatusData(response.data);
      } catch (error) {
        toast.error('Error fetching data.')
        console.error('Error fetching job order status counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatusCounts();
  }, []);

  // Total job orders for calculating percentages
  const totalOrders = statusData.approved + statusData.rejected + statusData.completed + statusData.notCompleted + statusData.pending;

  // Define the pastel/matte color palette
  const colorPalette = ['#A3D6D0', '#F3B9B0', '#E6CBA8', '#B6D5E1', '#B7BF5E'];

  // Prepare data for PieChart with percentages and matching colors
  const pieData = [
    { id: 'Approved', value: statusData.approved, color: colorPalette[0] },
    { id: 'Rejected', value: statusData.rejected, color: colorPalette[1] },
    { id: 'Completed', value: statusData.completed, color: colorPalette[2] },
    { id: 'Not Completed', value: statusData.notCompleted, color: colorPalette[3] },
    { id: 'Pending', value: statusData.pending, color: colorPalette[4] },
  ];

  // Prepare data for legend with percentages and matching colors
  const legendData = [
    { label: `Approved (${((statusData.approved / totalOrders) * 100).toFixed(1)}%)`, color: colorPalette[0] },
    { label: `Rejected (${((statusData.rejected / totalOrders) * 100).toFixed(1)}%)`, color: colorPalette[1] },
    { label: `Completed (${((statusData.completed / totalOrders) * 100).toFixed(1)}%)`, color: colorPalette[2] },
    { label: `Not Completed (${((statusData.notCompleted / totalOrders) * 100).toFixed(1)}%)`, color: colorPalette[3] },
    { label: `Pending (${((statusData.pending / totalOrders) * 100).toFixed(1)}%)`, color: colorPalette[4] },
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
              width={320}  // Increased chart width
              height={240} // Increased chart height for better slice separation
              sx={{
                '& .MuiChart-root': {
                  padding: '20px',
                },
                '& .MuiChart-sector': {
                  stroke: '#fff',
                  strokeWidth: 1,
                },
              }}
              colors={colorPalette} // Set the same color palette for the chart
            />
          </Grid>

          {/* Legend */}
          <Grid item xs={4}>
            <Box>
              {legendData.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <Box
                    sx={{
                      width: '15px',
                      height: '15px',
                      backgroundColor: item.color,
                      marginRight: '10px',
                    }}
                  />
                  <Typography>{item.label}</Typography>
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
      <Loader isLoading={isLoading} />
    </Box>
  );
}
