import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import BarChart from './Chart/BarChart';
import PieChart from './Chart/PieChart';
import AnnalyticsDashboard from './DataAnalytics/AnalyticsDashboard';

const DashboardComponent = () => {
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
    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', fontFamily: 'Roboto, sans-serif', marginLeft: '15vw' }}>
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
            <BarChartGraph data={barChartData} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '400px', overflowY: 'auto' }}> {/* Fixed height and scrollable */}
            <CardContent>
              <Typography variant="h6">Recommendations</Typography>
              {error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                recommendations.map((rec, index) => (
                  <Typography key={index} variant="body2" sx={{ marginBottom: 1 }}>
                    {rec}
                  </Typography>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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
