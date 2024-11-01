import React from 'react';
import { Box, Modal, Typography, Paper, Backdrop, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import the close icon

// Update the props to include date
const RemarksModal = ({ open, onClose, remarks }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="remarks-modal-title"
            aria-describedby="remarks-modal-description"
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
                    <Typography variant="h5" component="h2" mb={2}>Remarks</Typography>
                    <Typography variant="body1">
                        {remarks ? remarks : 'No remarks provided.'}
                    </Typography>
                </Paper>
            </Box>
        </Modal>
    );
};

export default RemarksModal;
