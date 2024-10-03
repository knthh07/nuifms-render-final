import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import SideNav from '../Components/sidenav/SideNav';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import BarChart from '../Components/Chart/BarChart';
import PieChart from '../Components/Chart/PieChart';
import AnnalyticsDashboard from '../Components/DataAnalytics/AnalyticsDashboard';

const Dashboard = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Make API call using axios to get the job order analysis recommendations
        const response = await axios.get('api/analytics/analyzeJobOrders');
        
        // Check if the response is successful
        if (response.status === 200) {
          setRecommendations(response.data.recommendations);
        } else {
          throw new Error('Failed to fetch recommendations');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="flex">
      <SideNav />
      <div className="flex flex-col w-full ml-0 md:ml-[20.5%] mr-3">
        <div className="flex flex-col p-5 bg-gray-100 mt-3">
          <Grid container spacing={3} className="mb-5">
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="COA" value="0" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="CCIT" value="0" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="COE" value="0" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard title="COM" value="0" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <BarChart />
              </ChartCard>
            </Grid>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <PieChart />
              </ChartCard>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              {error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <AnnalyticsDashboard recommendations={recommendations} />
              )}
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => {
  return (
    <Card className="bg-white shadow-md rounded-md">
      <CardContent>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
};

const ChartCard = ({ children, className }) => {
  return (
    <Card className={`bg-white shadow-md rounded-md ${className}`}>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default Dashboard;
