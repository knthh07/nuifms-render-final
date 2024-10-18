import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Pagination from '@mui/material/Pagination';
import { styled } from '@mui/material/styles';

// Styled components using MUI and Tailwind
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold',
}));

const ViewUserFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const feedbacksPerPage = 5;
    const [totalPages, setTotalPages] = useState(1);
    const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
    const [openJobDescModal, setOpenJobDescModal] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState(null);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await axios.get('/api/feedbacks', { params: { page: currentPage } });
                setFeedbacks(response.data.feedbacks);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error('Failed to fetch feedbacks:', error);
            }
        };

        fetchFeedbacks();
    }, [currentPage]);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleOpenFeedbackModal = (feedback) => {
        setSelectedFeedback(feedback);
        setOpenFeedbackModal(true);
    };

    const handleCloseFeedbackModal = () => {
        setOpenFeedbackModal(false);
        setSelectedFeedback(null);
    };

    const handleOpenJobDescModal = (feedback) => {
        setSelectedFeedback(feedback);
        setOpenJobDescModal(true);
    };

    const handleCloseJobDescModal = () => {
        setOpenJobDescModal(false);
        setSelectedFeedback(null);
    };

    return (
        <div className="flex h-screen">
            <div className="flex flex-col w-full">

                <div className="w-[80%] ml-[20%] p-6">
                    <h1 className="text-2xl font-bold mb-4">Feedback</h1>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell>First Name</StyledTableCell>
                                    <StyledTableCell>Date</StyledTableCell>
                                    <StyledTableCell>Feedback</StyledTableCell>
                                    <StyledTableCell>Job Description</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {feedbacks.map((feedback) => (
                                    <TableRow key={feedback.id || feedback._id}>
                                        <TableCell>{feedback.firstName} {feedback.lastName}</TableCell>
                                        <TableCell>{new Date(feedback.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Button variant="text" color="primary" onClick={() => handleOpenFeedbackModal(feedback)}>
                                                View Feedback
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button variant="text" color="secondary" onClick={() => handleOpenJobDescModal(feedback)}>
                                                View Job Description
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <div className="flex justify-center mt-5">
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                        />
                    </div>
                </div>

                {/* Feedback View Modal */}
                <Dialog open={openFeedbackModal} onClose={handleCloseFeedbackModal} maxWidth="md" fullWidth>
                    <DialogTitle>Feedback Details</DialogTitle>
                    <DialogContent>
                        {selectedFeedback && (
                            <Typography variant="body1">
                                {selectedFeedback.feedback}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseFeedbackModal} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Job Description Modal */}
                <Dialog open={openJobDescModal} onClose={handleCloseJobDescModal} maxWidth="md" fullWidth>
                    <DialogTitle>Job Description</DialogTitle>
                    <DialogContent>
                        {selectedFeedback && (
                            <Typography variant="body1">
                                {selectedFeedback.jobDesc}
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseJobDescModal} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
};

export default ViewUserFeedback;