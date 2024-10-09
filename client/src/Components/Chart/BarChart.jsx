import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';

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
    <Box 
      sx={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Render the heading */}
      <Typography 
        variant="h6" 
        component="h2" 
        sx={{ 
          marginBottom: '10px', 
          textAlign: 'center', 
          fontSize: '1.5rem',
          fontWeight: '600'
        }}
      >
        Number of Job Requests in a Semester per Department
      </Typography>

      {/* Load the chart after the initial content */}
      {isChartVisible && (
        <BarChart
          width={600}
          height={300}
          data={data.chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          style={{ margin: '0 auto' }} // Centering the chart
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Legend />
          {data.semesters.map((semester, index) => (
            <Bar key={semester} dataKey={semester} fill={['#4caf50', '#ff9800', '#f44336', '#2196f3'][index % 4]} />
          ))}
        </BarChart>
      )}
    </Box>
  );
}
