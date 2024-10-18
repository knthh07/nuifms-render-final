import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';

export default function LineChartGraph() {
    const [data, setData] = useState({ dates: [], counts: [] });

    useEffect(() => {
        // Fetch data from the backend
        axios.get('/api/jobOrders/byUserByDate') // Make sure this matches the new endpoint
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error('Error fetching user job orders data:', error);
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
