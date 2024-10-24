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
    const [reasonModalOpen, setReasonModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/jobOrders', { params: { page: currentPage, status: 'approved' }, withCredentials: true });
                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages);
            } catch (error) {
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

    const handleConfirmAction = async () => {
        try {
            setIsLoading(true);
            if (confirmAction === 'reject') {
                await axios.patch(`/api/jobOrders/${confirmActionId}/reject`, {}, { withCredentials: true });
                setJobOrders(jobOrders.filter(order => order._id !== confirmActionId));
                toast.success('Job order marked as not completed');
            } else if (confirmAction === 'complete') {
                await axios.patch(`/api/jobOrders/${confirmActionId}/complete`, {}, { withCredentials: true });
                setJobOrders(jobOrders.map(order =>
                    order._id === confirmActionId ? { ...order, status: 'completed' } : order
                ));
                toast.success('Job order marked as completed');
            }
        } catch (error) {
            toast.error('Error processing the action');
        } finally {
            setIsLoading(false);
            setConfirmOpen(false);
            setConfirmAction(null);
            setConfirmActionId(null);
        }
    };

    const handleReject = (orderId) => {
        setConfirmAction('reject');
        setConfirmActionId(orderId);
        setReasonModalOpen(true); // Open the ReasonModal when rejecting
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            await axios.patch(`/api/jobOrders/${editingOrder._id}/update`, {
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
                    ? { ...order, priority, assignedTo, status, dateAssigned, dateFrom, dateTo, costRequired, chargeTo }
                    : order
            ));
            toast.success('Job order updated successfully');
            setModalOpen(false);
        } catch (error) {
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
            const newTracking = [...(currentOrder.tracking || []), { status: trackingStatus, date: new Date(), note: trackingNote }];

            await axios.patch(`/api/jobOrders/${selectedOrder._id}/tracking`, { tracking: newTracking }, { withCredentials: true });

            setJobOrders(jobOrders.map(order =>
                order._id === selectedOrder._id ? { ...order, tracking: newTracking } : order
            ));
            toast.success('Tracking update added successfully');
            setTrackingModalOpen(false);
        } catch (error) {
            toast.error('Error adding tracking update');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const handleDateChange = (e) => {
        const { name, value } = e.target;
        if (name === 'dateAssigned') setDateAssigned(value);
        else if (name === 'dateFrom') setDateFrom(value);
        else if (name === 'dateTo') setDateTo(value);
    };

    return (
        <div className="w-[80%] ml-[20%] p-6">
            <Box>
                <Typography variant="h5" gutterBottom>Job Orders</Typography>
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
                            {jobOrders.length > 0 ? (
                                jobOrders.map((order) => (
                                    <TableRow key={order._id}>
                                        <TableCell>{order.firstName} {order.lastName}</TableCell>
                                        <TableCell>{order.building}</TableCell>
                                        <TableCell>
                                            <Button variant="contained" color="primary" onClick={() => handleViewDetails(order)}>
                                                View Details
                                            </Button>
                                        </TableCell>
                                        <TableCell>{order.assignedTo || 'N/A'}</TableCell>
                                        <TableCell>{order.priority || 'N/A'}</TableCell>
                                        <TableCell>
                                            <IconButton aria-label="edit" onClick={() => handleEdit(order)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton aria-label="reject" onClick={() => handleReject(order._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton aria-label="complete" onClick={() => {
                                                setConfirmAction('complete');
                                                setConfirmActionId(order._id);
                                                setConfirmOpen(true);
                                            }}>
                                                <CheckCircleIcon />
                                            </IconButton>
                                            <IconButton aria-label="add-tracking" onClick={() => handleOpenTrackingModal(order)}>
                                                <VisibilityIcon />
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
                <Box className="flex justify-center mt-2">
                    <Pagination count={totalPages} page={currentPage} onChange={(e, value) => setCurrentPage(value)} />
                </Box>

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
                    <Box sx={modalBoxStyles}>
                        <Typography id="modal-modal-title" variant="h6">For Physical Facilities Office Remarks</Typography>
                        {/* Form content here */}
                        <EditForm
                            users={users}
                            priority={priority}
                            setPriority={setPriority}
                            assignedTo={assignedTo}
                            setAssignedTo={setAssignedTo}
                            dateAssigned={dateAssigned}
                            setDateAssigned={setDateAssigned}
                            dateFrom={dateFrom}
                            setDateFrom={setDateFrom}
                            dateTo={dateTo}
                            setDateTo={setDateTo}
                            costRequired={costRequired}
                            setCostRequired={setCostRequired}
                            chargeTo={chargeTo}
                            setChargeTo={setChargeTo}
                            handleUpdate={handleUpdate}
                            formatDate={formatDate}
                            handleDateChange={handleDateChange}
                            setModalOpen={setModalOpen}
                        />
                    </Box>
                </Modal>

                {/* Tracking Modal */}
                <Modal
                    open={trackingModalOpen}
                    onClose={() => setTrackingModalOpen(false)}
                    aria-labelledby="tracking-modal-title"
                    aria-describedby="tracking-modal-description"
                >
                    <Box sx={modalBoxStyles}>
                        <Typography id="tracking-modal-title" variant="h6">Add Tracking Update</Typography>
                        {/* Form content here */}
                        <TrackingForm
                            trackingStatus={trackingStatus}
                            setTrackingStatus={setTrackingStatus}
                            trackingNote={trackingNote}
                            setTrackingNote={setTrackingNote}
                            handleAddTracking={handleAddTracking}
                            setTrackingModalOpen={setTrackingModalOpen}
                        />
                    </Box>
                </Modal>

                {/* Reason Modal for rejection */}
                <ReasonModal
                    open={reasonModalOpen}
                    onClose={() => setReasonModalOpen(false)}
                    onSubmit={(reason) => {
                        setRejectionReason(reason);
                        setReasonModalOpen(false);
                        setConfirmOpen(true);
                    }}
                />

                {/* Confirmation Modal */}
                <Modal
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    aria-labelledby="confirmation-modal-title"
                    aria-describedby="confirmation-modal-description"
                >
                    <Box sx={modalBoxStyles}>
                        <Typography id="confirmation-modal-title" variant="h6">Are you sure?</Typography>
                        <Typography id="confirmation-modal-description" sx={{ mt: 2 }}>
                            {confirmAction === 'reject'
                                ? `Reject this job order? Reason: ${rejectionReason}`
                                : 'Complete this job order?'}
                        </Typography>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                            <Button onClick={handleConfirmAction} variant="contained" color="primary">Confirm</Button>
                            <Button onClick={() => setConfirmOpen(false)} variant="contained" color="error" sx={{ mt: 1 }}>Cancel</Button>
                        </Box>
                    </Box>
                </Modal>
            </Box>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default JobOrderTable;