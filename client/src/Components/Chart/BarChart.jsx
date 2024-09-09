import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import axios from 'axios';

export default function BarChartGraph() {
  const [data, setData] = useState({
    semesters: [],
    chartData: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/jobOrders/ByDepartmentAndSemester');
        setData(response.data);
      } catch (error) {
        console.error("Error fetching job requests data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box
      sx={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
      }}
    >
      <Typography variant="h6" align="center" sx={{ marginBottom: '10px' }}>
        Number of Job Requests in a Semester per Department
      </Typography>
      <BarChart
        series={data.chartData}
        height={250}
        xAxis={[{ data: data.semesters, scaleType: 'band' }]}
        margin={{ top: 100, bottom: 50, left: 60, right: 20 }}
        colors={['#4caf50', '#ff9800', '#f44336', '#2196f3']}
        sx={{
          '& .MuiChart-legend': {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
          },
          '& .MuiChart-root': {
            padding: '20px',
          },
          '& .MuiChart-bar': {
            borderRadius: '4px',
          },
          '& .MuiChart-xAxis, & .MuiChart-yAxis': {
            '& .MuiChart-tickLabel': {
              fontSize: '0.875rem',
              fontWeight: '500',
              fill: '#333',
            },
          },
        }}
      />
    </Box>
  );
}
