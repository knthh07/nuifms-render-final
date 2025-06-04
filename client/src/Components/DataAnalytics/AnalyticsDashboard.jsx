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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedData, setGroupedData] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const groupDataByScenario = (data) => {
    const grouped = data.reduce((acc, item) => {
      const key = item.scenario || "Unknown";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    return Object.entries(grouped).map(([scenario, items]) => ({
      scenario,
      items,
    }));
  };

  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/analytics");
      if (response.status === 200) {
        setAnalyticsData(response.data);
        const raw = response.data.objectAnalysis;
        if (Array.isArray(raw) && raw.length > 0 && raw[0]?.items) {
          setGroupedData(raw);
        } else {
          setGroupedData(groupDataByScenario(raw));
        }
      } else {
        throw new Error("Failed to fetch analytics data");
      }
    } catch (err) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScenarioClick = (scenario, items) => {
    setSelectedScenario({ scenario, items });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedScenario(null);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  if (loading) {
    return (
      <Box
        component="main"
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        aria-live="polite"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        component="main"
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        aria-live="polite"
      >
        <Alert severity="error" sx={{ width: "50%", textAlign: "center" }}>
          {error}
        </Alert>
      </Box>
    );
  }

  const { recommendations } = analyticsData;

  const chartData = groupedData.map((group) => ({
    scenario: group.scenario,
    count: group.items.length,
  }));

  return (
    <Box component="main" padding={3}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Prescriptive Analytics Dashboard
      </Typography>

      <Card
        variant="outlined"
        sx={{ borderRadius: "8px", boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", mb: 4 }}
      >
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Prescriptions
              </Typography>
              <Box sx={{ maxHeight: "350px", overflowY: "auto" }}>
                <List dense>
                  {recommendations && recommendations.length > 0 ? (
                    recommendations.map((rec, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText primary={rec.message} />
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

        <Grid item xs={12} md={8}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: "8px",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              height: "100%",
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Object Analysis
              </Typography>
              <Box sx={{ maxHeight: "350px", overflowY: "auto" }}>
                <Grid container spacing={2}>
                  {groupedData.map((group, index) => (
                    <Grid item xs={12} key={index}>
                      <Paper
                        role="button"
                        tabIndex={0}
                        onClick={() => handleScenarioClick(group.scenario, group.items)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleScenarioClick(group.scenario, group.items);
                          }
                        }}
                        elevation={3}
                        sx={{
                          p: 2,
                          borderRadius: "8px",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          outline: "none",
                          "&:focus-visible": {
                            outline: "2px solid #1976d2",
                            backgroundColor: "#e3f2fd",
                          },
                        }}
                        aria-label={`View details for scenario ${group.scenario}`}
                      >
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                            {group.scenario}
                          </Typography>
                          <Chip label={`${group.items.length} items`} color="primary" size="small" />
                        </Box>
                        <Typography variant="body2" color="textSecondary">
                          Click to view details
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            maxHeight: "80vh",
            overflow: "hidden",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: "8px",
            outline: "none",
          }}
        >
          <Typography id="modal-title" variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            {selectedScenario?.scenario}
          </Typography>
          <Box id="modal-description" sx={{ maxHeight: "60vh", overflowY: "auto" }}>
            <List>
              {(selectedScenario?.items || []).map((item, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={`${item.object || "Unknown Object"}`}
                    secondary={`Location: ${item.reqOffice || "Unknown Office"}, ${item.floor || "Unknown Floor"}, ${item.building || "Unknown Building"}, ${item.campus || "Unknown Campus"}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
          <Button onClick={handleCloseModal} variant="contained" color="primary" sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default AnalyticsDashboard;
