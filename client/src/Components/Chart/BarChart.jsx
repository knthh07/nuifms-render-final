import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import axios from 'axios';
import Loader from '../../hooks/Loader';
import { toast } from 'react-hot-toast';

export default function BarChartGraph() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobOrdersCount = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/countByDepartment');

        // Check if the response data is an array
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          console.error('Unexpected data format:', response.data);
          setData([]); // Set to empty array if data format is unexpected
        }
      } catch (err) {
        console.error('Error fetching job orders count:', err);
        setError(err.message); // Set error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobOrdersCount();
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
        Number of Job Requests Per Department
      </Typography>
      {error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        data.length > 0 ? (
          <BarChart
            width={600}  // Increased chart width
            height={240} // Increased chart height for better slice separation
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            style={{ margin: '0 auto' }} // Center the chart
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis domain={[0, 'dataMax + 10']} /> {/* Explicitly setting the Y-axis domain */}
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#4caf50" />
          </BarChart>
        ) : (
          <Typography align="center">No job orders found for any department.</Typography>
        )
      )}
      <Loader isLoading={isLoading} />
    </Box>
  );
}
