import React, { useEffect, useState, lazy, Suspense } from "react";
import axios from 'axios';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, MenuItem, Select, FormControl, InputLabel, TextField, Modal, Button, Skeleton } from '@mui/material';
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
    const [modalOpenEdit, setModalOpenEdit] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [jobOrders, setJobOrders] = useState([]);
    const [editingOrder, setEditingOrder] = useState(null);
    const [urgency, setUrgency] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [dateAssigned, setDateAssigned] = useState('');
    const [campuses, setCampuses] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [offices, setOffices] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [requestsRes, employeesRes] = await Promise.all([
                    axios.get('/api/requests', { params: { page: currentPage }, withCredentials: true }),
                    axios.get('/api/users?role=user&position=Facilities Employee', { withCredentials: true })
                ]);
                setRequests(requestsRes.data.requests);
                setTotalPages(requestsRes.data.totalPages);
                setUsers(employeesRes.data.users);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error fetching data');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentPage]);

    const campusMap = Object.fromEntries(campuses?.map(campus => [campus._id, campus.name]) || {});
    const buildingMap = Object.fromEntries(buildings?.map(building => [building._id, building.name]) || {});
    const officeMap = Object.fromEntries(offices?.map(office => [office._id, office.name]) || {});

    const handleApprove = async (id) => {
        try {
            setLoading(true);
            const response = await axios.patch(`/api/requests/${id}/approve`, {}, { withCredentials: true });
            const updatedJobOrder = response.data.jobOrder;
            setRequests(prev => prev.filter(request => request._id !== id));
            setEditingOrder(updatedJobOrder);
            setUrgency(updatedJobOrder.urgency || '');
            setAssignedTo(updatedJobOrder.assignedTo || '');
            setStatus(updatedJobOrder.status || '');
            setDateAssigned(updatedJobOrder.dateAssigned || '');
            setModalOpen(false);
            setModalOpenEdit(true);
            toast.success('Application approved');
        } catch (error) {
            toast.error('Error approving request');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setLoading(true);
            await axios.patch(`/api/requests/${selectedRequest._id}/reject`, { reason: rejectReason }, { withCredentials: true });
            setRequests(prev => prev.filter(request => request._id !== selectedRequest._id));
            handleCloseRejectModal();
            handleCloseModal();
            toast.success('Application rejected');
        } catch (error) {
            toast.error('Please state rejection reason');
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

    const handleEdit = (order) => {
        setEditingOrder(order);
        setUrgency(order.urgency || '');
        setAssignedTo(order.assignedTo || '');
        setStatus(order.status || '');
        setDateAssigned(order.dateAssigned || '');
        setModalOpenEdit(true);
        setModalOpen(false);
    };

    const handleUpdate = async () => {
        if (!urgency || !assignedTo || !dateAssigned) {
            toast.error('Please fill all required fields');
            return;
        }
        try {
            setLoading(true);
            const userEmail = users.find(user => `${user.firstName} ${user.lastName}` === assignedTo)?.email;
            await axios.patch(`/api/jobOrders/${editingOrder._id}/update`, {
                urgency, assignedTo: userEmail, status, dateAssigned
            }, { withCredentials: true });
            setJobOrders(jobOrders.map(order => order._id === editingOrder._id ? { ...order, urgency, assignedTo, status, dateAssigned } : order));
            setModalOpenEdit(false);
            toast.success('Job order updated');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error updating job order');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';

    return (
        <div className="flex flex-col w-full p-6">
            <Box>
                <Typography variant="h5" gutterBottom>Applications</Typography>
                {isLoading ? (
                    <Table><TableBody><TableRow><TableCell colSpan={9}>
                        <Skeleton variant="text" /><Skeleton variant="text" /><Skeleton variant="text" />
                    </TableCell></TableRow></TableBody></Table>
                ) : (
                    <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>#</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Requestor</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Requesting College/Office</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.length > 0 ? requests.map((request, index) => (
                                    <TableRow key={request._id} hover>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{request.firstName} {request.lastName}</TableCell>
                                        <TableCell>{request.reqOffice}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="primary" onClick={() => handleOpenModal(request)}
                                                startIcon={<VisibilityIcon />}>View Details</Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow><TableCell align="center" colSpan={4} className="text-center text-gray-500">No requests found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <ReasonModal open={rejectModalOpen} onClose={handleCloseRejectModal} rejectReason={rejectReason}
                    setRejectReason={setRejectReason} onReject={handleReject} />

                <Suspense fallback={<Skeleton variant="rect" width="100%" height={200} />}>
                    <DetailsModal open={modalOpen} onClose={handleCloseModal} request={selectedRequest}
                        onApprove={handleApprove} onReject={handleOpenRejectModal} campusMap={campusMap}
                        buildingMap={buildingMap} officeMap={officeMap} />
                </Suspense>

                <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

                <Modal open={modalOpenEdit} onClose={() => setModalOpenEdit(false)}>
                    <Box sx={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: '90%', maxWidth: 500, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4
                    }}>
                        <Typography variant="h6" component="h2">For Physical Facilities Office Remarks</Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Urgency</InputLabel>
                            <Select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                                <MenuItem value="Low">Low</MenuItem>
                                <MenuItem value="High">High</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Assigned To</InputLabel>
                            <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                                {users.map(employee => (
                                    <MenuItem key={employee._id} value={`${employee.firstName} ${employee.lastName}`}>
                                        {employee.firstName} {employee.lastName}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="normal">
                            <TextField label="Date Assigned" type="date" value={formatDate(dateAssigned)}
                                onChange={(e) => setDateAssigned(e.target.value)} InputLabelProps={{ shrink: true }} />
                        </FormControl>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Button onClick={handleUpdate} variant="contained" color="primary">Update</Button>
                            <Button onClick={() => setModalOpenEdit(false)} variant="contained" color="error" sx={{ mt: 1 }}>Cancel</Button>
                        </Box>
                    </Box>
                </Modal>
            </Box>
            <Loader isLoading={isLoading} />
        </div>
    );
};
export default Application;