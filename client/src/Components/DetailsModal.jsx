import React from 'react';
import { Box, Button, Modal, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DetailsModal = ({ open, onClose, request, onApprove, onReject }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="request-details-modal-title"
            aria-describedby="request-details-modal-description"
            BackdropProps={{
                timeout: 0,
                sx: { backdropFilter: 'blur(5px)' },
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 800,
                p: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 3,
            }}>
                {/* Close Button */}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Image Container */}
                {request?.fileUrl && (
                    <Box sx={{
                        flex: '1 1 40%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                    }}>
                        <img
                            src={request.fileUrl}
                            alt="Submitted File"
                            style={{ maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }}
                        />
                    </Box>
                )}

                {/* Details Section */}
                <Box sx={{
                    flex: '1 1 60%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    <Box>
                        <Typography variant="h6">Request Details</Typography>
                        <Typography><strong>Requestor:</strong> {request?.firstName} {request?.lastName}</Typography>
                        <Typography><strong>Scenario:</strong> {request?.scenario}</Typography>
                        <Typography><strong>Object:</strong> {request?.object}</Typography>
                        <Typography><strong>Building:</strong> {request?.building}</Typography>
                        <Typography><strong>Campus:</strong> {request?.campus}</Typography>
                        <Typography><strong>Floor:</strong> {request?.floor}</Typography>
                        <Typography><strong>Requesting Office:</strong> {request?.reqOffice}</Typography>
                        <Typography><strong>Date Requested:</strong> {new Date(request?.createdAt).toLocaleDateString()}</Typography>
                        <Typography
                            sx={{
                                wordBreak: 'break-word', // Wrap long words
                            }}
                        >
                            <strong>Description:</strong> {request?.jobDesc}
                        </Typography>
                    </Box>

                    {/* Button Container */}
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        mt: 3,
                    }}>
                        <Button variant="contained" color="success" onClick={() => onApprove(request._id)}>Approve</Button>
                        <Button variant="contained" color="error" onClick={() => onReject(request)}>Reject</Button>
                    </Box>
                </Box>
            </Box>
        </Modal>
    );
};

export default DetailsModal;
