import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, IconButton, Skeleton } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, Visibility as VisibilityIcon } from '@mui/icons-material';

function FilterableTable({ jobOrders, handleEdit, handleViewDetails, handleOpenReasonModal, handleOpenTrackingModal, setConfirmAction, setConfirmActionId, setConfirmOpen }) {
    // States for filters
    const [nameFilter, setNameFilter] = useState('');
    const [jobDescFilter, setJobDescFilter] = useState('');
    const [assignedToFilter, setAssignedToFilter] = useState('');

    // Filtered job orders based on filter inputs
    const filteredOrders = jobOrders
        .filter(order =>
            `${order.firstName || ''} ${order.lastName || ''}`.toLowerCase().includes(nameFilter.toLowerCase())
        )
        .filter(order =>
            (order.jobDescription || '').toLowerCase().includes(jobDescFilter.toLowerCase())
        )
        .filter(order =>
            (order.assignedTo || '').toLowerCase().includes(assignedToFilter.toLowerCase())
        );

    return (
        <TableContainer component={Paper} className="shadow-md rounded-lg">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TextField
                                label="Name of Personnel"
                                variant="outlined"
                                size="small"
                                value={nameFilter}
                                onChange={(e) => setNameFilter(e.target.value)}
                                fullWidth
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                label="Job Description"
                                variant="outlined"
                                size="small"
                                value={jobDescFilter}
                                onChange={(e) => setJobDescFilter(e.target.value)}
                                fullWidth
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                label="Assigned To"
                                variant="outlined"
                                size="small"
                                value={assignedToFilter}
                                onChange={(e) => setAssignedToFilter(e.target.value)}
                                fullWidth
                            />
                        </TableCell>
                        <TableCell align="center">Manage</TableCell>
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
                                        onClick={() => handleViewDetails(order)}
                                    >
                                        View Details
                                    </Button>
                                </TableCell>
                                <TableCell>{order.assignedTo || 'N/A'}</TableCell>
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
    );
}

export default FilterableTable;
