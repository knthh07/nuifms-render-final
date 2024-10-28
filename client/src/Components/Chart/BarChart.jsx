import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import Loader from '../../hooks/Loader';

export default function BarChartGraph() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobOrdersCount = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/countByDepartment');

        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          console.error('Unexpected data format:', response.data);
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching job orders count:', err);
        setError(err.message);
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
        width: '100%',
        height: '100%', // Ensure full height for container
      }}
    >
      <Typography variant="h6" align="center" sx={{ marginBottom: '10px' }}>
        Number of Job Requests Per Department
      </Typography>
      {error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}> {/* Responsive container for full width */}
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis domain={[0, 'dataMax + 10']} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Typography align="center">No job orders found for any department.</Typography>
        )
      )}
      <Loader isLoading={isLoading} />
    </Box>
  );
}
