import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Modal, Button, IconButton, Skeleton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import Loader from '../hooks/Loader';
import PaginationComponent from '../hooks/Pagination'; // Import your PaginationComponent

// Lazy load the ViewDetailsModal
const ViewDetailsModal = lazy(() => import('../Components/ViewDetailsModal'));

const UserTrackOrder = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1); // Change initial state to 1
    const [totalPages, setTotalPages] = useState(1); // Total pages state

    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                setIsLoading(true);
                // Fetch job orders from the backend
                const response = await axios.get('/api/history', {
                    params: { status: 'ongoing', page: currentPage }, // Include current page in params
                    withCredentials: true
                });
                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages); // Set total pages from the response
            } catch (error) {
                console.error('Error fetching job orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobOrders();
    }, [currentPage]); // Add currentPage to the dependency array

    const handleOpenTrackingModal = async (order) => {
        try {
            setIsLoading(true);
            const response = await axios.get(`/api/jobOrders/${order._id}/tracking`, { withCredentials: true });
            setSelectedOrder({ ...order, tracking: response.data.jobOrder.tracking });
            setTrackingModalOpen(true);
        } catch (error) {
            console.error('Error fetching tracking data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDescriptionModal = (order) => {
        setSelectedOrder(order);
        setDescriptionModalOpen(true);
    };

    const handleCloseTrackingModal = () => {
        setTrackingModalOpen(false);
        setSelectedOrder(null);
    };

    const handleCloseDescriptionModal = () => {
        setDescriptionModalOpen(false);
        setSelectedOrder(null);
    };

    // Function to get the latest tracking status
    const getLatestTrackingStatus = (tracking) => {
        if (tracking && tracking.length > 0) {
            return tracking[tracking.length - 1]?.status || 'No updates';
        }
        return 'No updates'; // Fallback if no tracking updates are available
    };

    const handlePageChange = (page) => {
        setCurrentPage(page); // Update current page when pagination is changed
    };

    return (
        <div className="flex h-screen">
            <Box>
                <Typography variant="h5" gutterBottom>
                    Active Job Orders Tracking
                </Typography>
                <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
                    {isLoading ? (
                        <Skeleton variant="rectangular" width="100%" height={400} />
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Requestor</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Job Description</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Assigned To</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Action</TableCell>
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
                                                onClick={() => handleOpenDescriptionModal(order)}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                        <TableCell>{order.assignedTo || 'N/A'}</TableCell>
                                        <TableCell >
                                            {getLatestTrackingStatus(order.tracking)}
                                        </TableCell>
                                        <TableCell style={{ display: 'flex', justifyContent: 'center' }}>
                                            <IconButton aria-label="view-tracking" onClick={() => handleOpenTrackingModal(order)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>

                {/* Pagination Component */}
                <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange} // Pass the page change handler
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
                        open={descriptionModalOpen}
                        onClose={handleCloseDescriptionModal}
                        request={selectedOrder}
                    />
                </Suspense>
            </Box>
            <Loader isLoading={isLoading} />
        </div >
    );
};

export default UserTrackOrder;
