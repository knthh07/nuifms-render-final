import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Typography,
  Grid,
  Modal,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorIcon from "@mui/icons-material/Error"; // For error severity
import WarningIcon from "@mui/icons-material/Warning"; // For warning severity
import InfoIcon from "@mui/icons-material/Info"; // For info severity
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from "recharts";
import LayoutComponent from "../LayoutComponent";

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/analytics");
      if (response.status === 200) {
        setAnalyticsData(response.data);
        setGroupedData(response.data.objectAnalysis); // Directly use the API response
      } else {
        throw new Error("Failed to fetch analytics data");
      }
    } catch (err) {
      console.error("Error fetching analytics data:", err);
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Group data by scenario
  const groupDataByScenario = (data) => {
    const grouped = data.reduce((acc, item) => {
      const key = item.scenario;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
    setGroupedData(Object.entries(grouped).map(([scenario, items]) => ({ scenario, items })));
  };

  // Open modal with selected scenario details
  const handleScenarioClick = (scenario, items) => {
    setSelectedScenario({ scenario, items });
    setModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedScenario(null);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Log the fetched data
  useEffect(() => {
    if (analyticsData) {
      console.log("Analytics Data:", analyticsData);
    }
  }, [analyticsData]);

  // Loading state
  if (loading) {
    return (
      <LayoutComponent>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
        </Box>
      </LayoutComponent>
    );
  }

  // Error state
  if (error) {
    return (
      <LayoutComponent>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Alert severity="error" sx={{ width: "50%", textAlign: "center" }}>
            {error}
          </Alert>
        </Box>
      </LayoutComponent>
    );
  }

  const { recommendations } = analyticsData;

  // Data for the bar chart
  const chartData = groupedData.map((group) => ({
    scenario: group.scenario,
    count: group.items.length,
  }));

  // Severity icon mapping
  const severityIcons = {
    error: <ErrorIcon color="error" fontSize="small" />,
    warning: <WarningIcon color="warning" fontSize="small" />,
    info: <InfoIcon color="info" fontSize="small" />,
  };

  return (
    <LayoutComponent>
      <Box padding="16px">
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Link to="/SuperAdminDashboard" style={{ textDecoration: "none" }}>
            <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />}>
              Back
            </Button>
          </Link>
          <Button variant="contained" color="primary" startIcon={<RefreshIcon />} onClick={fetchAnalyticsData}>
            Refresh Analytics
          </Button>
        </Box>

        {/* Dashboard Title */}
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
          Prescriptive Analytics Dashboard
        </Typography>

        {/* Bar Chart Section */}
        <Card variant="outlined" sx={{ borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Scenario Frequency
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="scenario" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grid Layout for Recommendations and Object Analysis */}
        <Grid container spacing={2}>
          {/* Recommendations Section */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  Recommendations
                </Typography>
                <Box sx={{ maxHeight: "350px", overflowY: "auto" }}>
                  <List dense>
                    {recommendations && recommendations.length > 0 ? (
                      recommendations.map((rec, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={rec.message}
                            secondary={`Severity: ${rec.severity}`}
                            secondaryTypographyProps={{ color: rec.severity === "error" ? "error" : "warning" }}
                          />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No recommendations available.
                      </Typography>
                    )}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Object Analysis Section */}
          <Grid item xs={12} md={8}>
            <Card variant="outlined" sx={{ borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  Object Analysis
                </Typography>
                <Box sx={{ maxHeight: "350px", overflowY: "auto" }}>
                  <Grid container spacing={2}>
                    {groupedData.map((group, index) => {
                      console.log("Group Data:", group); // Log group data
                      return (
                        <Grid item xs={12} key={index}>
                          <Paper
                            elevation={3}
                            sx={{
                              p: 2,
                              borderRadius: "8px",
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "#f5f5f5" },
                            }}
                            onClick={() => handleScenarioClick(group.scenario, group.items)}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                                {group.scenario}
                              </Typography>
                              <Chip
                                label={`${group.items.length} items`}
                                color="primary"
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              Click to view details
                            </Typography>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Modal for Scenario Details */}
        <Modal open={modalOpen} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "60%",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 3,
              borderRadius: "8px",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              {selectedScenario?.scenario}
            </Typography>
            <List>
              {selectedScenario?.items.map((item, index) => {
                console.log("Item Data:", item); // Log item data
                return (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={`${item.object || "Unknown Object"}`}
                      secondary={`Location: ${item.reqOffice || "Unknown Office"}, ${item.building || "Unknown Building"}, ${item.campus || "Unknown Campus"} | Reported ${item.count || 0} times over ${item.daysBetween || 0} days`}
                    />
                    <Box>{severityIcons[item.severity] || <InfoIcon color="action" fontSize="small" />}</Box>
                  </ListItem>
                );
              })}
            </List>
            <Button onClick={handleCloseModal} variant="contained" color="primary" sx={{ mt: 2 }}>
              Close
            </Button>
          </Box>
        </Modal>
      </Box>
    </LayoutComponent>
  );
};

export default AnalyticsDashboard;