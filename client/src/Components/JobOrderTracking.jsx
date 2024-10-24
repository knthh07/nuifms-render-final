import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Button, IconButton, Modal, Pagination
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import Loader from '../hooks/Loader';

const ViewDetailsModal = lazy(() => import('./ViewDetailsModal'));

const JobOrderTracking = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [totalPages, setTotalPages] = useState(1); // Total pages state
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/jobOrders', {
                    params: { status: 'approved', page: currentPage }, // Include current page in params
                    withCredentials: true
                });
                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages); // Set total pages from response
            } catch (error) {
                console.error('Error fetching job orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobOrders();
    }, [currentPage]); // Fetch job orders when currentPage changes

    const handleOpenTrackingModal = async (order) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/jobOrders/${order._id}/tracking`, { withCredentials: true });
            if (response.data && response.data.jobOrder) {
                setSelectedOrder({ ...order, tracking: response.data.jobOrder.tracking });
                setTrackingModalOpen(true);
            } else {
                setIsLoading(false);
                console.error('Invalid job order response:', response.data);
            }
        } catch (error) {
            console.error('Error fetching tracking data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDetailsModal = (order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const handleCloseTrackingModal = () => {
        setTrackingModalOpen(false);
        setSelectedOrder(null);
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedOrder(null);
    };

    // Function to get the latest tracking status
    const getLatestTrackingStatus = (tracking) => {
        if (tracking && tracking.length > 0) {
            return tracking[tracking.length - 1]?.status || 'No updates';
        }
        return 'No updates';
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value); // Update current page when pagination is changed
    };

    return (
        <div className="flex flex-col w-full">
            <div className="w-[80%] ml-[20%] p-6">
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Active Job Orders Tracking
                    </Typography>
                    <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Requestor</TableCell>
                                    <TableCell>Job Description</TableCell>
                                    <TableCell>Assigned To</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {jobOrders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell>{order.firstName} {order.lastName}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOpenDetailsModal(order)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                        <TableCell>{order.assignedTo || 'N/A'}</TableCell>
                                        <TableCell>
                                            {getLatestTrackingStatus(order.tracking)}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton aria-label="view-tracking" onClick={() => handleOpenTrackingModal(order)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination Control */}
                    <Pagination
                        count={totalPages}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        className="flex justify-center mt-2"
                    />

                    {/* Tracking Modal */}
                    <Modal
                        open={trackingModalOpen}
                        onClose={handleCloseTrackingModal}
                        aria-labelledby="tracking-modal-title"
                        aria-describedby="tracking-modal-description"
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 600,
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 4,
                        }}>
                            <Typography id="tracking-modal-title" variant="h6" component="h2">
                                Tracking Updates for Job Order: {selectedOrder?._id}
                            </Typography>
                            <Box mt={2}>
                                {selectedOrder?.tracking && selectedOrder.tracking.length > 0 ? (
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Date</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell>Note</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedOrder.tracking.map((update, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{new Date(update.date).toLocaleDateString()}</TableCell>
                                                    <TableCell>{update.status || 'No status'}</TableCell>
                                                    <TableCell>{update.note || 'No note'}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <Typography>No tracking updates available.</Typography>
                                )}
                            </Box>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button onClick={handleCloseTrackingModal} variant="outlined" color="error">
                                    Close
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    {/* Job Description Modal - Using DetailsModal now */}
                    <Suspense fallback={<div>Loading...</div>}>
                        <ViewDetailsModal
                            open={detailsModalOpen}
                            onClose={handleCloseDetailsModal}
                            request={selectedOrder}
                        />
                    </Suspense>
                </Box>
            </div>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default JobOrderTracking;
