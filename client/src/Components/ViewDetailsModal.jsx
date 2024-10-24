import React from 'react';
import { Box, Modal, Typography, Paper, Backdrop, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon

const ViewDetailsModal = ({ open, onClose, request }) => {
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
                position: 'absolute', // Keep only one position property
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
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 32,
                        right: 32,
                        color: (theme) => theme.palette.grey[500], // Adjust the color as needed
                    }}
                >
                    <CloseIcon />
                </IconButton>

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
                                <Typography
                                    variant="body1"
                                    sx={{
                                        wordBreak: 'break-all',   // Break long words into the next line
                                        overflowX: 'auto',        // Enable horizontal scrolling if needed
                                        maxHeight: '200px',       // Optional: Set a maximum height if you want
                                        overflowY: 'auto',        // Enable vertical scrolling if content exceeds height
                                        whiteSpace: 'normal',     // Ensure normal wrapping of text
                                    }}
                                >
                                    <strong>Description:</strong> {request.jobDesc}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        wordBreak: 'break-all',   // Break long words into the next line
                                        overflowX: 'auto',        // Enable horizontal scrolling if needed
                                        maxHeight: '200px',       // Optional: Set a maximum height if you want
                                        overflowY: 'auto',        // Enable vertical scrolling if content exceeds height
                                        whiteSpace: 'normal',     // Ensure normal wrapping of text
                                    }}
                                >
                                    <strong>Scenario:</strong> {request.scenario}
                                </Typography>
                            </Box>

                            <Box component={Paper} elevation={2} sx={{ p: 2, mb: 2 }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        wordBreak: 'break-all',   // Break long words into the next line
                                        overflowX: 'auto',        // Enable horizontal scrolling if needed
                                        maxHeight: '200px',       // Optional: Set a maximum height if you want
                                        overflowY: 'auto',        // Enable vertical scrolling if content exceeds height
                                        whiteSpace: 'normal',     // Ensure normal wrapping of text
                                    }}
                                >
                                    <strong>Object:</strong> {request.object}
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
                            style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'contain' }}
                        />
                    </Paper>
                )}

            </Box>
        </Modal>
    );
};

export default ViewDetailsModal;
