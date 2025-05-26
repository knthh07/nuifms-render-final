import React, { useEffect, useState, Suspense, lazy } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Button, Skeleton, IconButton, Modal } from "@mui/material";
import { toast } from "react-hot-toast";
import Loader from "../hooks/Loader";
import PaginationComponent from "../hooks/Pagination";
import VisibilityIcon from "@mui/icons-material/Visibility";

const ViewDetailsModal = lazy(() => import("../Components/ViewDetailsModal"));
const FeedbackModal = lazy(() => import("../Components/FeedbackModal"));
const RejectionReasonModal = lazy(() => import("../Components/RejectionReasonModal"));
const RemarksModal = lazy(() => import("../Components/RemarksModal"));
const SubmitFeedbackModal = lazy(() => import("../Components/SubmitFeedbackModal"));

const UserHistory = () => {
  const [jobOrders, setJobOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [openModals, setOpenModals] = useState({
    jobDescription: false,
    rejectionReason: false,
    remarks: false,
    feedback: false,
    tracking: false
  });
  const [modalContent, setModalContent] = useState({
    rejectionReason: "",
    remarks: "",
    feedback: "",
    userFeedback: null
  });
  const [filters, setFilters] = useState({
    orderNumber: "",
    dateSubmitted: "",
    dateCompleted: "",
    status: ""
  });
  const [isLoading, setLoading] = useState(false);
  const [orderNumberFilter, setOrderNumberFilter] = useState("");
  const [jobDescFilter, setJobDescFilter] = useState("");
  const [dateSubmittedFilter, setDateSubmittedFilter] = useState("");
  const [dateCompletedFilter, setdateCompletedFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [feedback, setFeedback] = useState("");


  useEffect(() => {
    const fetchJobOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/history", { params: { page: currentPage } });
        setJobOrders(response.data.requests);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error("Failed to load job orders");
      } finally {
        setLoading(false);
      }
    };
    fetchJobOrders();
  }, [currentPage]);

  const handleOpenModal = (type, order = null) => {
    if (order) setSelectedJobOrder(order);
    switch (type) {
      case 'tracking':
        handleOpenTrackingModal(order);
        break;
      case 'rejectionReason':
        setModalContent({ ...modalContent, rejectionReason: order?.rejectionReason || "No reason provided" });
        setOpenModals({ ...openModals, rejectionReason: true });
        break;
      case 'remarks':
        setModalContent({ ...modalContent, remarks: order?.remarks || "No remarks provided" });
        setOpenModals({ ...openModals, remarks: true });
        break;
      case 'feedback':
        setOpenModals({ ...openModals, feedback: true });
        break;
      case 'viewFeedback':
        setModalContent({
          ...modalContent,
          userFeedback: {
            feedback: order?.feedback || "No feedback available",
            firstName: order?.firstName,
            lastName: order?.lastName,
            date: order?.feedbackDate || new Date().toISOString()
          }
        });
        break;
      default:
        setOpenModals({ ...openModals, [type]: true });
    }
  };

  const handleCloseModal = (type) => {
    setOpenModals({ ...openModals, [type]: false });
    if (type !== 'tracking') setSelectedJobOrder(null);
  };

  const handleOpenTrackingModal = async (order) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/jobOrders/${order._id}/tracking`);
      setSelectedJobOrder({ ...order, tracking: response.data.jobOrder.tracking });
      setOpenModals({ ...openModals, tracking: true });
    } catch (error) {
      toast.error("Error loading tracking data");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "orderNumberFilter") setOrderNumberFilter(value);
    if (name === "jobDescFilter") setJobDescFilter(value);
    if (name === "dateSubmittedFilter") setDateSubmittedFilter(value);
    if (name === "dateCompletedFilter") setdateCompletedFilter(value);
    if (name === "statusFilter") setStatusFilter(value);
  };

  const filteredJobOrders = jobOrders
    .filter((order) => (order.jobOrderNumber || "").toLowerCase().includes(orderNumberFilter.toLowerCase()))
    .filter((order) => (order.jobDescription || "").toLowerCase().includes(jobDescFilter.toLowerCase()))
    .filter((order) => isNaN(new Date(dateSubmittedFilter)) || new Date(order.createdAt) >= new Date(dateSubmittedFilter))
    .filter((order) => isNaN(new Date(dateCompletedFilter)) || new Date(order.updatedAt) >= new Date(dateCompletedFilter))
    .filter((order) => (order.status || "").toLowerCase().includes(statusFilter.toLowerCase()))

  const sortedJobOrders = filteredJobOrders.sort((a, b) => {
    // Ongoing orders first
    if (a.status.toLowerCase() === "ongoing" && b.status.toLowerCase() !== "ongoing") return -1;
    if (a.status.toLowerCase() !== "ongoing" && b.status.toLowerCase() === "ongoing") return 1;

    // Then recently completed orders
    if (a.status.toLowerCase() === "completed" && b.status.toLowerCase() === "completed") {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }

    return 0;
  });
  const getStatusLabel = (status) => {
    const statusMap = {
      completed: "Completed",
      notCompleted: "Not Completed",
      rejected: "Rejected",
      pending: "Pending",
      ongoing: "On Going"
    };
    return statusMap[status] || "Unknown";
  };

  const handleFeedbackSubmit = async (feedback) => {
    if (!selectedJobOrder) return;
    setLoading(true);
    try {
      const response = await axios.put(`/api/jobOrders/${selectedJobOrder._id}/feedback`, { feedback });
      setJobOrders(jobOrders.map(order =>
        order._id === selectedJobOrder._id ? { ...order, feedback, feedbackSubmitted: true } : order
      ));
      toast.success("Feedback submitted");
      handleOpenModal('viewFeedback', response.data.jobOrder);
    } catch (error) {
      toast.error(error.response?.data.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
      handleCloseModal('feedback');
    }
  };

  const handleFeedbackChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleFollowUp = async () => {
    if (!selectedJobOrder) return;
    setLoading(true);
    try {
      await axios.post(`/api/jobOrders/${selectedJobOrder._id}/follow-up`, {});
      setJobOrders(jobOrders.map(order =>
        order._id === selectedJobOrder._id ? { ...order, followUpRequested: true } : order
      ));
      toast.success("Follow-up requested");
    } catch (error) {
      toast.error("Failed to send follow-up");
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (order) => {
    if (!order) return 'N/A';
    const { status, dateFrom, dateTo } = order;
    let deadlineDate;

    if (status === 'pending' && dateFrom) {
      deadlineDate = new Date(dateFrom);
    } else if (status === 'ongoing' && dateTo) {
      deadlineDate = new Date(dateTo);
    } else {
      return 'N/A';
    }

    const diff = deadlineDate - currentTime;
    if (diff < 0) return 'Deadline passed';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : jobOrders.length === 0 ? (
        <Typography variant="h6" className="text-center">No Job Orders found.</Typography>
      ) : (
        <>
          <TableContainer component={Paper} className="shadow-md">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>#</TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                      <span>Order Number</span>
                      <input type="text" name="orderNumberFilter" style={{ color: "#000000", marginTop: "0.2rem", width: "90px" }} placeholder="Enter here" value={orderNumberFilter} onChange={handleFilterChange} className="table-filter-input" />
                    </div>
                  </TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>Job Description</TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                      <span>Status</span>
                      <select name="statusFilter" style={{ color: "#000000", marginTop: "0.2rem", width: "100px" }} value={statusFilter} onChange={handleFilterChange} className="table-filter-input">
                        <option value="">Select</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>Rejection Reason</TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>Remarks</TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                      <span>Date Submitted</span>
                      <input type="date" name="dateSubmittedFilter" style={{ color: "#000000", marginTop: "0.2rem" }} placeholder="Filter by Date Submitted" value={dateSubmittedFilter} onChange={handleFilterChange} className="table-filter-input" />
                    </div>
                  </TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                      <span>Date Completed</span>
                      <input type="date" name="dateCompletedFilter" style={{ color: "#000000", marginTop: "0.2rem" }} placeholder="Filter by Date Completed" value={dateCompletedFilter} onChange={handleFilterChange} className="table-filter-input" />
                    </div>
                  </TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>Feedback</TableCell>

                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>Time Remaining</TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", textAlign: "center" }}>Track Job Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobOrders.length > 0 ? (
                  filteredJobOrders.map((order, index) => (
                    <TableRow key={order._id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{order.jobOrderNumber}</TableCell>
                      <TableCell>
                        <Button variant="contained" color="primary" onClick={() => handleOpenModal('jobDescription', order)}>
                          View Details
                        </Button>
                      </TableCell>
                      <TableCell>{getStatusLabel(order.status)}</TableCell>
                      <TableCell>
                        {order.status === "rejected" && (
                          <Button variant="contained" color="primary" onClick={() => handleOpenModal('rejectionReason', order)}>
                            View Reason
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {order.status === "completed" && (
                          <Button variant="contained" color="primary" onClick={() => handleOpenModal('remarks', order)}>
                            View Remarks
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(order.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {order.feedback ? (
                          <Button variant="contained" color="primary" onClick={() => handleOpenModal('viewFeedback', order)}>
                            View Feedback
                          </Button>
                        ) : order.status === "completed" && !order.feedbackSubmitted && (
                          <Button variant="contained" color="primary" onClick={() => handleOpenModal('feedback', order)}>
                            Submit Feedback
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>{calculateTimeRemaining(order)}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleOpenModal('tracking', order)}>
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">No job orders found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

          <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={400} />}>
            {openModals.jobDescription && (
              <ViewDetailsModal open={openModals.jobDescription} onClose={() => handleCloseModal('jobDescription')} request={selectedJobOrder} />
            )}
            {openModals.rejectionReason && (
              <RejectionReasonModal open={openModals.rejectionReason} onClose={() => handleCloseModal('rejectionReason')} reason={modalContent.rejectionReason} />
            )}
            {openModals.remarks && (
              <RemarksModal open={openModals.remarks} onClose={() => handleCloseModal('remarks')} remarks={modalContent.remarks} />
            )}
            {modalContent.userFeedback && (
              <FeedbackModal open={Boolean(modalContent.userFeedback)} onClose={() => setModalContent({ ...modalContent, userFeedback: null })} feedback={modalContent.userFeedback} />
            )}
            {openModals.feedback && (
              <SubmitFeedbackModal
                open={openModals.feedback}
                onClose={() => {
                  handleCloseModal('feedback');
                  setFeedback(""); // optionally clear feedback on close
                }}
                feedback={feedback}
                handleFeedbackChange={handleFeedbackChange}
                handleFeedbackSubmit={handleFeedbackSubmit}
              />
            )}
          </Suspense>

          <Modal open={openModals.tracking} onClose={() => handleCloseModal('tracking')}>
            <Box sx={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: 600, maxHeight: "80vh", bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4
            }}>
              <Typography variant="h6">Tracking Updates for Job Order: {selectedJobOrder?.jobOrderNumber}</Typography>
              <Box sx={{ mt: 2, maxHeight: "30vh", overflowY: "auto" }}>
                {selectedJobOrder?.tracking?.length > 0 ? (
                  <Table>
                    <TableHead><TableRow><TableCell>Date</TableCell><TableCell>Note</TableCell></TableRow></TableHead>
                    <TableBody>
                      {selectedJobOrder.tracking.map((update, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{new Date(update.date).toLocaleDateString()}</TableCell>
                          <TableCell>{update.note || "No note"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : <Typography>No tracking updates available.</Typography>}
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                {selectedJobOrder?.status === "ongoing" && (
                  <Button onClick={handleFollowUp} variant="contained" color="primary" disabled={isLoading}>
                    Follow Up
                  </Button>
                )}
                <Button onClick={() => handleCloseModal('tracking')} variant="outlined" color="error" sx={{ ml: 2 }}>
                  Close
                </Button>
              </Box>
            </Box>
          </Modal>
        </>
      )}
      <Loader isLoading={isLoading} />
    </div>
  );
};

export default UserHistory;