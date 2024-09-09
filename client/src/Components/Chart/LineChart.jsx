import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';

export default function LineChartGraph() {
    const [data, setData] = useState({ dates: [], counts: [] });

    useEffect(() => {
        // Fetch data from the backend
        axios.get('/api/jobOrders/byDate', {
            params: {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            }
        })
        .then(response => {
            setData(response.data);
        })
        .catch(error => {
            console.error('Error fetching job orders data:', error);
        });
    }, []);

    return (
        <LineChart
            xAxis={[{ data: data.dates }]}
            series={[
                {
                    data: data.counts,
                },
            ]}
            width={1100}
            height={500}
        />
    );
}
