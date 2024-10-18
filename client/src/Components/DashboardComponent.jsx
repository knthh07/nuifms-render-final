import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import BarChart from './Chart/BarChart'; // Import updated BarChartGraph
import PieChart from './Chart/PieChart';
import AnnalyticsDashboard from './DataAnalytics/AnalyticsDashboard';

const DashboardComponent = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [barChartData, setBarChartData] = useState({ semesters: [], chartData: [] }); // State for bar chart data
  const [departmentCounts, setDepartmentCounts] = useState({}); // State for department counts
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job order analysis recommendations
        const recommendationsResponse = await axios.get('api/analytics/analyzeJobOrders');
        if (recommendationsResponse.status === 200) {
          setRecommendations(recommendationsResponse.data.recommendations);
        } else {
          throw new Error('Failed to fetch recommendations');
        }

        // Fetch data for the bar chart
        const barChartResponse = await axios.get('/api/jobOrders/ByDepartmentAndSemester');
        setBarChartData(barChartResponse.data); // Set data for bar chart
        
        // Set department counts
        setDepartmentCounts(barChartResponse.data.departmentCounts); // Assuming this key is returned from your controller

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      }
    };

    fetchData();
  }, []);

  // Prepare top four departments
  const topDepartments = Object.entries(departmentCounts)
    .sort(([, aCount], [, bCount]) => bCount - aCount) // Sort by count descending
    .slice(0, 4); // Get top 4

  return (
    <div className="flex">
      <div className="flex flex-col w-full ml-0 md:ml-[20.5%] mr-3">
        <div className="flex flex-col p-5 bg-gray-100 mt-3">
          <Grid container spacing={3} className="mb-5">
            {topDepartments.map(([department, count]) => (
              <Grid item xs={12} sm={6} md={3} key={department}>
                <StatCard title={department} value={count} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <ChartCard>
                <BarChart data={barChartData} /> {/* Pass data to BarChart */}
              </ChartCard>
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <ChartCard>
                <PieChart />
              </ChartCard>
            </Grid> */}
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
    <Card className="bg-white shadow-md rounded-md" sx={{ minHeight: 150 }}>
      <CardContent>
        <Typography variant="h5" noWrap>{title}</Typography>
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

export default DashboardComponent;
