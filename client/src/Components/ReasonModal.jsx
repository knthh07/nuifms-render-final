// RejectReasonModal.js
import React from 'react';
import { Box, Modal, Typography, TextField, Button } from '@mui/material';

const ReasonModal = ({ open, onClose, rejectReason, setRejectReason, onReject }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="reject-reason-modal-title"
            aria-describedby="reject-reason-modal-description"
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
                p: 2,
            }}>
                <Typography id="reject-reason-modal-title" variant="h6" component="h2">
                    Reject Reason
                </Typography>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Reason for Rejection"
                    multiline
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button onClick={onClose} variant="outlined" color="error" sx={{ mr: 2 }}>
                        Cancel
                    </Button>
                    <Button onClick={onReject} variant="contained" color="primary">
                        Reject
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ReasonModal;
