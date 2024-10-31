import React, { useEffect, useState, Suspense, lazy } from "react";
import axios from 'axios';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Typography, Box, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, Skeleton, IconButton, FormControl,
    InputLabel, Select, MenuItem
} from '@mui/material';
import FeedbackModal from "../Components/FeedbackModal";
import { toast } from 'react-hot-toast'; // Make sure to import react-hot-toast
import FilterListIcon from '@mui/icons-material/FilterList';
import Loader from '../hooks/Loader';
const ViewDetailsModal = lazy(() => import('../Components/ViewDetailsModal'));
import RejectionReasonModal from "../Components/RejectionReasonModal"; // Import the new modal
import SubmitFeedbackModal from "../Components/SubmitFeedbackModal";
import PaginationComponent from "../hooks/Pagination";

const UserHistory = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
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
    const [isLoading, setLoading] = useState(false); // Loading state

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

    const handlePageChange = (page) => {
        setCurrentPage(page);
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

    // Function to map status values to user-friendly labels
    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed':
                return 'Complete';
            case 'notCompleted':
                return 'Not Completed';
            case 'rejected':
                return 'Rejected';
            case 'pending':
                return 'Pending';
            case 'ongoing':
                return 'On Going';
            default:
                return 'Unknown'; // or return an empty string if you prefer
        }
    };

    const handleFeedbackSubmit = async () => {
        if (selectedJobOrder) {
            try {
                setLoading(true);
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
                toast.error(error.response?.data.message || 'Failed to submit feedback.');
            } finally {
                setLoading(false);
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
        <div className="flex flex-col">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                    My Job Orders
                </Typography>
                <IconButton onClick={handleOpenFilterModal} color="primary">
                    <FilterListIcon />
                </IconButton>
            </Box>

            {/* Filter Modal */}
            <Dialog open={openFilterModal} onClose={handleCloseFilterModal}>
                <DialogTitle>Apply Filters</DialogTitle>
                <DialogContent>
                    {/* Status Dropdown */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="rejected">Rejected</MenuItem>
                            <MenuItem value="not completed">Not Completed</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Start Date */}
                    <TextField
                        fullWidth
                        label="Start Date"
                        type="date"
                        value={filterDateRange.startDate}
                        onChange={(e) => setFilterDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* End Date */}
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

            {isLoading ? (
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
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Requestor</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Job Description</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Rejection Reason</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Submission Date</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Completion Date</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Feedback</TableCell>
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
                                        <TableCell>{getStatusLabel(jobOrder.status || 'N/A')}</TableCell>
                                        <TableCell>
                                            {['rejected', 'notCompleted', 'completed'].includes(jobOrder.status) ? (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleOpenRejectionReasonModal(jobOrder)}
                                                >
                                                    View Reason
                                                </Button>
                                            ) : null}
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
                    {/* Pagination */}
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
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
                        reason={rejectionReasonContent.reason}
                    />

                    {/* Feedback Modal for Viewing Feedback */}
                    <FeedbackModal
                        open={Boolean(userFeedback)}
                        onClose={() => setUserFeedback(null)}
                        feedback={userFeedback}
                    />

                    {/* Submit Feedback Modal */}
                    <SubmitFeedbackModal
                        open={openFeedbackModal} // Use the correct state variable here
                        onClose={handleCloseFeedbackModal} // Close feedback modal
                        feedback={feedback}
                        handleFeedbackChange={handleFeedbackChange}
                        handleFeedbackSubmit={handleFeedbackSubmit}
                    />
                </>
            )}
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default UserHistory;
