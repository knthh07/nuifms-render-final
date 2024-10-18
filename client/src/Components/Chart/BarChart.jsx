import React from 'react';
import { Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function BarChartGraph({ data }) {
  return (
    <>
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

      {data.chartData.length > 0 && ( // Check if there's data to display
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
    </>
  );
}
