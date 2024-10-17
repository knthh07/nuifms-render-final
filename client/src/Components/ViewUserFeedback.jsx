import React, { useState, useEffect, lazy, Suspense } from "react";
import axios from 'axios';
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Pagination, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Lazy load the ViewDetailsModal component
const ViewDetailsModal = lazy(() => import('./ViewDetailsModal'));

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
    const [modalContent, setModalContent] = useState({ title: '', content: '' });
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [openJobDescModal, setOpenJobDescModal] = useState(false);

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

    const handleOpenDetailModal = (title, content) => {
        setModalContent({ title, content });
        setOpenDetailModal(true);
    };

    const handleCloseDetailModal = () => {
        setOpenDetailModal(false);
    };

    const handleOpenJobDescModal = (jobDesc) => {
        setModalContent({ title: "Job Description", content: jobDesc || 'N/A' });
        setOpenJobDescModal(true);
    };

    const handleCloseJobDescModal = () => {
        setOpenJobDescModal(false);
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
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleOpenDetailModal("Feedback", feedback.feedback || 'N/A')}
                                            >
                                                View Feedback
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleOpenJobDescModal(feedback.jobDesc)}
                                            >
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

                    {/* Suspense Boundary for the modal */}
                    <Suspense fallback={<CircularProgress />}>
                        <ViewDetailsModal
                            open={openJobDescModal}
                            onClose={handleCloseJobDescModal}
                            title={modalContent.title}
                            content={modalContent.content}
                        />
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default ViewUserFeedback;
