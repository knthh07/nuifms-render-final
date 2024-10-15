import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Pagination, Typography, MenuItem, Select, FormControl, InputLabel, TextField, Modal, Button, InputAdornment, Skeleton
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-hot-toast';

// Lazy load DetailsModal
const DetailsModal = lazy(() => import('../DetailsModal'));

const JobOrderTable = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingOrder, setEditingOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false); // For DetailsModal
    const [selectedRequest, setSelectedRequest] = useState(null); // For selected request
    const [priority, setPriority] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [dateAssigned, setDateAssigned] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [costRequired, setCostRequired] = useState('');
    const [chargeTo, setChargeTo] = useState('');
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [trackingStatus, setTrackingStatus] = useState('');
    const [trackingNote, setTrackingNote] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmActionId, setConfirmActionId] = useState(null);

    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                const response = await axios.get('/api/jobOrders', { params: { page: currentPage, status: 'approved' }, withCredentials: true });
                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Error fetching job orders:', error);
            }
        };

        const fetchEmployees = async () => {
            try {
                const response = await axios.get('/api/users?role=user&position=Facilities Employee', { withCredentials: true });
                setUsers(response.data.users);
            } catch (error) {
                console.error('Error fetching employees:', error);
            }
        };

        fetchJobOrders();
        fetchEmployees();
    }, [currentPage]);

    const handleEdit = (order) => {
        setEditingOrder(order);
        setPriority(order.priority || '');
        setAssignedTo(order.assignedTo || '');
        setStatus(order.status || '');
        setDateAssigned(order.dateAssigned || '');
        setDateFrom(order.dateFrom || '');
        setDateTo(order.dateTo || '');
        setCostRequired(order.costRequired || '');
        setChargeTo(order.chargeTo || '');

        setModalOpen(true);
    };

    const handleConfirmAction = async () => {
        if (confirmAction === 'delete') {
            try {
                await axios.patch(`/api/jobOrders/${confirmActionId}/delete`, {}, { withCredentials: true });
                setJobOrders(jobOrders.filter(order => order._id !== confirmActionId));
                toast.success('Job order deleted successfully');
            } catch (error) {
                console.error('Error deleting job order:', error);
                toast.error('Error deleting job order');
            }
        } else if (confirmAction === 'complete') {
            try {
                await axios.patch(`/api/jobOrders/${confirmActionId}/complete`, {}, { withCredentials: true });
                setJobOrders(jobOrders.map(order =>
                    order._id === confirmActionId
                        ? { ...order, status: 'completed' }
                        : order
                ));
                toast.success('Job order marked as completed');
            } catch (error) {
                console.error('Error marking job order as completed:', error);
                toast.error('Error marking job order as completed');
            }
        }
        setConfirmOpen(false);
        setConfirmAction(null);
        setConfirmActionId(null);
    };

    const handleUpdate = async () => {
        try {
            const response = await axios.patch(`/api/jobOrders/${editingOrder._id}/update`, {
                priority,
                assignedTo: users.find(user => `${user.firstName} ${user.lastName}` === assignedTo)?.email,
                status,
                dateAssigned,
                dateFrom,
                dateTo,
                costRequired,
                chargeTo
            }, { withCredentials: true });

            setJobOrders(jobOrders.map(order =>
                order._id === editingOrder._id
                    ? {
                        ...order,
                        priority,
                        assignedTo,
                        status,
                        dateAssigned,
                        dateFrom,
                        dateTo,
                        costRequired,
                        chargeTo
                    }
                    : order
            ));
            setModalOpen(false);
            toast.success('Job order updated successfully');
        } catch (error) {
            console.error('Error updating job order:', error);
            toast.error('Error updating job order');
        }
    };

    const handleOpenTrackingModal = (order) => {
        setSelectedOrder(order);
        setTrackingModalOpen(true);
    };

    const handleAddTracking = async () => {
        try {
            const currentOrder = jobOrders.find(order => order._id === selectedOrder._id);
            const currentTracking = Array.isArray(currentOrder.tracking) ? currentOrder.tracking : [];

            const newTracking = [...currentTracking, { status: trackingStatus, date: new Date(), note: trackingNote }];

            await axios.patch(`/api/jobOrders/${selectedOrder._id}/tracking`, {
                tracking: newTracking
            }, { withCredentials: true });

            setJobOrders(jobOrders.map(order =>
                order._id === selectedOrder._id
                    ? { ...order, tracking: newTracking }
                    : order
            ));
            setTrackingModalOpen(false);
            toast.success('Tracking update added successfully');
        } catch (error) {
            console.error('Error adding tracking update:', error);
            toast.error('Error adding tracking update');
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Handle date change
    const handleDateChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'dateAssigned':
                setDateAssigned(value);
                break;
            case 'dateFrom':
                setDateFrom(value);
                break;
            case 'dateTo':
                setDateTo(value);
                break;
            default:
                break;
        }
    };

    const handleOpenDetailsModal = (order) => {
        setSelectedRequest(order);
        setDetailsModalOpen(true);
    };

    return (
        <div className="w-[80%] ml-[20%] p-6">
            <Box>
                <Typography variant="h5" gutterBottom>
                    Job Orders
                </Typography>
                <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name of Personnel</TableCell>
                                <TableCell>Building</TableCell>
                                <TableCell>Job Description</TableCell>
                                <TableCell>Assigned To</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Manage</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {jobOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <Skeleton variant="rectangular" width="100%" height={118} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                jobOrders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell>{order.firstName} {order.lastName}</TableCell>
                                        <TableCell>{order.building}</TableCell>
                                        <TableCell>
                                            <Button variant="outlined" onClick={() => handleOpenDetailsModal(order)}>
                                                View Details
                                            </Button>
                                        </TableCell>
                                        <TableCell>{order.assignedTo || 'N/A'}</TableCell>
                                        <TableCell>{order.priority || 'N/A'}</TableCell>
                                        <TableCell>
                                            <IconButton aria-label="edit" onClick={() => handleEdit(order)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton aria-label="delete" onClick={() => {
                                                setConfirmAction('delete');
                                                setConfirmActionId(order._id);
                                                setConfirmOpen(true);
                                            }}>
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton aria-label="complete" onClick={() => {
                                                setConfirmAction('complete');
                                                setConfirmActionId(order._id);
                                                setConfirmOpen(true);
                                            }}>
                                                <CheckCircleIcon />
                                            </IconButton>
                                            <IconButton aria-label="view" onClick={() => handleOpenTrackingModal(order)}>
                                                <VisibilityIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Pagination count={totalPages} page={currentPage} onChange={(event, value) => setCurrentPage(value)} />
            </Box>

            {/* Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <Box className="modal-content">
                    <Typography variant="h6">Edit Job Order</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Priority</InputLabel>
                        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                            <MenuItem value="Low">Low</MenuItem>
                            <MenuItem value="Medium">Medium</MenuItem>
                            <MenuItem value="High">High</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Assigned To</InputLabel>
                        <Select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                            {users.map(user => (
                                <MenuItem key={user.email} value={`${user.firstName} ${user.lastName}`}>{`${user.firstName} ${user.lastName}`}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        label="Date Assigned"
                        type="date"
                        name="dateAssigned"
                        value={formatDate(dateAssigned)}
                        onChange={handleDateChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Date From"
                        type="date"
                        name="dateFrom"
                        value={formatDate(dateFrom)}
                        onChange={handleDateChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Date To"
                        type="date"
                        name="dateTo"
                        value={formatDate(dateTo)}
                        onChange={handleDateChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Cost Required"
                        type="number"
                        value={costRequired}
                        onChange={(e) => setCostRequired(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Charge To"
                        value={chargeTo}
                        onChange={(e) => setChargeTo(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" onClick={handleUpdate}>
                        Save
                    </Button>
                </Box>
            </Modal>

            {/* Confirm Action Modal */}
            <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <Box className="modal-content">
                    <Typography variant="h6">Confirm Action</Typography>
                    <Typography>
                        {confirmAction === 'delete' ? 'Are you sure you want to delete this job order?' : 'Are you sure you want to mark this job order as completed?'}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleConfirmAction}>
                        Confirm
                    </Button>
                    <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
                        Cancel
                    </Button>
                </Box>
            </Modal>

            {/* Tracking Modal */}
            <Modal open={trackingModalOpen} onClose={() => setTrackingModalOpen(false)}>
                <Box className="modal-content">
                    <Typography variant="h6">Add Tracking Update</Typography>
                    <TextField
                        label="Status"
                        value={trackingStatus}
                        onChange={(e) => setTrackingStatus(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Note"
                        value={trackingNote}
                        onChange={(e) => setTrackingNote(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <Button variant="contained" onClick={handleAddTracking}>
                        Add
                    </Button>
                </Box>
            </Modal>

            {/* Details Modal */}
            <Suspense fallback={<div>Loading...</div>}>
                <DetailsModal open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} request={selectedRequest} />
            </Suspense>
        </div>
    );
};

export default JobOrderTable;
