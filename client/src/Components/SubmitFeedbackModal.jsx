import React from 'react';
import { Box, Modal, Paper, Typography, TextField, Button, IconButton, Backdrop, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const SubmitFeedbackModal = ({ 
  open, 
  onClose, 
  feedback, 
  handleFeedbackChange, 
  handleFeedbackSubmit,
  isLoading = false 
}) => {
    const maxCharacters = 200;

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="submit-feedback-modal-title"
            aria-describedby="submit-feedback-modal-description"
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
                    disabled={isLoading}
                >
                    <CloseIcon />
                </IconButton>

                <Paper elevation={3} sx={{
                    p: 3,
                    bgcolor: 'background.paper',
                    boxShadow: 3,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}>
                    <Typography variant="h5" component="h2" mb={2} id="submit-feedback-modal-title">
                        Submit Feedback
                    </Typography>

                    <TextField
                        id="submit-feedback-modal-description"
                        multiline
                        rows={4}
                        fullWidth
                        label="Feedback"
                        value={feedback || ""}
                        onChange={handleFeedbackChange}
                        variant="filled"
                        inputProps={{ maxLength: maxCharacters }}
                        InputLabelProps={{ shrink: true }}
                        disabled={isLoading}
                        sx={{
                            '& .MuiInputBase-input': { color: 'black' },
                            '& .MuiInputLabel-root': { color: 'black' },
                            '& .MuiFilledInput-underline:before': { borderBottomColor: 'black' },
                            '& .MuiFilledInput-underline:hover:before': { borderBottomColor: 'black' },
                        }}
                    />

                    <Typography 
                        variant="body2" 
                        color={feedback?.length > maxCharacters ? 'error' : 'textSecondary'} 
                        align="right"
                    >
                        {(feedback?.length || 0)}/{maxCharacters} characters
                        {feedback?.length > maxCharacters && ' (Too long)'}
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        mt: 3,
                    }}>
                        <Button 
                            onClick={onClose} 
                            color="primary" 
                            variant="outlined"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={() => handleFeedbackSubmit(feedback)} 
                            color="primary" 
                            variant="contained"
                            disabled={
                                !feedback || 
                                feedback.trim() === "" || 
                                feedback.length > maxCharacters ||
                                isLoading
                            }
                            endIcon={isLoading ? <CircularProgress size={20} /> : null}
                        >
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Modal>
    );
};

export default SubmitFeedbackModal;