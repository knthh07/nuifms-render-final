import React, { useEffect, useState } from "react";
import axios from 'axios';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import { Box, Pagination, Button, Modal, Typography, TextField } from '@mui/material';

const SuperAdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
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
                console.error('Error fetching requests:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage]);

    const handleApprove = async (id) => {
        try {
            await axios.patch(`/api/requests/${id}/approve`, {}, { withCredentials: true });
            setRequests(prevRequests => prevRequests.filter(request => request._id !== id));
        } catch (error) {
            console.error('Error approving request:', error);
        }
    };

    const handleReject = async () => {
        try {
            await axios.patch(`/api/requests/${selectedRequest._id}/reject`, { reason: rejectReason }, { withCredentials: true });
            setRequests(prevRequests => prevRequests.filter(request => request._id !== selectedRequest._id));
            setRejectModalOpen(false);
            setRejectReason("");
        } catch (error) {
            console.error('Error rejecting request:', error);
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
            <SuperAdminSideNav />
            <div className="w-full">
                <div className="w-[77%] ml-[21.5%] mt-8 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl mb-4">Requests</h2>
                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {requests && requests.length > 0 ? (
                                    requests.map((request, index) => (
                                        <div key={request._id || index} className="p-4 bg-white rounded-lg shadow-md">
                                            <h5 className="font-bold">Requestor: {request.firstName} {request.lastName}</h5>
                                            <p className="text-gray-600"><b>Requesting College/Office: </b>{request.reqOffice}</p>
                                            <p className="text-gray-600"><b>Campus:</b> {request.campus}</p>
                                            <Button
                                                variant="contained"
                                                onClick={() => handleOpenModal(request)}
                                                className="mt-2"
                                            >
                                                View Details
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleApprove(request._id)}
                                                className="mt-2"
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleOpenRejectModal(request)}
                                                className="mt-2 ml-2"
                                            >
                                                Reject
                                            </Button>
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
                    <Modal
                        open={rejectModalOpen}
                        onClose={handleCloseRejectModal}
                        aria-labelledby="reject-reason-modal-title"
                        aria-describedby="reject-reason-modal-description"
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',  // Use percentage for responsiveness
                            maxWidth: 400,  // Maximum width for larger screens
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 2,
                            overflowY: 'auto' // Handle overflow
                        }}>
                            <Typography id="reject-reason-modal-title" variant="h6" component="h2">
                                Reject Reason
                            </Typography>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Reason for Rejection"
                                multiline
                                rows={4}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button onClick={handleCloseRejectModal} variant="outlined" color="error" sx={{ mr: 2 }}>
                                    Cancel
                                </Button>
                                <Button onClick={handleReject} variant="contained" color="primary">
                                    Reject
                                </Button>
                            </Box>
                        </Box>
                    </Modal>

                    {/* Details Modal */}
                    <Modal
                        open={modalOpen}
                        onClose={handleCloseModal}
                        aria-labelledby="request-details-modal-title"
                        aria-describedby="request-details-modal-description"
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',  // Use percentage for responsiveness
                            maxWidth: 800,  // Maximum width for larger screens
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 2,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },  // Column on small screens, row on larger screens
                            gap: 2,  // Space between items
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                flex: 1,
                                overflowY: 'auto',
                                maxWidth: { xs: '100%', sm: '60%' },  // Adjust width based on screen size
                            }}>
                                <Typography id="request-details-modal-title" variant="h6" component="h2">
                                    Application Details
                                </Typography>
                                {selectedRequest && (
                                    <Box mt={2}>
                                        <Typography variant="body1"><b>Requestor:</b> {selectedRequest.firstName} {selectedRequest.lastName}</Typography>
                                        <Typography variant="body1"><b>Requesting College/Office:</b> {selectedRequest.reqOffice}</Typography>
                                        <Typography variant="body1"><b>Description:</b> {selectedRequest.jobDesc}</Typography>
                                        <Typography variant="body1"><b>Building:</b> {selectedRequest.building}</Typography>
                                        <Typography variant="body1"><b>Campus:</b> {selectedRequest.campus}</Typography>
                                        <Typography variant="body1"><b>Floor:</b> {selectedRequest.floor}</Typography>
                                        <Typography variant="body1"><b>Room:</b> {selectedRequest.room}</Typography>
                                        <Typography variant="body1"><b>Date Requested:</b> {new Date(selectedRequest.createdAt).toLocaleDateString()}</Typography>
                                    </Box>
                                )}
                            </Box>
                            {selectedRequest?.fileUrl && (
                                <Box sx={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    maxWidth: { xs: '100%', sm: '100%' },  // Adjust width based on screen size
                                    overflow: 'hidden'
                                }}>
                                    <img
                                        src={`http://localhost:5080/${selectedRequest.fileUrl}`}
                                        alt="Submitted File"
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminRequests;

