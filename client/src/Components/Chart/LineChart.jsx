import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';

export default function LineChartGraph() {
    const [data, setData] = useState({ dates: [], counts: [] });

    useEffect(() => {
        // Fetch data from the backend for the logged-in user
        axios.get('/api/jobOrders/byUser', {
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        })
        .then(response => {
            const formattedData = response.data; // Assuming your API returns data in a format with dates and counts
            setData({
                dates: formattedData.dates, // Ensure your API returns these properties
                counts: formattedData.counts,
            });
        })
        .catch(error => {
            console.error('Error fetching job orders data:', error);
        });
    }, []);

    return (
        <LineChart
            xAxis={[{ data: data.dates }]}
            series={[{ data: data.counts }]}
            width={1100}
            height={500}
        />
    );
}
