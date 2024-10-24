import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import BarChart from './Chart/BarChart';
import PieChartGraph from './Chart/PieChart';  // Updated import
import AnalyticsDashboard from './DataAnalytics/AnalyticsDashboard';

const DashboardComponent = () => {  // userId prop is no longer needed
  const [recommendations, setRecommendations] = useState([]);
  const [barChartData, setBarChartData] = useState({ semesters: [], chartData: [] });
  const [departmentCounts, setDepartmentCounts] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recommendationsResponse = await axios.get('api/analytics/analyzeJobOrders');
        if (recommendationsResponse.status === 200) {
          setRecommendations(recommendationsResponse.data.recommendations);
        } else {
          throw new Error('Failed to fetch recommendations');
        }

        const barChartResponse = await axios.get('/api/jobOrders/ByDepartmentAndSemester');
        setBarChartData(barChartResponse.data);
        setDepartmentCounts(barChartResponse.data.departmentCounts);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  const topDepartments = Object.entries(departmentCounts)
    .sort(([, aCount], [, bCount]) => bCount - aCount)
    .slice(0, 4);

  return (
    <Box>
      <div className="flex-wrap justify-between p-5 bg-gray-100 w-[77%] ml-[21.5%] mt-3">
        <Grid container spacing={3}>
          {topDepartments.map(([department, count]) => (
            <Grid item xs={12} sm={6} md={3} key={department}>
              <StatCard title={department} value={count} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ marginTop: 2 }}>
          <Grid item xs={12} md={6}>
            <ChartCard>
              <PieChartGraph /> {/* No need to pass userId here */}
            </ChartCard>
          </Grid>
        </Grid>

        <Grid container spacing={3} sx={{ marginTop: 2 }}>
          <Grid item xs={12}>
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <AnalyticsDashboard recommendations={recommendations} />
            )}
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};

const StatCard = ({ title, value }) => {
  return (
    <Card sx={{ minHeight: 150, marginBottom: 2, borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" noWrap>{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
};

const ChartCard = ({ children, className }) => {
  return (
    <Card className={`bg-white shadow-md rounded-md ${className}`} sx={{ marginBottom: 2 }}>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default DashboardComponent;
