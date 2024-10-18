import React, { useState, useEffect, lazy, Suspense } from "react";
import axios from 'axios';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Pagination, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

// Lazy load the ViewDetailsModal
const ViewDetailsModal = lazy(() => import('./ViewDetailsModal'));

const ViewUserFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const feedbacksPerPage = 5; // Adjust if necessary
    const [totalPages, setTotalPages] = useState(1);
    const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await axios.get('/api/feedbacks', { params: { page: currentPage } });
                setFeedbacks(response.data.feedbacks);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Failed to fetch feedbacks:', error);
            }
        };

        fetchFeedbacks();
    }, [currentPage]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleOpenFeedbackModal = (feedback) => {
        setSelectedFeedback(feedback);
        setOpenFeedbackModal(true);
    };

    const handleCloseFeedbackModal = () => {
        setOpenFeedbackModal(false);
        setSelectedFeedback(null);
    };

    const handleOpenDetailsModal = (feedback) => {
        setSelectedFeedback(feedback);
        setDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedFeedback(null);
    };

    return (
        <div className="flex h-screen">
            <div className="flex flex-col w-full">
                <div className="w-[80%] ml-[20%] p-6">
                    <h1 className="text-2xl font-bold mb-4">Feedback</h1>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>First Name</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Feedback</TableCell>
                                    <TableCell>Job Description</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feedbacks.map((feedback) => (
                                    <TableRow key={feedback.id || feedback._id}>
                                        <TableCell>{feedback.firstName} {feedback.lastName}</TableCell>
                                        <TableCell>{new Date(feedback.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button variant="text" color="primary" onClick={() => handleOpenFeedbackModal(feedback)}>
                                                View Feedback
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="secondary" onClick={() => handleOpenDetailsModal(feedback)}>
                                                View Job Description
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <div className="flex justify-center mt-5">
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </div>
                </div>

                {/* Feedback View Modal */}
                <Dialog open={openFeedbackModal} onClose={handleCloseFeedbackModal} maxWidth="md" fullWidth>
                    <DialogTitle>Feedback Details</DialogTitle>
                    <DialogContent>
                        {selectedFeedback && (
                            <Typography variant="body1">
                                {selectedFeedback.feedback}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseFeedbackModal} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Job Description Modal (Lazy Loaded) */}
                <Suspense fallback={<CircularProgress />}>
                    {detailsModalOpen && (
                        <ViewDetailsModal
                            open={detailsModalOpen}
                            onClose={handleCloseDetailsModal}
                            request={selectedFeedback}  // Pass the selected job description details
                        />
                    )}
                </Suspense>
            </div>
        </div>
    );
};

export default ViewUserFeedback;
