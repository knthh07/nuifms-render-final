// RejectReasonModal.js
import React, { useEffect, useRef } from 'react';
import { Box, Modal, Typography, TextField, Button, FormHelperText } from '@mui/material';

const ReasonModal = ({ open, onClose, rejectReason, setRejectReason, onReject, errorMessage }) => {
    const modalRef = useRef(null);

    // Trap focus within the modal
    useEffect(() => {
        if (open) {
            const handleKeyDown = (event) => {
                if (event.key === 'Escape') {
                    onClose();
                }
                // Prevent focus from leaving the modal
                if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
                    event.preventDefault();
                    modalRef.current.focus();
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [open, onClose]);

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="reject-reason-modal-title"
            aria-describedby="reject-reason-modal-description"
            disableEnforceFocus
        >
            <Box
                ref={modalRef}
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 400,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: 24,
                    p: 3,
                    outline: 'none',
                }}
            >
                <Typography
                    id="reject-reason-modal-title"
                    variant="h6"
                    component="h2"
                    sx={{ mb: 2 }}
                >
                    Reject Reason
                </Typography>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Reason for Rejection"
                    multiline
                    rows={4}
                    variant="outlined"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    error={!!errorMessage}
                    helperText={errorMessage}
                    inputProps={{
                        'aria-required': true,
                        'aria-invalid': errorMessage ? 'true' : 'false',
                    }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="error"
                        sx={{ mr: 2 }}
                        aria-label="Cancel"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onReject}
                        variant="contained"
                        color="primary"
                        aria-label="Reject"
                    >
                        Reject
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ReasonModal;
