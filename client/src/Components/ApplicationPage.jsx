import React, { useEffect, useState, lazy, Suspense } from "react";
import axios from 'axios';
import { Box, Pagination, Button, Typography, Skeleton } from '@mui/material';
import Loader from "../hooks/Loader";
import { toast } from 'react-hot-toast';
import ReasonModal from '../Components/ReasonModal'; // Import the new modal component
const DetailsModal = lazy(() => import('./DetailsModal'));

const Application = () => {
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isloading, setLoading] = useState(true);
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
            handleCloseModal(); // Close the modal after approval
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
            handleCloseModal(); // Close the modal after rejection
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
        <div className="flex">
            <div className="flex flex-col w-full">
                <div className="w-[80%] ml-[20%] p-6">
                    <Typography variant="h5" gutterBottom>Applications</Typography>
                    {isloading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, index) => (
                                <Skeleton key={index} variant="rect" height={100} />
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {requests.length > 0 ? (
                                    requests.map((request) => (
                                        <div key={request._id} className="p-4 bg-white shadow-md">
                                            <Typography variant="h6" className="font-bold">
                                                Requestor: {request.firstName} {request.lastName}
                                            </Typography>
                                            <Typography className="text-gray-600">
                                                <strong>Requesting College/Office:</strong> {request.reqOffice}
                                            </Typography>
                                            <div className="mt-2 flex space-x-2">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleOpenModal(request)}
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center">No requests found.</div>
                                )}
                            </div>
                            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3 }}>
                                <Pagination count={totalPages} page={currentPage} onChange={(e, value) => setCurrentPage(value)} />
                            </Box>
                        </>
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
                </div>
            </div>
            <Loader isLoading={isloading} />
        </div>
    );
};

export default Application;
