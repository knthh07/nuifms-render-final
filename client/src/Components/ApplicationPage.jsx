import React, { useEffect, useState, lazy, Suspense } from "react";
import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Modal
} from '@mui/material';
import Loader from "../hooks/Loader";
import { toast } from 'react-hot-toast';
import ReasonModal from '../Components/ReasonModal';
import PaginationComponent from '../hooks/Pagination';
import VisibilityIcon from '@mui/icons-material/Visibility';

const DetailsModal = lazy(() => import('./DetailsModal'));

const Application = () => {
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectModalOpen, setRejectModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/requests', { params: { page: currentPage }, withCredentials: true });
                setRequests(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                toast.error('Error fetching requests');
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

    const handleApprove = async (id) => {
        try {
            setLoading(true);
            await axios.patch(`/api/requests/${id}/approve`, {}, { withCredentials: true });
            setRequests(prevRequests => prevRequests.filter(request => request._id !== id));
            handleCloseModal();
            toast.success('Application approved successfully');
        } catch (error) {
            toast.error('Error approving request');
            console.error('Error approving request:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            await axios.patch(`/api/requests/${selectedRequest._id}/reject`, { reason: rejectReason }, { withCredentials: true });
            setRequests(prevRequests => prevRequests.filter(request => request._id !== selectedRequest._id));
            handleCloseRejectModal();
            handleCloseModal();
            toast.success('Application rejected successfully');
        } catch (error) {
            toast.error('Please state the reason for rejection.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRejectModal = (request) => {
        setSelectedRequest(request);
        setRejectModalOpen(true);
    };

    const handleCloseRejectModal = () => {
        setRejectModalOpen(false);
        setRejectReason("");
    };

    const handleOpenModal = (request) => {
        setSelectedRequest(request);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRequest(null);
    };

    return (
        <div className="flex flex-col w-full">
            <div className="w-[80%] ml-[20%] p-6">
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Applications
                    </Typography>
                    {isLoading ? (
                        <Skeleton variant="rect" height={200} />
                    ) : (
                        <TableContainer component={Paper} className="shadow-md rounded-lg">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>
                                            Requestor
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>
                                            Requesting College/Office
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requests.length > 0 ? (
                                        requests.map((request) => (
                                            <TableRow key={request._id} hover>
                                                <TableCell style={{ border: '1px solid #e0e0e0', backgroundColor: '#fafafa', color: '#000' }}>
                                                    {request.firstName} {request.lastName}
                                                </TableCell>
                                                <TableCell style={{ border: '1px solid #e0e0e0', backgroundColor: '#fafafa', color: '#000' }}>
                                                    {request.reqOffice}
                                                </TableCell>
                                                <TableCell style={{ border: '1px solid #e0e0e0', backgroundColor: '#fafafa', color: '#000', textAlign: 'center' }}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenModal(request);
                                                        }}
                                                        startIcon={<VisibilityIcon />}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-gray-500">No requests found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Reject Reason Modal */}
                    <ReasonModal
                        open={rejectModalOpen}
                        onClose={handleCloseRejectModal}
                        rejectReason={rejectReason}
                        setRejectReason={setRejectReason}
                        onReject={handleReject}
                    />

                    {/* Details Modal */}
                    <Suspense fallback={<Skeleton variant="rect" width="100%" height={400} />}>
                        <DetailsModal
                            open={modalOpen}
                            onClose={handleCloseModal}
                            request={selectedRequest}
                            onApprove={handleApprove}
                            onReject={handleOpenRejectModal}
                        />
                    </Suspense>

                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </Box>
            </div>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default Application;
