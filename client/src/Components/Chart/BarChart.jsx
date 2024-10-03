import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import axios from 'axios';
import './barchart.css';  // Import the external CSS

export default function BarChartGraph() {
  const [data, setData] = useState({
    semesters: [],
    chartData: []
  });

  const [isChartVisible, setIsChartVisible] = useState(false); // Defer chart loading

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

    // Defer chart rendering for better LCP
    const timer = setTimeout(() => {
      setIsChartVisible(true);
    }, 500); // Delay chart load slightly

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box className="bar-chart-container">
      {/* Render the heading first */}
      <h2>
        Number of Job Requests in a Semester per Department
      </h2>

      {/* Load the chart after the initial content */}
      {isChartVisible && (
        <BarChart
          series={data.chartData}
          height={250}
          xAxis={[{ data: data.semesters, scaleType: 'band' }]}
          margin={{ top: 100, bottom: 50, left: 60, right: 20 }}
          colors={['#4caf50', '#ff9800', '#f44336', '#2196f3']}
          sx={{
            '& .MuiChart-legend': 'chart-legend',
            '& .MuiChart-root': 'chart-root',
            '& .MuiChart-bar': 'chart-bar',
            '& .MuiChart-xAxis, & .MuiChart-yAxis': {
              '& .MuiChart-tickLabel': 'chart-axis-label',
            },
          }}
        />
      )}
    </Box>
  );
}
