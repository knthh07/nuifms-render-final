import React from 'react';
import { Box, Modal, Typography, Paper, Backdrop, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon

const FeedbackModal = ({ open, onClose, feedback }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="feedback-modal-title"
            aria-describedby="feedback-modal-description"
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
                        top: 16,
                        right: 16,
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
                    <Typography variant="h5" component="h2" mb={2}>Feedback Details</Typography>
                    {feedback && (
                        <Box>
                            <Typography variant="body1">
                                <strong>Feedback:</strong> {feedback.feedback}
                            </Typography>
                            <Typography variant="body1" mt={1}>
                                <strong>Submitted By:</strong> {feedback.firstName} {feedback.lastName}
                            </Typography>
                            <Typography variant="body1" mt={1}>
                                <strong>Date:</strong> {new Date(feedback.date).toLocaleDateString()}
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Modal>
    );
};

export default FeedbackModal;
