import React, { useEffect, useState } from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import axios from 'axios';

export default function LineChartGraph() {
    const [data, setData] = useState({ dates: [], counts: [] });

    useEffect(() => {
        // Fetch data from the backend
        axios.get('/api/jobOrders/byUser')
            .then(response => {
                const { jobOrderCount, semester } = response.data;

                // Prepare data for the line chart
                // Here we are assuming you want to display job orders over time; 
                // you may need to adjust this according to how you want to visualize the data.
                const currentDate = new Date();
                const dates = [];
                const counts = [];

                // Example: Fill the data for the current semester
                // You can customize the logic to create an array of dates based on your needs
                for (let i = 0; i < 10; i++) { // Example for the last 10 days
                    const date = new Date(currentDate);
                    date.setDate(currentDate.getDate() - i);
                    dates.push(date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
                    counts.push(i < jobOrderCount ? jobOrderCount : 0); // Example logic
                }

                setData({ dates: dates.reverse(), counts: counts.reverse() }); // Reverse to have the correct order
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
