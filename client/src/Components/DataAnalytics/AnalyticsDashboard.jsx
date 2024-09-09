// components/AnalyticsDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const AnalyticsDashboard = () => {
    const [issuesData, setIssuesData] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/api/analytics/analyzeJobOrders');
                setIssuesData(response.data.issuesData);
                setRecommendations(response.data.recommendations);
            } catch (error) {
                console.error("Error fetching analytics data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <CircularProgress />;

    return (
        <div className="p-4">
            <Typography variant="h4" gutterBottom>Job Orders Analytics</Typography>

            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 3 }}>
                <Typography variant="h6" gutterBottom>Top 5 Most Frequent Job Orders</Typography>
                {issuesData.length === 0 ? (
                    <Typography>No data available</Typography>
                ) : (
                    issuesData.map(issue => (
                        <Accordion key={issue._id} className="mb-2">
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle1">{issue._id}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2">
                                    {issue.count} occurrences
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Box>

            <Box>
                <Typography variant="h6" gutterBottom>Recommendations</Typography>
                {recommendations.length === 0 ? (
                    <Typography>No recommendations available</Typography>
                ) : (
                    recommendations.map(rec => (
                        <Accordion key={rec.issue} className="mb-2">
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="subtitle1">{rec.issue}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2">{rec.recommendation}</Typography>
                            </AccordionDetails>
                        </Accordion>
                    ))
                )}
            </Box>
        </div>
    );
};

export default AnalyticsDashboard;
