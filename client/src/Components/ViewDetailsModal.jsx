import React from 'react';
import { Box, Modal, Typography, Paper, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ViewDetailsModal = ({ open, onClose, request }) => {
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
                maxWidth: 900,
                p: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 24,
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

                {/* Image Section */}
                {request?.fileUrl && (
                    <Paper elevation={3} sx={{
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
                    </Paper>
                )}

                {/* Details Section */}
                <Box sx={{
                    flex: '1 1 60%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <Typography variant="h5" component="h2">Application Details</Typography>
                    {request && (
                        <>
                            <Typography><strong>Requestor:</strong> {request.firstName} {request.lastName}</Typography>
                            <Typography sx={{ wordBreak: 'break-word' }}><strong>Description:</strong> {request.jobDesc}</Typography>
                            <Typography><strong>Scenario:</strong> {request.scenario}</Typography>
                            <Typography><strong>Object:</strong> {request.object}</Typography>
                            <Typography><strong>Building:</strong> {request.building}</Typography>
                            <Typography><strong>Campus:</strong> {request.campus}</Typography>
                            <Typography><strong>Floor:</strong> {request.floor}</Typography>
                            <Typography><strong>Requesting Office:</strong> {request.reqOffice}</Typography>
                            <Typography><strong>Date Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</Typography>
                        </>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default ViewDetailsModal;
