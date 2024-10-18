import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

const FeedbackModal = ({ open, onClose, feedback }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogContent>
                {feedback && (
                    <Typography variant="body1">
                        {feedback.feedback}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FeedbackModal;
