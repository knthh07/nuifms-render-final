import React from 'react';
import { Box, Button, Modal, Typography, Paper, Backdrop } from '@mui/material';

const DetailsModal = ({ open, onClose, request, onApprove, onReject }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="request-details-modal-title"
            aria-describedby="request-details-modal-description"
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 0,
                sx: {
                    backdropFilter: 'blur(5px)',
                },
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 900,
                p: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                outline: 'none',
            }}>
                <Paper elevation={3} sx={{
                    flex: 1,
                    p: 3,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 2,
                    overflowY: 'auto',
                }}>
                    <Typography variant="h5" component="h2" mb={2}>Application Details</Typography>
                    {request && (
                        <>
                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="body1">
                                    <strong>Requestor:</strong> {request.firstName} {request.lastName}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="body1">
                                    <strong>Description:</strong> {request.jobDesc}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="body1">
                                    <strong>Building:</strong> {request.building}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="body1">
                                    <strong>Campus:</strong> {request.campus}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="body1">
                                    <strong>Floor:</strong> {request.floor}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="body1">
                                    <strong>Requesting College/Office:</strong> {request.reqOffice}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography variant="body1">
                                    <strong>Date Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="contained" color="success" onClick={() => onApprove(request._id)}>Approve</Button>
                                <Button variant="contained" color="error" onClick={() => onReject(request)}>Reject</Button>
                            </Box>
                        </>
                    )}
                </Paper>

                {request?.fileUrl && (
                    <Paper elevation={3} sx={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                    }}>
                        <img
                            src={request.fileUrl}
                            alt="Submitted File"
                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                    </Paper>
                )}
            </Box>
        </Modal>
    );
};

export default DetailsModal;
