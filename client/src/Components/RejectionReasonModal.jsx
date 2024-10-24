import React from 'react';
import { Box, Modal, Typography, Paper, Backdrop, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon

const RejectionReasonModal = ({ open, onClose, reason }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="rejection-reason-modal-title"
            aria-describedby="rejection-reason-modal-description"
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
                maxWidth: 600,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                outline: 'none',
            }}>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 32,
                        right: 32,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Paper elevation={3} sx={{
                    p: 3,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 2,
                    overflowY: 'auto',
                }}>
                    <Typography variant="h5" component="h2" mb={2}>Rejection Reason</Typography>
                    {reason ? (
                        <Typography variant="body1">
                            {reason}
                        </Typography>
                    ) : (
                        <Typography variant="body1">
                            No rejection reason provided.
                        </Typography>
                    )}
                </Paper>
            </Box>
        </Modal>
    );
};

export default RejectionReasonModal;
