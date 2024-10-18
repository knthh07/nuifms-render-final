import React, { useEffect, useState, Suspense, lazy } from "react";
import axios from 'axios';
import UserSideNav from "../Components/user_sidenav/UserSideNav";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Pagination, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Skeleton, Box, Modal, IconButton, Backdrop
} from '@mui/material';
import { toast } from 'react-hot-toast'; // Import toast
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon

// Lazy load the ViewDetailsModal
const ViewDetailsModal = lazy(() => import('../Components/ViewDetailsModal'));

const UserHistory = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openJobDescriptionModal, setOpenJobDescriptionModal] = useState(false);
    const [openRejectionReasonModal, setOpenRejectionReasonModal] = useState(false);
    const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
    const [selectedJobOrder, setSelectedJobOrder] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [userFeedback, setUserFeedback] = useState(null); // To store the submitted feedback

    useEffect(() => {
        const fetchJobOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/history', { params: { page: currentPage } });
                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                setError('Failed to load job orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobOrders();
    }, [currentPage]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleOpenJobDescriptionModal = (jobOrder) => {
        setSelectedJobOrder(jobOrder);
        setOpenJobDescriptionModal(true);
    };

    const handleCloseJobDescriptionModal = () => {
        setOpenJobDescriptionModal(false);
        setSelectedJobOrder(null);
    };

    const handleOpenRejectionReasonModal = (jobOrder) => {
        const content = jobOrder.rejectionReason || 'No rejection reason provided.';
        setRejectionReasonContent(content);
        setOpenRejectionReasonModal(true);
    };

    const handleCloseRejectionReasonModal = () => {
        setOpenRejectionReasonModal(false);
    };

    const handleOpenFeedbackModal = (jobOrder) => {
        setSelectedJobOrder(jobOrder);
        setOpenFeedbackModal(true);
    };

    const handleCloseFeedbackModal = () => {
        setOpenFeedbackModal(false);
    };

    const handleFeedbackSubmit = async () => {
        if (selectedJobOrder) {
            try {
                const response = await axios.put(`/api/jobOrders/${selectedJobOrder._id}/feedback`, { feedback });
                if (response.data.error) {
                    toast.error(response.data.error);
                    return;
                }
                toast.success('Feedback submitted successfully');
                setUserFeedback({
                    feedback: response.data.jobOrder.feedback,
                    firstName: response.data.jobOrder.firstName,
                    lastName: response.data.jobOrder.lastName,
                    date: new Date() // Assuming we use the current date for submission
                });

                // Update jobOrders state to reflect the feedback status change
                setJobOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === selectedJobOrder._id ? { ...order, feedback: response.data.jobOrder.feedback, feedbackSubmitted: true } : order
                    )
                );
                handleCloseFeedbackModal(); // Close feedback modal
            } catch (error) {
                console.error(error);
                toast.error('Failed to submit feedback');
            }
        }
    };

    return (
        <div className="flex">
            <UserSideNav />

            <div className="w-[80%] ml-[20%] p-6">
                <Typography variant="h5" gutterBottom>Application History</Typography>
                {loading ? (
                    <Skeleton variant="rectangular" width="100%" height={400} />
                ) : error ? (
                    <Typography variant="h6" className="text-center text-red-500">{error}</Typography>
                ) : jobOrders.length === 0 ? (
                    <Typography variant="h6" className="text-center">No Job Orders found.</Typography>
                ) : (
                    <>
                        <TableContainer component={Paper} className="shadow-md">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Requestor</TableCell>
                                        <TableCell>Job Description</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Rejection Reason</TableCell>
                                        <TableCell>Submission Date</TableCell>
                                        <TableCell>Completion Date</TableCell>
                                        <TableCell>Feedback</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobOrders.map((jobOrder) => (
                                        <TableRow key={jobOrder._id || jobOrder.createdAt}>
                                            <TableCell>{jobOrder.firstName} {jobOrder.lastName}</TableCell>
                                            <TableCell>
                                                <Button variant="contained" color="primary" onClick={() => handleOpenJobDescriptionModal(jobOrder)}>
                                                    View
                                                </Button>
                                            </TableCell>
                                            <TableCell>{jobOrder.status || 'N/A'}</TableCell>
                                            <TableCell>
                                                {jobOrder.status === 'rejected' && (
                                                    <Button variant="contained" color="primary" onClick={() => handleOpenRejectionReasonModal(jobOrder)}>
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(jobOrder.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(jobOrder.updatedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {jobOrder.feedback ? (
                                                    <Button variant="contained" color="primary" onClick={() => handleOpenFeedbackModal(jobOrder)}>
                                                        View Feedback
                                                    </Button>
                                                ) : (
                                                    jobOrder.status === 'completed' && !jobOrder.feedbackSubmitted && (
                                                        <Button variant="contained" color="primary" onClick={() => {
                                                            handleOpenFeedbackModal(jobOrder);
                                                            setUserFeedback(null); // Reset feedback for new submission
                                                        }}>
                                                            Submit Feedback
                                                        </Button>
                                                    )
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" className="flex justify-center mt-6" />

                        {/* Job Order Details Modal */}
                        <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={400} />}>
                            {openJobDescriptionModal && (
                                <ViewDetailsModal
                                    open={openJobDescriptionModal}
                                    onClose={handleCloseJobDescriptionModal}
                                    request={selectedJobOrder}
                                />
                            )}
                        </Suspense>

                        {/* Rejection Reason Modal */}
                        <Dialog open={openRejectionReasonModal} onClose={handleCloseRejectionReasonModal}>
                            <DialogTitle>Rejection Reason</DialogTitle>
                            <DialogContent>
                                <Typography variant="body1">{rejectionReasonContent}</Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseRejectionReasonModal} color="primary">Close</Button>
                            </DialogActions>
                        </Dialog>

                        {/* Feedback Modal for viewing user feedback */}
                        <Modal
                            open={openFeedbackModal}
                            onClose={handleCloseFeedbackModal}
                            aria-labelledby="feedback-modal-title"
                            aria-describedby="feedback-modal-description"
                            closeAfterTransition
                            BackdropComponent={Backdrop}
                            BackdropProps={{
                                timeout: 0,
                                sx: {
                                    backdropFilter: 'blur(5px)',
                                },
                            }}
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%',
                                maxWidth: 600,
                                p: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                outline: 'none',
                            }}>
                                <IconButton
                                    aria-label="close"
                                    onClick={handleCloseFeedbackModal}
                                    sx={{
                                        position: 'absolute',
                                        top: 16,
                                        right: 16,
                                        color: (theme) => theme.palette.grey[500],
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>

                                <Paper elevation={3} sx={{
                                    p: 3,
                                    bgcolor: 'background.paper',
                                    boxShadow: 3,
                                    borderRadius: 2,
                                    overflowY: 'auto',
                                }}>
                                    <Typography variant="h5" component="h2" mb={2}>Feedback Details</Typography>
                                    {userFeedback ? (
                                        <Box>
                                            <Typography variant="body1">
                                                <strong>Feedback:</strong> {userFeedback.feedback}
                                            </Typography>
                                            <Typography variant="body1" mt={1}>
                                                <strong>Submitted By:</strong> {userFeedback.firstName} {userFeedback.lastName}
                                            </Typography>
                                            <Typography variant="body1" mt={1}>
                                                <strong>Date:</strong> {new Date(userFeedback.date).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <>
                                            <TextField
                                                variant="outlined"
                                                label="Your Feedback"
                                                multiline
                                                rows={4}
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                fullWidth
                                                required
                                            />
                                            <Button variant="contained" color="primary" onClick={handleFeedbackSubmit} sx={{ mt: 2 }}>
                                                Submit Feedback
                                            </Button>
                                        </>
                                    )}
                                </Paper>
                            </Box>
                        </Modal>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserHistory;
