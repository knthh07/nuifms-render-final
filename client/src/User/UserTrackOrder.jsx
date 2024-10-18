import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Modal, Button, IconButton, Skeleton
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import axios from 'axios';
import UserSideNav from '../Components/user_sidenav/UserSideNav';

// Lazy load the ViewDetailsModal
const ViewDetailsModal = lazy(() => import('../Components/ViewDetailsModal'));

const UserTrackOrder = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true); // Set loading to true initially

    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                const response = await axios.get('/api/history', { params: { status: ['approved', 'pending'] }, withCredentials: true });
                setJobOrders(response.data.requests);
            } catch (error) {
                console.error('Error fetching job orders:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching data
            }
        };

        fetchJobOrders();
    }, []);

    const handleOpenTrackingModal = async (order) => {
        try {
            const response = await axios.get(`/api/jobOrders/${order._id}/tracking`, { withCredentials: true });
            setSelectedOrder({ ...order, tracking: response.data.jobOrder.tracking });
            setTrackingModalOpen(true);
        } catch (error) {
            console.error('Error fetching tracking data:', error);
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
            return tracking[tracking.length - 1].status;
        }
        return 'No updates'; // Fallback if no tracking updates are available
    };

    return (
        <div className="flex h-screen">
            <UserSideNav />
            <div className="w-[80%] ml-[20%] p-6">
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Active Job Orders Tracking
                    </Typography>
                    <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
                        {loading ? ( // Show skeleton while loading
                            <Skeleton variant="rectangular" width="100%" height={400} />
                        ) : (
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
                                                    onClick={() => handleOpenDescriptionModal(order)}
                                                >
                                                    View Description
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
                        )}
                    </TableContainer>

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
                                                    <TableCell>{update.status}</TableCell>
                                                    <TableCell>{update.note}</TableCell>
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

                    {/* Job Description Modal (Lazy Loaded) */}
                    <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={400} />}>
                        {descriptionModalOpen && (
                            <ViewDetailsModal
                                open={descriptionModalOpen}
                                onClose={handleCloseDescriptionModal}
                                request={selectedOrder} // Pass the selected order details
                            />
                        )}
                    </Suspense>
                </Box>
            </div>
        </div>
    );
};

export default UserTrackOrder;
