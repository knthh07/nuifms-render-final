import React, { useEffect, useState } from "react";
import axios from 'axios';
import UserSideNav from "../Components/user_sidenav/UserSideNav";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Pagination, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

const UserHistory = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openJobDescriptionModal, setOpenJobDescriptionModal] = useState(false);
    const [openRejectionReasonModal, setOpenRejectionReasonModal] = useState(false);
    const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
    const [openFeedbackViewModal, setOpenFeedbackViewModal] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", content: "" });
    const [rejectionReasonContent, setRejectionReasonContent] = useState("");
    const [feedback, setFeedback] = useState('');
    const [selectedJobOrder, setSelectedJobOrder] = useState(null);
    const [feedbackToView, setFeedbackToView] = useState('');

    useEffect(() => {
        const fetchJobOrders = async () => {
            setLoading(true);
            setError(null); // Reset the error before fetching
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
        const content = `
            <strong>Requestor:</strong> ${jobOrder.firstName} ${jobOrder.lastName}<br/>
            <strong>Building:</strong> ${jobOrder.building || 'N/A'}<br/>
            <strong>Floor:</strong> ${jobOrder.floor || 'N/A'}<br/>
            <strong>Room:</strong> ${jobOrder.room || 'N/A'}<br/>
            <strong>Job Description:</strong> ${jobOrder.jobDesc || 'N/A'}<br/>`

        setModalContent({ title: "Job Order Details", content });
        setOpenJobDescriptionModal(true);
    };

    const handleOpenRejectionReasonModal = (jobOrder) => {
        const content = jobOrder.rejectionReason || 'No rejection reason provided.';
        setRejectionReasonContent(content);
        setOpenRejectionReasonModal(true);
    };

    const handleCloseJobDescriptionModal = () => {
        setOpenJobDescriptionModal(false);
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

    const handleOpenFeedbackViewModal = (jobOrder) => {
        setFeedbackToView(jobOrder.feedback || 'No feedback available.');
        setOpenFeedbackViewModal(true);
    };

    const handleCloseFeedbackViewModal = () => {
        setOpenFeedbackViewModal(false);
    };

    const handleFeedbackChange = (e) => {
        setFeedback(e.target.value);
    };

    const handleFeedbackSubmit = async () => {
        if (selectedJobOrder) {
            try {
                const response = await axios.put(`/api/jobOrders/${selectedJobOrder._id}/feedback`, { feedback });
                if (response.data.error) {
                    alert(response.data.error);
                    return;
                }
                alert('Feedback submitted successfully');
                // Update jobOrders state to reflect the feedback status change
                setJobOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === selectedJobOrder._id ? { ...order, feedback: response.data.jobOrder.feedback, feedbackSubmitted: true } : order
                    )
                );
                handleCloseFeedbackModal();
            } catch (error) {
                console.error(error);
                alert('Failed to submit feedback');
            }
        }
    };

    return (
        <div className="user-history-div">
            <UserSideNav />

            <div className="w-[77%] ml-[21.5%] mt-8 bg-white rounded-lg shadow-md p-8">
                <Typography variant="h4" className="mb-6">Application History</Typography>
                {loading ? (
                    <Typography variant="h6" className="text-center">Loading...</Typography>
                ) : error ? (
                    <Typography variant="h6" className="text-center text-red-500">{error}</Typography>
                ) : jobOrders.length === 0 ? (
                    <Typography variant="h6" className="text-center">No Job Order found.</Typography>
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
                                                <Button variant="text" color="primary" onClick={() => handleOpenJobDescriptionModal(jobOrder)}>
                                                    View
                                                </Button>
                                            </TableCell>
                                            <TableCell>{jobOrder.status || 'N/A'}</TableCell>
                                            <TableCell>
                                                {jobOrder.status === 'rejected' && (
                                                    <Button variant="text" color="primary" onClick={() => handleOpenRejectionReasonModal(jobOrder)}>
                                                        View
                                                    </Button>
                                                )}
                                            </TableCell>

                                            <TableCell>{new Date(jobOrder.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(jobOrder.updatedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {jobOrder.feedback ? (
                                                    <Button variant="text" color="primary" onClick={() => handleOpenFeedbackViewModal(jobOrder)}>
                                                        View Feedback
                                                    </Button>
                                                ) : (
                                                    jobOrder.status === 'completed' && !jobOrder.feedbackSubmitted && (
                                                        <Button variant="text" color="primary" onClick={() => handleOpenFeedbackModal(jobOrder)}>
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
                        <Dialog open={openJobDescriptionModal} onClose={handleCloseJobDescriptionModal}>
                            <DialogTitle>{modalContent.title}</DialogTitle>
                            <DialogContent>
                                <Typography variant="body1" dangerouslySetInnerHTML={{ __html: modalContent.content }} />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseJobDescriptionModal} color="primary">Close</Button>
                            </DialogActions>
                        </Dialog>

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

                        {/* Feedback Modal */}
                        <Dialog open={openFeedbackModal} onClose={handleCloseFeedbackModal}>
                            <DialogTitle>Submit Feedback</DialogTitle>
                            <DialogContent>
                                <TextField
                                    multiline
                                    rows={4}
                                    fullWidth
                                    label="Feedback"
                                    value={feedback}
                                    onChange={handleFeedbackChange}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseFeedbackModal} color="primary">Cancel</Button>
                                <Button onClick={handleFeedbackSubmit} color="primary">Submit</Button>
                            </DialogActions>
                        </Dialog>

                        {/* Feedback View Modal */}
                        <Dialog open={openFeedbackViewModal} onClose={handleCloseFeedbackViewModal}>
                            <DialogTitle>Feedback</DialogTitle>
                            <DialogContent>
                                <Typography variant="body1">{feedbackToView}</Typography>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseFeedbackViewModal} color="primary">Close</Button>
                            </DialogActions>
                        </Dialog>
                    </>
                )}
            </div>
        </div>
    );
};

export default UserHistory;
