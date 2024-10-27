import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const JobOrderLineChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/department'); // Adjust API endpoint as necessary

        // Check if the response is okay
        if (!response.ok) {
          const errorMessage = await response.text(); // Get the error message from the response
          console.error('Error fetching data:', response.status, errorMessage);
          setError('Failed to fetch data.');
          setLoading(false);
          return; // Exit if there's an error
        }

        // Attempt to parse the JSON response
        const result = await response.json();
        console.log('Fetched result:', result); // Log the result for debugging

        // Check if result.data is an array
        if (Array.isArray(result.data)) {
          setData(result.data);
        } else {
          console.error('Fetched data is not an array:', result.data);
          setError('Fetched data is not in the expected format.');
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Error occurred while fetching data.');
      } finally {
        setLoading(false); // Set loading to false in both success and error cases
      }
    };

    fetchData();
  }, []);

  // Debugging: log the data state
  console.log('Fetched data:', data);

  // If loading, show loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // If there's an error, show error message
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Check if data is an array
  if (!Array.isArray(data)) {
    console.error('Expected an array but received:', data);
    return <div>Error: Data is not in the expected format.</div>; // Render an error message
  }

  // Prepare data for the chart
  const processedData = data.map(item => ({
    name: item.name,  // Adjust based on your data structure
    value: item.value  // Adjust based on your data structure
  }));

  return (
    <LineChart width={600} height={300} data={processedData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  );
};

export default JobOrderLineChart;
