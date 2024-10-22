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
                timeout: 500,
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
                maxWidth: '600px',
                p: { xs: 2, sm: 4 },
                bgcolor: 'background.paper',
                boxShadow: 24,
                borderRadius: 2,
                maxHeight: '90vh',
                overflowY: 'auto', // The entire modal is now scrollable
            }}>
                <Paper elevation={3} sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <Typography variant="h5" component="h2" mb={2}>Application Details</Typography>
                    {request && (
                        <>
                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="body1">
                                    <strong>Requestor:</strong> {request.firstName} {request.lastName}
                                </Typography>
                            </Box>

                            {/* Job Description */}
                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    <strong>Description:</strong> {request.jobDesc}
                                </Typography>
                            </Box>

                            {/* Scenario */}
                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="body1">
                                    <strong>Scenario:</strong> {request.scenario}
                                </Typography>
                            </Box>

                            {/* Object */}
                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="body1">
                                    <strong>Object:</strong> {request.object}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="body1">
                                    <strong>Building:</strong> {request.building}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="body1">
                                    <strong>Campus:</strong> {request.campus}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="body1">
                                    <strong>Floor:</strong> {request.floor}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="body1">
                                    <strong>Requesting College/Office:</strong> {request.reqOffice}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="body1">
                                    <strong>Date Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>

                            {/* Image Section */}
                            {request.image && (
                                <Box
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: '200px',
                                        overflow: 'hidden',
                                        mt: 2,
                                    }}
                                >
                                    <img
                                        src={request.image}
                                        alt="Related to the request"
                                        style={{
                                            width: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                </Box>
                            )}

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                                <Button variant="contained" color="success" onClick={() => onApprove(request._id)}>Approve</Button>
                                <Button variant="contained" color="error" onClick={() => onReject(request)}>Reject</Button>
                            </Box>
                        </>
                    )}
                </Paper>
            </Box>
        </Modal>
    );
};

export default DetailsModal;
