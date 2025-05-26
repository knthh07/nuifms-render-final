import React, { useEffect, useState, useCallback, memo, useContext } from "react";
import axios from "axios";
import {
  Box, Button, Card, CardContent, CircularProgress, Alert,
  Typography, Grid, Modal, Paper, useTheme, TextField,
  IconButton, ListItem, ListItemText, ListItemSecondaryAction
} from "@mui/material";
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AuthContext } from "../../context/AuthContext";

const MemoizedBarChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data}>
      <XAxis dataKey="scenario" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  </ResponsiveContainer>
));

const ScenarioItem = memo(({ group, handleScenarioClick }) => {
  const theme = useTheme();
  return (
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
        "&:hover": { backgroundColor: theme.palette.action.hover },
        outline: "none",
        "&:focus-visible": {
          outline: `2px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.action.selected,
        },
      }}
      aria-label={`View details for scenario ${group.scenario}`}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {group.scenario}
        </Typography>
        <Typography variant="body2" color="primary">
          {group.items.length} items
        </Typography>
      </Box>
      <Typography variant="body2" color="textSecondary">
        Click to view details
      </Typography>
    </Paper>
  );
});

const AnalyticsDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [resolutionData, setResolutionData] = useState({ open: false, id: null, notes: '' });

  const fetchAnalyticsData = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/analytics?page=${pageNum}`);
      if (response.status === 200) {
        setAnalyticsData(response.data);
        setTotalPages(response.data.totalPages);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResolve = async () => {
    try {
      if (!resolutionData.notes.trim()) {
        alert('Please enter resolution notes');
        return;
      }

      const response = await axios.post(
        `/api/recommendations/${resolutionData.id}/resolve`,
        {
          notes: resolutionData.notes,
          userId: currentUser?.id
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setResolutionData({ open: false, id: null, notes: '' });
        fetchAnalyticsData(page);
      } else {
        setError(response.data.message || 'Resolution failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve recommendation');
    }
  };


  const handleScenarioClick = (scenario, items) => {
    setSelectedScenario({ scenario, items });
    setModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedScenario(null);
  }, []);

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
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100vh"
        gap={2}
      >
        <Alert severity="error" sx={{ width: "50%", textAlign: "center" }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => fetchAnalyticsData(page)}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box component="main" padding={3}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
        Prescriptive Analytics Dashboard
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: "8px", mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Scenario Frequency
          </Typography>
          <MemoizedBarChart data={analyticsData?.chartData || []} />
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recommendations
              </Typography>
              <Box sx={{ height: 350 }}>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      width={width}
                      itemCount={analyticsData?.recommendations?.length || 0}
                      itemSize={80}
                    >
                      {({ index, style }) => {
                        const rec = analyticsData.recommendations[index];
                        return (
                          <Box style={style} p={1}>
                            <Paper elevation={2} sx={{ p: 2 }}>
                              <ListItem>
                                <ListItemText
                                  primary={rec.message}
                                  secondary={rec.resolved ?
                                    `Resolved by ${rec.resolvedBy?.name} on ${new Date(rec.resolvedAt).toLocaleDateString()}` :
                                    `Detected on ${new Date(rec.createdAt).toLocaleDateString()}`
                                  }
                                />
                                {!rec.resolved && (
                                  <ListItemSecondaryAction>
                                    <IconButton
                                      edge="end"
                                      onClick={() => setResolutionData({ open: true, id: rec._id, notes: '' })}
                                      color="success"
                                    >
                                      <CheckCircleIcon />
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                )}
                              </ListItem>
                            </Paper>
                          </Box>
                        );
                      }}
                    </List>
                  )}
                </AutoSizer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Object Analysis
              </Typography>
              <Box sx={{ height: 350 }}>
                <AutoSizer>
                  {({ height, width }) => (
                    <List
                      height={height}
                      width={width}
                      itemCount={analyticsData.groupedData.length}
                      itemSize={100}
                    >
                      {({ index, style }) => (
                        <Box style={style} p={1}>
                          <ScenarioItem
                            group={analyticsData.groupedData[index]}
                            handleScenarioClick={handleScenarioClick}
                          />
                        </Box>
                      )}
                    </List>
                  )}
                </AutoSizer>
              </Box>
              <Box display="flex" justifyContent="center" gap={2} mt={2}>
                <Button
                  disabled={page <= 1}
                  onClick={() => fetchAnalyticsData(page - 1)}
                >
                  Previous
                </Button>
                <Typography>Page {page} of {totalPages}</Typography>
                <Button
                  disabled={page >= totalPages}
                  onClick={() => fetchAnalyticsData(page + 1)}
                >
                  Next
                </Button>
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
            bgcolor: "background.paper",
            p: 3,
            borderRadius: "8px",
            outline: "none",
          }}
        >
          <Typography id="modal-title" variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            {selectedScenario?.scenario}
          </Typography>
          <Box sx={{ maxHeight: "60vh", overflowY: "auto" }}>
            <List
              height={300}
              width="100%"
              itemCount={selectedScenario?.items?.length || 0}
              itemSize={60}
            >
              {({ index, style }) => (
                <Box style={style} p={1}>
                  <Typography variant="body2">
                    {selectedScenario?.items[index]?.object} -
                    {selectedScenario?.items[index]?.campus},
                    {selectedScenario?.items[index]?.building}
                  </Typography>
                </Box>
              )}
            </List>
          </Box>
          <Button onClick={handleCloseModal} variant="contained" sx={{ mt: 2 }}>
            Close
          </Button>
        </Box>
      </Modal>
      <Modal open={resolutionData.open} onClose={() => setResolutionData({ ...resolutionData, open: false })}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Resolve Recommendation
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resolution Notes"
            value={resolutionData.notes}
            onChange={(e) => setResolutionData({ ...resolutionData, notes: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="success"
            fullWidth
            onClick={handleResolve}
          >
            Mark as Resolved
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default AnalyticsDashboard;