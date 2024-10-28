import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import BarChartGraph from './Chart/BarChart'; // Import your BarChart component
import PieChartGraph from './Chart/PieChart'; // Updated import
import AnalyticsDashboard from './DataAnalytics/AnalyticsDashboard';

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

  // Function to handle stat card click
  const handleStatCardClick = (department) => {
    console.log(`Clicked on ${department}`);
    // Add any additional logic here, like navigating to a details page
  };

  return (
    <Box>
      <div className="flex-wrap justify-between p-5 bg-gray-100 w-[80%] ml-[20%]">
        <Grid container spacing={3}>
          {/* Pie Chart with Stat Cards beside it */}
          <Grid item xs={12} md={6}>
            <ChartCard>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
                height="100%"
              >
                <PieChartGraph width="100%" height="100%" />
              </Box>
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              {topDepartments.map(([department, count]) => (
                <Grid item xs={12} sm={6} md={6} key={department}>
                  <ClickableStatCard 
                    title={department} 
                    value={count} 
                    onClick={() => handleStatCardClick(department)} 
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Bar Chart */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
                height="100%"
              >
                <BarChartGraph data={barChartData.chartData} width="100%" height="100%" />
              </Box>
            </ChartCard>

            <Grid item xs={12}>
              {error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <AnalyticsDashboard recommendations={recommendations} />
              )}
            </Grid>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};

const ClickableStatCard = ({ title, value, onClick }) => {
  return (
    <Card 
      sx={{ minHeight: 150, marginBottom: 2, borderRadius: 1, boxShadow: 1, cursor: 'pointer' }} 
      onClick={onClick}
    >
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
