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
import Loader from '../../hooks/Loader';
import ReasonModal from '../ReasonModal';
import PaginationComponent from '../../hooks/Pagination';

// Lazy loading the ViewDetailsModal
const ViewDetailsModal = lazy(() => import('../ViewDetailsModal'));

const JobOrderTable = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingOrder, setEditingOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [priority, setPriority] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [status, setStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [dateAssigned, setDateAssigned] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [costRequired, setCostRequired] = useState('');
    const [chargeTo, setChargeTo] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [trackingStatus, setTrackingStatus] = useState('');
    const [trackingNote, setTrackingNote] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmActionId, setConfirmActionId] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [reasonModalOpen, setReasonModalOpen] = useState(false); // Separate state for ReasonModal


    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/jobOrders', { params: { page: currentPage, status: 'approved' }, withCredentials: true });
                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                toast.error(`Error: ${error.response?.data?.message || 'Something went wrong'}`);
                console.error('Error fetching job orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchEmployees = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/users?role=user&position=Facilities Employee', { withCredentials: true });
                setUsers(response.data.users);
            } catch (error) {
                toast.error(`Error: ${error.response?.data?.message || 'Something went wrong'}`);
                console.error('Error fetching employees:', error);
            } finally {
                setIsLoading(false);
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

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setViewModalOpen(true);
    };

    const handleConfirmAction = async (action) => {
        if (action === 'reject') {
            try {
                setIsLoading(true);
                await axios.patch(`/api/jobOrders/${confirmActionId}/reject`, { reason: rejectReason }, { withCredentials: true });
                setJobOrders(jobOrders.filter(order => order._id !== confirmActionId));
                handleCloseReasonModal();
                toast.success('Job order marked as not completed');
            } catch (error) {
                console.error('Error rejecting job order:', error.response ? error.response.data : error);
                toast.error('Please state the reason for rejection.');
            } finally {
                setIsLoading(false);
            }
        } else if (confirmAction === 'complete') {
            try {
                setIsLoading(true);
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
            } finally {
                setIsLoading(false);
            }
        }
        setConfirmOpen(false);
        setConfirmAction(null);
        setConfirmActionId(null);
        setModalOpen(false); // Close modal after action
        setRejectReason(''); // Reset reason
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const response = await axios.patch(`/api/jobOrders/${editingOrder._id}/update`, {
                priority,
                assignedTo: users.find(user => `${user.firstName} ${user.lastName}` === assignedTo)?.email,
                status,
                dateAssigned,// New field
                dateFrom,  // New field
                dateTo,  // New field
                costRequired,  // New field
                chargeTo  // New field
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenTrackingModal = (order) => {
        setSelectedOrder(order);
        setTrackingModalOpen(true);
    };

    const handleAddTracking = async () => {
        try {
            setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenReasonModal = (jobOrderId) => {
        setConfirmActionId(jobOrderId);
        setReasonModalOpen(true); // Open ReasonModal
        setRejectReason(''); // Reset the reason when opening the modal

    };

    const handleCloseReasonModal = () => {
        setReasonModalOpen(false); // Open ReasonModal
        setRejectReason(''); // Reset the reason when opening the modal

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

    return (
        <div className="flex">
            <div className="flex flex-col w-full">
                <div className="w-[80%] ml-[20%] h-screen p-6 bg-gray-50 rounded-lg shadow-lg">
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Job Orders
                        </Typography>
                        <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>
                                            Name of Personnel
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>
                                            Building
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>
                                            Job Description
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>
                                            Assigned To
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold' }}>
                                            Priority
                                        </TableCell>
                                        <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', fontWeight: 'bold', textAlign: 'center' }}>
                                            Manage
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {jobOrders.length > 0 ? (
                                        jobOrders.map((order) => (
                                            <TableRow key={order._id}>
                                                <TableCell>{order.firstName} {order.lastName}</TableCell>
                                                <TableCell>{order.building}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => handleViewDetails(order)}
                                                    >
                                                        View Details
                                                    </Button>
                                                </TableCell>
                                                <TableCell>{order.assignedTo || 'N/A'}</TableCell>
                                                <TableCell>{order.priority || 'N/A'}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <IconButton aria-label="edit" onClick={() => handleEdit(order)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() => handleOpenReasonModal(order._id)}
                                                        aria-label="reject"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    <IconButton aria-label="complete" onClick={() => {
                                                        setConfirmAction('complete');
                                                        setConfirmActionId(order._id);
                                                        setConfirmOpen(true);
                                                    }}>
                                                        <CheckCircleIcon />
                                                    </IconButton>
                                                    {/* Tracking button can be included here as well */}
                                                    <IconButton aria-label="add-tracking" onClick={() => handleOpenTrackingModal(order)}>
                                                        <VisibilityIcon /> {/* Replace this with the actual icon for tracking */}
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6}>
                                                <Skeleton variant="text" />
                                                <Skeleton variant="text" />
                                                <Skeleton variant="text" />
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <PaginationComponent
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                        {/* View Details Modal */}
                        <Suspense fallback={<div>Loading...</div>}>
                            <ViewDetailsModal
                                open={viewModalOpen}
                                onClose={() => setViewModalOpen(false)}
                                request={selectedOrder}
                            />
                        </Suspense>

                        {/* Edit Modal */}
                        <Modal
                            open={modalOpen}
                            onClose={() => setModalOpen(false)}
                            aria-labelledby="modal-modal-title"
                            aria-describedby="modal-modal-description"
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%', /* Responsive width */
                                maxWidth: 500, /* Max width */
                                bgcolor: 'background.paper',
                                border: '2px solid #000',
                                boxShadow: 24,
                                p: 4,
                            }}>
                                <Typography id="modal-modal-title" variant="h6" component="h2">
                                    For Physical Facilities Office Remarks
                                </Typography>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                    >
                                        <MenuItem value="Low Importance">Low Importance</MenuItem>
                                        <MenuItem value="High Importance">High Importance</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Assigned To</InputLabel>
                                    <Select
                                        value={assignedTo}
                                        onChange={(e) => setAssignedTo(e.target.value)}
                                    >
                                        {users.map(employee => (
                                            <MenuItem key={employee._id} value={`${employee.firstName} ${employee.lastName}`}>
                                                {employee.firstName} {employee.lastName}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label="Date Assigned"
                                        type="date"
                                        name="dateAssigned"
                                        value={formatDate(dateAssigned)}
                                        onChange={handleDateChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </FormControl>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <FormControl margin="normal" sx={{ width: '48%' }}>
                                        <TextField
                                            label="Date From"
                                            type="date"
                                            name="dateFrom"
                                            value={formatDate(dateFrom)}
                                            onChange={handleDateChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl margin="normal" sx={{ width: '48%' }}>
                                        <TextField
                                            label="Date To"
                                            type="date"
                                            name="dateTo"
                                            value={formatDate(dateTo)}
                                            onChange={handleDateChange}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </FormControl>
                                </Box>

                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label="Cost Required"
                                        type="number"
                                        value={costRequired}
                                        onChange={(e) => setCostRequired(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">₱</InputAdornment>
                                            ),
                                        }}
                                    />
                                </FormControl>

                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label="Charge To"
                                        value={chargeTo}
                                        onChange={(e) => setChargeTo(e.target.value)}
                                    />
                                </FormControl>

                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Button onClick={handleUpdate} variant="contained" color="primary">
                                        Update
                                    </Button>
                                    <Button onClick={() => setTrackingModalOpen(false)} variant="contained" color="error" sx={{ mt: 1 }}>
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>

                        {/* Tracking Modal */}
                        <Modal
                            open={trackingModalOpen}
                            onClose={() => setTrackingModalOpen(false)}
                            aria-labelledby="tracking-modal-title"
                            aria-describedby="tracking-modal-description"
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%', /* Responsive width */
                                maxWidth: 500, /* Max width */
                                bgcolor: 'background.paper',
                                border: '2px solid #000',
                                boxShadow: 24,
                                p: 4,
                            }}>
                                <Typography id="tracking-modal-title" variant="h6" component="h2">
                                    Add Tracking Update
                                </Typography>
                                <FormControl fullWidth margin="normal">
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={trackingStatus}
                                        onChange={(e) => setTrackingStatus(e.target.value)}
                                    >
                                        <MenuItem value="on-hold">On-Hold</MenuItem>
                                        <MenuItem value="ongoing">Ongoing</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControl fullWidth margin="normal">
                                    <TextField
                                        label="Note"
                                        multiline
                                        rows={4}
                                        value={trackingNote}
                                        onChange={(e) => setTrackingNote(e.target.value)}
                                    />
                                </FormControl>
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Button
                                        onClick={handleAddTracking}
                                        variant="contained"
                                        color="primary"
                                        sx={{ minWidth: '100px' }} // Adjust the minWidth as needed
                                    >
                                        Add Update
                                    </Button>
                                    <Button
                                        onClick={() => setTrackingModalOpen(false)}
                                        variant="contained"
                                        color="error"
                                        sx={{ mt: 1, minWidth: '125px' }} // Ensure this matches the minWidth of the first button
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>

                        {/* Confirmation Modal */}
                        <Modal
                            open={confirmOpen}
                            onClose={() => setConfirmOpen(false)}
                            aria-labelledby="confirmation-modal-title"
                            aria-describedby="confirmation-modal-description"
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '90%', /* Responsive width */
                                maxWidth: 400, /* Max width */
                                bgcolor: 'background.paper',
                                border: '2px solid #000',
                                boxShadow: 24,
                                p: 4,
                            }}>
                                <Typography id="confirmation-modal-title" variant="h6" component="h2">
                                    Are you sure?
                                </Typography>
                                <Typography id="confirmation-modal-description" sx={{ mt: 2 }}>
                                    Are you sure you want to {confirmAction === 'reject' ? 'reject' : 'complete'} this job order?
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Button
                                        onClick={handleConfirmAction}
                                        variant="contained"
                                        color="primary"
                                        sx={{ minWidth: '100px' }} // Adjust the minWidth as needed
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        onClick={() => setConfirmOpen(false)}
                                        variant="contained"
                                        color="error"
                                        sx={{ mt: 1, minWidth: '100px' }} // Ensure this matches the minWidth of the first button
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>

                        <ReasonModal
                            open={reasonModalOpen} // Use separate state for ReasonModal
                            onClose={() => setReasonModalOpen(false)} // Close method for ReasonModal
                            rejectReason={rejectReason}
                            setRejectReason={setRejectReason}
                            onReject={() => handleConfirmAction('reject')} // Pass rejection reason
                        />
                    </Box>
                    <Loader isLoading={isLoading} />
                </div >
            </div >
        </div >
    );
};

export default JobOrderTable;
