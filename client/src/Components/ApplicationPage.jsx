import React, { useEffect, useState, lazy, Suspense } from "react";
import axios from 'axios';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Typography, MenuItem, Select, FormControl, InputLabel, TextField, Modal, Button, InputAdornment, Skeleton
} from '@mui/material';
import Loader from "../hooks/Loader";
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import ReasonModal from '../Components/ReasonModal';
import PaginationComponent from '../hooks/Pagination';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LayoutComponent from "./LayoutComponent";

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
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [costRequired, setCostRequired] = useState('');
    const [chargeTo, setChargeTo] = useState('');
    const [campuses, setCampuses] = useState([]);
    const [buildings, setBuildings] = useState([]);
    const [offices, setOffices] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [trackingModalOpen, setTrackingModalOpen] = useState(false);
    const [trackingStatus, setTrackingStatus] = useState('');
    const [trackingNote, setTrackingNote] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmActionId, setConfirmActionId] = useState(null);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [reasonModalOpen, setReasonModalOpen] = useState(false); // Separate state for ReasonModal
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

        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/users?role=user&position=Facilities Employee', { withCredentials: true });
                setUsers(response.data.users);
            } catch (error) {
                toast.error(`Error: ${error.response?.data?.message || 'Something went wrong'}`);
                console.error('Error fetching employees:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        fetchEmployees();
    }, [currentPage]);

    const campusMap = Object.fromEntries(campuses.map(campus => [campus._id, campus.name]));
    const buildingMap = Object.fromEntries(buildings.map(building => [building._id, building.name]));
    const officeMap = Object.fromEntries(offices.map(office => [office._id, office.name]));

    const handleApprove = async (id) => {
        try {
            setLoading(true);
            const response = await axios.patch(`/api/requests/${id}/approve`, {}, { withCredentials: true });

            // Assuming the response contains the updated job order
            const updatedJobOrder = response.data.jobOrder;

            // Update requests state
            setRequests(prevRequests => prevRequests.filter(request => request._id !== id));

            // Set the editing order and open the Edit modal
            setEditingOrder(updatedJobOrder);
            setUrgency(updatedJobOrder.urgency || '');
            setAssignedTo(updatedJobOrder.assignedTo || '');
            setStatus(updatedJobOrder.status || '');
            setDateAssigned(updatedJobOrder.dateAssigned || '');
            setDateFrom(updatedJobOrder.dateFrom || '');
            setDateTo(updatedJobOrder.dateTo || '');
            setCostRequired(updatedJobOrder.costRequired || '');
            setChargeTo(updatedJobOrder.chargeTo || '');

            setModalOpenEdit(true); // Open the Edit modal

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

        setModalOpenEdit(true);
        setModalOpen(false);
    };
    const handleUpdate = async () => {
        // Validation checks
        if (!urgency || !assignedTo || !dateAssigned || !dateFrom || !dateTo || !costRequired || !chargeTo) {
            toast.error('Please fill out all fields before submitting.');
            return;
        }
        try {
            setLoading(true);
            const response = await axios.patch(`/api/jobOrders/${editingOrder._id}/update`, {
                urgency,
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
            setModalOpenEdit(false);
            setModalOpen(false);
            toast.success('Job order updated successfully');
        } catch (error) {
            console.error('Error updating job order:', error);
            toast.error('Error updating job order');
        } finally {
            setLoading(false);
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

    return (
        <LayoutComponent>
            <div className="flex flex-col w-full p-6">
                {/* Back Button */}
                <Link to="/SuperAdminHomePage" className="text-decoration-none">
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #3f51b5', // Primary color border
                            color: '#3f51b5',
                            '&:hover': {
                                backgroundColor: '#3f51b5', // Darken on hover
                                color: '#fff', // Change text color on hover
                            },
                            marginRight: '16px', // Space between the back button and the title
                        }}
                    >
                        Back
                    </Button>
                </Link>
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
                            campusMap={campusMap} // Ensure this is defined and populated
                            buildingMap={buildingMap} // Ensure this is defined and populated
                            officeMap={officeMap} // Ensure this is defined and populated
                        />

                    </Suspense>
                    <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                    {/* Edit Modal */}
                    <Modal
                        open={modalOpenEdit}
                        onClose={() => setModalOpenEdit(false)}
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
                </Box>
                <Loader isLoading={isLoading} />
            </div>
        </LayoutComponent>
    );
};
export default Application;
