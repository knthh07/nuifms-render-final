import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Typography, IconButton, Button } from '@mui/material'; 
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close'; 
import axios from 'axios';
import Loader from '../hooks/Loader';
import RejectionReasonModal from './RejectionReasonModal';

// Lazy load the ViewDetailsModal and FilterModal
const ViewDetailsModal = lazy(() => import('./ViewDetailsModal'));
const FilterModal = lazy(() => import('./FilterModal'));

const ArchivePage = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [filterBy, setFilterBy] = useState('day'); // day, month, year
    const [openFilterModal, setOpenFilterModal] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [openRejectionReasonModal, setOpenRejectionReasonModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [rejectionReasonContent, setRejectionReasonContent] = useState({ reason: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/jobOrders', {
                    params: {
                        page: currentPage,
                        ...(status && { status }),
                        ...(lastName && { lastName }),
                        ...(dateRange.startDate && dateRange.endDate && {
                            dateRange: `${dateRange.startDate}:${dateRange.endDate}`,
                            filterBy
                        }),
                    },
                    withCredentials: true
                });

                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Error fetching job orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobOrders();
    }, [currentPage, status, lastName, dateRange, filterBy]);

    const handleOpenFilterModal = () => setOpenFilterModal(true);
    const handleCloseFilterModal = () => setOpenFilterModal(false);

    const handleOpenDetailsModal = (order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedOrder(null);
    };

    const handleOpenRejectionReasonModal = (order) => {
        setRejectionReasonContent({ reason: order.rejectionReason || 'No rejection reason provided.' });
        setOpenRejectionReasonModal(true);
    };

    const handleCloseRejectionReasonModal = () => {
        setOpenRejectionReasonModal(false);
    };

    const handleApplyFilters = () => {
        setOpenFilterModal(false);
        setCurrentPage(1); // Reset to the first page
    };

    return (
        <div className="w-[80%] ml-[20%] p-6">
            <Box>
                <Typography variant="h5" gutterBottom>Archived Requests</Typography>

                {/* Filter Button */}
                <IconButton onClick={handleOpenFilterModal} color="primary">
                    <FilterListIcon />
                </IconButton>

                {/* Filter Modal */}
                <Suspense fallback={<div>Loading...</div>}>
                    <FilterModal
                        open={openFilterModal}
                        onClose={handleCloseFilterModal}
                        status={status}
                        setStatus={setStatus}
                        lastName={lastName}
                        setLastName={setLastName}
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        filterBy={filterBy}
                        setFilterBy={setFilterBy}
                        onApply={handleApplyFilters}
                    />
                </Suspense>

                <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Job Description</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date Submitted</TableCell>
                                <TableCell>Rejection Reason</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobOrders.length > 0 ? (
                                jobOrders.map((order) => (
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
                                        <TableCell>{order.priority || 'N/A'}</TableCell>
                                        <TableCell>{order.status}</TableCell>
                                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {order.status === 'rejected' && (
                                                <Button 
                                                    variant="contained" 
                                                    color="primary" 
                                                    onClick={() => handleOpenRejectionReasonModal(order)}
                                                >
                                                    View Rejection Reason
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7}>No job orders found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box className="flex justify-center mt-2">
                    <Pagination count={totalPages} page={currentPage} onChange={(e, value) => setCurrentPage(value)} />
                </Box>
            </Box>

            {/* Details Modal */}
            <Suspense fallback={<div>Loading...</div>}>
                <ViewDetailsModal
                    open={detailsModalOpen}
                    onClose={handleCloseDetailsModal}
                    request={selectedOrder}
                />
            </Suspense>

            {/* Rejection Reason Modal */}
            <RejectionReasonModal
                open={openRejectionReasonModal}
                onClose={handleCloseRejectionReasonModal}
                reason={rejectionReasonContent.reason}
            />
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default ArchivePage;
