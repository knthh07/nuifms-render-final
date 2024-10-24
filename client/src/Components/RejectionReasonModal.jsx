import React from 'react';
import { Box, Modal, Typography, Paper, Backdrop, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const RejectionReasonModal = ({ open, onClose, reason, date }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="rejection-reason-modal-title"
            aria-describedby="rejection-reason-modal-description"
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
                sx: {
                    backdropFilter: 'blur(5px)',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust for better contrast
                },
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: 600,
                p: 4,
                outline: 'none',
            }}>
                {/* Close Button */}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        color: 'grey.500',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                {/* Paper for Rejection Reason */}
                <Paper elevation={3} sx={{
                    p: 4,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 2,
                    maxHeight: '70vh', // Make sure it's scrollable if content overflows
                    overflowY: 'auto',
                    outline: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    {/* Title */}
                    <Typography id="rejection-reason-modal-title" variant="h5" component="h2" gutterBottom>
                        Rejection Reason
                    </Typography>

                    {/* Reason Content */}
                    <Box aria-describedby="rejection-reason-modal-description">
                        {reason ? (
                            <Typography variant="body1" id="rejection-reason-modal-description" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                {reason}
                            </Typography>
                        ) : (
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                                No rejection reason provided.
                            </Typography>
                        )}
                    </Box>

                    {/* Date */}
                    {date && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 2 }}>
                            Date: {new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Modal>
    );
};

export default RejectionReasonModal;
