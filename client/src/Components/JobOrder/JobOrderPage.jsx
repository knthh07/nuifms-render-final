import React, { useEffect, useState, lazy, Suspense } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Typography, MenuItem, Select, FormControl, InputLabel, TextField, Modal, Button, InputAdornment, Skeleton
} from '@mui/material';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import PageviewIcon from '@mui/icons-material/Pageview';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { toast } from 'react-hot-toast';
import Loader from '../../hooks/Loader';
import ReasonModal from '../ReasonModal';
import Remarks from '../Remarks';
import PaginationComponent from '../../hooks/Pagination';

// Lazy loading the ViewDetailsModal
const ViewDetailsModal = lazy(() => import('../ViewDetailsModal'));

const JobOrderTable = () => {
    const [jobOrders, setJobOrders] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [editingOrder, setEditingOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [urgency, setUrgency] = useState('');
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
    const [trackingNote, setTrackingNote] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmActionId, setConfirmActionId] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [remarksOpem, setRemarksOpen] = useState(false);
    const [nameFilter, setNameFilter] = useState('');
    const [jobDescFilter, setJobDescFilter] = useState('');
    const [assignedToFilter, setAssignedToFilter] = useState('');
    const [dateSubmittedFilter, setDateSubmittedFilter] = useState('');
    const [dateCompletedFilter, setdateCompletedFilter] = useState('');
    const [dateFromFilter, setDateFromFilter] = useState('');
    const [dateToFilter, setDateToFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('');

    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/api/jobOrders?page=${currentPage}`, { withCredentials: true });
                setJobOrders(response.data.requests);
                setTotalPages(response.data.totalPages); // Assuming the backend returns `totalPages`
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

        // Fetch job orders and employees whenever the current page changes
        fetchJobOrders();
        fetchEmployees();
    }, [currentPage]);

    const handleEdit = (order) => {
        setEditingOrder(order);
        setUrgency(order.urgency || '');
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleConfirmAction = async (action) => { //DITO KA NA BOI, YUNG SA COMPLETE WITH REMARKS DITO AAYUSIN YON, I MEAN PAPALITAN TERMS KASI OKAY NA TO EH
        if (action === 'complete') {
            try {
                setIsLoading(true);
                await axios.patch(`/api/jobOrders/${confirmActionId}/completeRemarks`, { remarks: remarks }, { withCredentials: true });
                setJobOrders(jobOrders.filter(order => order._id !== confirmActionId));
                handleCloseReasonModal();
                toast.success('Job order marked as Completed');
            } catch (error) {
                console.error('Error completing job order:', error.response ? error.response.data : error);
                toast.error('Please state your remarks.');
            } finally {
                setIsLoading(false);
            }
        }
        setConfirmOpen(false);
        setConfirmAction(null);
        setConfirmActionId(null);
        setModalOpen(false); // Close modal after action
        setRemarks(''); // Reset reason
    };

    const handleUpdate = async () => {
        try {
            setIsLoading(true);
            const response = await axios.patch(`/api/jobOrders/${editingOrder._id}/update`, {
                urgency,
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
                        urgency,
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

            const newTracking = [...currentTracking, { date: new Date(), note: trackingNote }];

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
        setRemarksOpen(true); // Open ReasonModal
        setRemarks(''); // Reset the reason when opening the modal

    };

    const handleCloseReasonModal = () => {
        setRemarksOpen(false); // Open ReasonModal
        setRemarks(''); // Reset the reason when opening the modal

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

    // Function to map status values to user-friendly labels
    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'notCompleted':
                return 'Not Completed';
            case 'rejected':
                return 'Rejected';
            case 'pending':
                return 'Pending';
            case 'ongoing':
                return 'On Going';
            default:
                return 'Unknown'; // or return an empty string if you prefer
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'nameFilter') setNameFilter(value);
        if (name === 'jobDescFilter') setJobDescFilter(value);
        if (name === 'assignedToFilter') setAssignedToFilter(value);
        if (name === 'dateSubmittedFilter') setDateSubmittedFilter(value);
        if (name === 'dateCompletedFilter') setdateCompletedFilter(value);
        if (name === 'statusFilter') setStatusFilter(value);
        if (name === 'urgencyFilter') setUrgencyFilter(value);

    };

    // Filter job orders based on filters
    const filteredJobOrders = jobOrders
        .filter(order => `${order.firstName || ''} ${order.lastName || ''}`.toLowerCase().includes(nameFilter.toLowerCase()))
        .filter(order => (order.jobDescription || '').toLowerCase().includes(jobDescFilter.toLowerCase()))
        .filter(order => (order.assignedTo || '').toLowerCase().includes(assignedToFilter.toLowerCase()))
        .filter(order => (order.dateSubmittedFilter || '').toLowerCase().includes(dateSubmittedFilter.toLowerCase()))
        .filter(order => (order.dateCompletedFilter || '').toLowerCase().includes(dateCompletedFilter.toLowerCase()))
        .filter(order => (order.status || '').toLowerCase().includes(statusFilter.toLowerCase()))
        .filter(order => (order.urgency || '').toLowerCase().includes(urgencyFilter.toLowerCase()));

    return (
        <div className="flex">
            <div className="flex flex-col w-full">
                <Box>
                    <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>#</TableCell> {/* Automatic Numbering Header */}
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                            <span>Name of Personnel</span>
                                            <input
                                                type="text"
                                                name="nameFilter"
                                                style={{ color: '#000000', marginTop: '0.2 rem' }} // Inline style to set text color
                                                placeholder="Filter by Name"
                                                value={nameFilter}
                                                onChange={handleFilterChange}
                                                className="table-filter-input"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>Job Description</TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                            <span>Assigned To</span>
                                            <input
                                                type="text"
                                                name="assignedToFilter"
                                                style={{ color: '#000000', marginTop: '0.2 rem' }} // Inline style to set text color
                                                placeholder="Filter by Assigned To"
                                                value={assignedToFilter}
                                                onChange={handleFilterChange}
                                                className="table-filter-input"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                            <span>Urgency</span>
                                            <input
                                                type="text"
                                                name="urgencyFilter"
                                                style={{ color: '#000000', marginTop: '0.2 rem' }} // Inline style to set text color
                                                placeholder="Filter by Urgency"
                                                value={urgencyFilter}
                                                onChange={handleFilterChange}
                                                className="table-filter-input"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                            <span>Date Submitted</span>
                                            <input
                                                type="text"
                                                name="dateSubmittedFilter"
                                                style={{ color: '#000000', marginTop: '0.2 rem' }} // Inline style to set text color
                                                placeholder="Filter by Date Submitted"
                                                value={dateSubmittedFilter}
                                                onChange={handleFilterChange}
                                                className="table-filter-input"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                            <span>Date Completed</span>
                                            <input
                                                type="text"
                                                name="dateCompletedFilter"
                                                style={{ color: '#000000', marginTop: '0.2 rem' }} // Inline style to set text color
                                                placeholder="Filter by Date Completed"
                                                value={dateCompletedFilter}
                                                onChange={handleFilterChange}
                                                className="table-filter-input"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                                            <span>Status</span>
                                            <input
                                                type="text"
                                                name="statusFilter"
                                                style={{ color: '#000000', marginTop: '0.2 rem' }} // Inline style to set text color
                                                placeholder="Filter by Status"
                                                value={statusFilter}
                                                onChange={handleFilterChange}
                                                className="table-filter-input"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell style={{ backgroundColor: '#35408e', color: '#ffffff', textAlign: 'center' }}>Manage</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredJobOrders.length > 0 ? (
                                    filteredJobOrders.map((order, index) => (
                                        <TableRow key={order._id}>
                                            <TableCell>{index + 1}</TableCell> {/* Automatic Row Number */}
                                            <TableCell>{order.firstName} {order.lastName}</TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => handleViewDetails(order)}
                                                    aria-label="view details"
                                                >
                                                    <PageviewIcon />
                                                </IconButton>
                                            </TableCell>
                                            <TableCell>{order.assignedTo || 'N/A'}</TableCell>
                                            <TableCell>{order.urgency || 'N/A'}</TableCell>
                                            <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{new Date(order.updatedAt).toLocaleDateString()}</TableCell>
                                            <TableCell>{getStatusLabel(order.status || 'N/A')}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                {['ongoing'].includes(order.status) ? (
                                                    <><IconButton aria-label="edit" onClick={() => handleEdit(order)}>
                                                        <EditIcon />
                                                    </IconButton><IconButton onClick={() => handleOpenReasonModal(order._id)} aria-label="complete">
                                                            <CheckCircleIcon />
                                                        </IconButton><IconButton aria-label="add-tracking" onClick={() => handleOpenTrackingModal(order)}>
                                                            <VisibilityIcon />
                                                        </IconButton></>
                                                ) : null}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4}>
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
                        onPageChange={handlePageChange}
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
                                <InputLabel>Urgency</InputLabel>
                                <Select
                                    value={urgency}
                                    onChange={(e) => setUrgency(e.target.value)}
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
                    {/* <Modal
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
                            width: '90%', 
                            maxWidth: 400, 
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
                                    sx={{ minWidth: '100px' }} 
                                >
                                    Confirm
                                </Button>
                                <Button
                                    onClick={() => setConfirmOpen(false)}
                                    variant="contained"
                                    color="error"
                                    sx={{ mt: 1, minWidth: '100px' }}
                                >
                                    Cancel
                                </Button>
                            </Box>
                        </Box>
                    </Modal> */}

                    <Remarks
                        open={remarksOpem} // Use separate state for ReasonModal
                        onClose={() => setRemarksOpen(false)} // Close method for ReasonModal
                        remarks={remarks}
                        setRemarks={setRemarks}
                        onComplete={() => handleConfirmAction('complete')}
                    />
                </Box>
                <Loader isLoading={isLoading} />
            </div >
        </div >
    );
};

export default JobOrderTable;
