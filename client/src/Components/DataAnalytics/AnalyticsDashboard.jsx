import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Tab,
  Tabs,
  Box,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router-dom";
import LayoutComponent from "../LayoutComponent";

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/analytics");
        if (response.status === 200) {
          setAnalyticsData(response.data);
        } else {
          throw new Error("Failed to fetch analytics data");
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("An error occurred while fetching data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const { jobTypes, urgentJobs, statusCounts, campusAnalysis, requestTrends, recommendations, objectAnalysis } = analyticsData;

  return (
    <LayoutComponent>
      <div style={{ padding: "20px" }}>
        <Link to="/SuperAdminDashboard">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<ArrowBackIcon />}
            sx={{
              mb: 2,
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #3f51b5",
              color: "#3f51b5",
              "&:hover": {
                backgroundColor: "#3f51b5",
                color: "#fff",
              },
            }}
          >
            Back
          </Button>
        </Link>

        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Job Type Analysis" />
          <Tab label="Urgent Job Requests" />
          <Tab label="Job Status Counts" />
          <Tab label="Campus Analysis" />
          <Tab label="Request Trends" />
          <Tab label="Object Analysis" />
          <Tab label="Recommendations" />
        </Tabs>

        <Box mt={2}>
          {loading && <CircularProgress />}

          {error && <Typography color="error" align="center">{error}</Typography>}

          {!loading && !error && (
            <>
              {activeTab === 0 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Job Type Analysis
                    </Typography>
                    {jobTypes?.length > 0 ? (
                      <List>
                        {jobTypes.map((jobType, index) => (
                          <ListItem key={index} divider>
                            <ListItemText primary={`${jobType._id}: ${jobType.count} requests`} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" align="center">No job types available.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 1 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Urgent Job Requests
                    </Typography>
                    {urgentJobs?.length > 0 ? (
                      <List>
                        {urgentJobs.map((job, index) => (
                          <ListItem key={index} divider>
                            <ListItemText primary={`${job.position} requested by ${job.firstName} ${job.lastName} at ${job.campus}`} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" align="center">No urgent job requests.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 2 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Job Status Counts
                    </Typography>
                    {statusCounts?.length > 0 ? (
                      <List>
                        {statusCounts.map((status, index) => (
                          <ListItem key={index} divider>
                            <ListItemText primary={`${status._id}: ${status.count} jobs`} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" align="center">No status counts available.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 3 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Campus Analysis
                    </Typography>
                    {campusAnalysis?.length > 0 ? (
                      <List>
                        {campusAnalysis.map((campus, index) => (
                          <ListItem key={index} divider>
                            <ListItemText primary={`${campus._id}: ${campus.count} requests`} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" align="center">No campus analysis available.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 4 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Request Trends by Month
                    </Typography>
                    {requestTrends?.length > 0 ? (
                      <List>
                        {requestTrends.map((trend, index) => (
                          <ListItem key={index} divider>
                            <ListItemText primary={`${trend._id}: ${trend.count} requests`} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" align="center">No request trends available.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 5 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Object Analysis
                    </Typography>
                    {objectAnalysis?.length > 0 ? (
                      <List>
                        {objectAnalysis.map((object, index) => (
                          <ListItem key={index} divider>
                            <ListItemText primary={`${object.object} in ${object.reqOffice} (${object.campus}, ${object.building}, ${object.floor}): ${object.count} requests`} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" align="center">No object analysis available.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 6 && (
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recommendations
                    </Typography>
                    {recommendations?.length > 0 ? (
                      <List>
                        {recommendations.map((recommendation, index) => (
                          <ListItem key={index} divider>
                            <ListItemText primary={recommendation} />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" align="center">No recommendations available.</Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Box>
      </div>
    </LayoutComponent>
  );
};

export default AnalyticsDashboard;
