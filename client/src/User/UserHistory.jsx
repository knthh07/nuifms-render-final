import React, { useEffect, useState, Suspense, lazy } from "react";
import axios from 'axios';
import UserSideNav from "../Components/user_sidenav/UserSideNav";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Pagination, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Skeleton, IconButton
} from '@mui/material';
import FeedbackModal from "../Components/FeedbackModal";
import RejectionReasonModal from "../Components/RejectionReasonModal"; // Import the new modal
import SubmitFeedbackModal from "../Components/SubmitFeedbackModal";
import { toast } from 'react-hot-toast'; // Make sure to import react-hot-toast
import FilterListIcon from '@mui/icons-material/FilterList';

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
    const [openFilterModal, setOpenFilterModal] = useState(false); // New state for the filter modal
    const [selectedJobOrder, setSelectedJobOrder] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [userFeedback, setUserFeedback] = useState(null); // For viewing feedback
    const [rejectionReasonContent, setRejectionReasonContent] = useState('');
    const [filterStatus, setFilterStatus] = useState(''); // New state for filter status
    const [filterDateRange, setFilterDateRange] = useState({ startDate: '', endDate: '' }); // New state for date range

    useEffect(() => {
        const fetchJobOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/history', {
                    params: {
                        page: currentPage,
                        status: filterStatus,
                        ...(filterDateRange.startDate && filterDateRange.endDate && {
                            dateRange: `${filterDateRange.startDate}:${filterDateRange.endDate}`
                        })
                    }
                });
                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                setError('Failed to load job orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobOrders();
    }, [currentPage, filterStatus, filterDateRange]);

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
        setRejectionReasonContent({ reason: content });

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

    const handleOpenFeedbackViewModal = (jobOrder) => {
        setUserFeedback({
            feedback: jobOrder.feedback || 'No feedback available.',
            firstName: jobOrder.firstName,
            lastName: jobOrder.lastName,
            date: jobOrder.feedbackDate || new Date().toISOString(),
        });
    };

    const handleFeedbackChange = (event) => {
        setFeedback(event.target.value);
    };

    const handleFeedbackSubmit = async () => {
        if (selectedJobOrder) {
            try {
                const response = await axios.put(`/api/jobOrders/${selectedJobOrder._id}/feedback`, { feedback });
                if (response.data.error) {
                    alert(response.data.error);
                    return;
                }
                // Show toast notification
                toast.success('Feedback submitted successfully');

                // Update jobOrders state to reflect the feedback status change
                setJobOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === selectedJobOrder._id ? { ...order, feedback: response.data.jobOrder.feedback, feedbackSubmitted: true } : order
                    )
                );
                handleCloseFeedbackModal();
                handleOpenFeedbackViewModal(response.data.jobOrder);
            } catch (error) {
                console.error(error);
                alert('Failed to submit feedback');
            }
        }
    };

    const handleOpenFilterModal = () => setOpenFilterModal(true);
    const handleCloseFilterModal = () => setOpenFilterModal(false);

    const handleApplyFilters = () => {
        setOpenFilterModal(false);
        setCurrentPage(1); // Reset to the first page
    };

    return (
        <div className="flex">
            <UserSideNav />

            <div className="w-[80%] ml-[20%] p-6">
                <Typography variant="h5" gutterBottom>Application History</Typography>
                <IconButton onClick={handleOpenFilterModal} color="primary">
                    <FilterListIcon />
                </IconButton>

                {/* Filter Modal */}
                <Dialog open={openFilterModal} onClose={handleCloseFilterModal}>
                    <DialogTitle>Apply Filters</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Status"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Start Date"
                            type="date"
                            value={filterDateRange.startDate}
                            onChange={(e) => setFilterDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="End Date"
                            type="date"
                            value={filterDateRange.endDate}
                            onChange={(e) => setFilterDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseFilterModal} color="primary">Cancel</Button>
                        <Button onClick={handleApplyFilters} color="primary">Apply</Button>
                    </DialogActions>
                </Dialog>

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
                                                    View Details
                                                </Button>
                                            </TableCell>
                                            <TableCell>{jobOrder.status || 'N/A'}</TableCell>
                                            <TableCell>
                                                {jobOrder.status === 'rejected' && (
                                                    <Button variant="contained" color="primary" onClick={() => handleOpenRejectionReasonModal(jobOrder)}>
                                                        View Reason
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell>{new Date(jobOrder.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(jobOrder.updatedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {jobOrder.feedback ? (
                                                    <Button variant="contained" color="primary" onClick={() => handleOpenFeedbackViewModal(jobOrder)}>
                                                        View Feedback
                                                    </Button>
                                                ) : (
                                                    jobOrder.status === 'completed' && !jobOrder.feedbackSubmitted && (
                                                        <Button variant="contained" color="primary" onClick={() => handleOpenFeedbackModal(jobOrder)}>
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
                        <RejectionReasonModal
                            open={openRejectionReasonModal}
                            onClose={handleCloseRejectionReasonModal}
                            reason={rejectionReasonContent.reason} // Update this to match the structure of rejectionReasonContent
                        />

                        {/* Feedback Modal for Viewing Feedback */}
                        <FeedbackModal
                            open={Boolean(userFeedback)}
                            onClose={() => setUserFeedback(null)}
                            feedback={userFeedback}
                        />

                        {/* Submit Feedback Modal */}
                        <SubmitFeedbackModal
                            open={openModal}
                            onClose={handleCloseModal}
                            feedback={feedback}
                            handleFeedbackChange={handleFeedbackChange}
                            handleFeedbackSubmit={handleFeedbackSubmit}
                        />

                    </>
                )}
            </div>
        </div>
    );
};

export default UserHistory;
