import React from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';

const DetailsModal = ({ open, onClose, request, onApprove, onReject }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="request-details-modal-title"
            aria-describedby="request-details-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 800,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 2,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                overflow: 'hidden'
            }}>
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    <Typography variant="h6" component="h2">Application Details</Typography>
                    {request && (
                        <Box mt={2}>
                            <Typography variant="body1"><strong>Requestor:</strong> {request.firstName} {request.lastName}</Typography>
                            <Typography variant="body1"><strong>Requesting College/Office:</strong> {request.reqOffice}</Typography>
                            <Typography variant="body1"><strong>Description:</strong> {request.jobDesc}</Typography>
                            <Typography variant="body1"><strong>Building:</strong> {request.building}</Typography>
                            <Typography variant="body1"><strong>Campus:</strong> {request.campus}</Typography>
                            <Typography variant="body1"><strong>Floor:</strong> {request.floor}</Typography>
                            <Typography variant="body1"><strong>Room:</strong> {request.room}</Typography>
                            <Typography variant="body1"><strong>Date Requested:</strong> {new Date(request.createdAt).toLocaleDateString()}</Typography>
                            {/* Other request details */}
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="contained" color="success" onClick={() => onApprove(request._id)}>Approve</Button>
                                <Button variant="contained" color="error" onClick={() => onReject(request)}>Reject</Button>
                            </Box>
                        </Box>
                    )}
                </Box>
                {request?.fileUrl && (
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            src={request.fileUrl}
                            alt="Submitted File"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </Box>
                )}
            </Box>
        </Modal>
    );
};

export default DetailsModal;
