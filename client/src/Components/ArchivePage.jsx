import React, { useEffect, useState, lazy, Suspense } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Pagination, Typography, IconButton, Button, Modal } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Loader from "../hooks/Loader";
import RejectionReasonModal from "./RejectionReasonModal";
import PaginationComponent from "../hooks/Pagination";
import RemarksModal from "./RemarksModal";
import FeedbackModal from "./FeedbackModal";
import VisibilityIcon from "@mui/icons-material/Visibility";

const ViewDetailsModal = lazy(() => import("./ViewDetailsModal"));
const FilterModal = lazy(() => import("./FilterModal"));

const ArchivePage = () => {
  const [jobOrders, setJobOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [filterBy, setFilterBy] = useState("day");
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [openRejectionReasonModal, setOpenRejectionReasonModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectionReasonContent, setRejectionReasonContent] = useState({ reason: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [openRemarksModal, setOpenRemarksModal] = useState(false);
  const [remarksContent, setRemarksContent] = useState("");
  const [userFeedback, setUserFeedback] = useState(null);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobOrders = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/archive", {
          params: {
            page: currentPage,
            ...(status && { status }),
            ...(lastName && { lastName }),
            ...(dateRange.startDate && dateRange.endDate && {
              dateRange: `${dateRange.startDate}:${dateRange.endDate}`,
              filterBy,
            }),
          },
          withCredentials: true,
        });
        setJobOrders(response.data.requests);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error("Error fetching job orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobOrders();
  }, [currentPage, status, lastName, dateRange, filterBy]);

  const handleOpenTrackingModal = async (order) => {
    try {
      setIsLoading(true);
      if (order.tracking && order.tracking.length > 0) {
        setSelectedOrder(order);
        setTrackingModalOpen(true);
      } else {
        const response = await axios.get(`/api/jobOrders/${order._id}/tracking`, {
          withCredentials: true,
        });
        if (response.data.jobOrder.tracking) {
          setSelectedOrder({ ...order, tracking: response.data.jobOrder.tracking });
          setTrackingModalOpen(true);
        } else {
          console.error("No tracking data available.");
        }
      }
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseTrackingModal = () => {
    setTrackingModalOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenFilterModal = () => setOpenFilterModal(true);
  const handleCloseFilterModal = () => setOpenFilterModal(false);
  const handleOpenDetailsModal = (order) => {
    setSelectedOrder(order);
    setDetailsModalOpen(true);
  };
  const handleCloseDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedOrder(null);
  };
  const handleOpenRejectionReasonModal = (order) => {
    setRejectionReasonContent({ reason: order.rejectionReason || "No rejection reason provided." });
    setOpenRejectionReasonModal(true);
  };
  const handleCloseRejectionReasonModal = () => {
    setOpenRejectionReasonModal(false);
  };
  const handleApplyFilters = () => {
    setOpenFilterModal(false);
    setCurrentPage(1);
  };
  const handleOpenRemarksModal = (jobOrder) => {
    const content = jobOrder.remarks || "No remarks provided.";
    setRemarksContent({ remarks: content });
    setOpenRemarksModal(true);
  };
  const handleCloseRemarksModal = () => {
    setOpenRemarksModal(false);
  };
  const handleOpenFeedbackViewModal = (jobOrder) => {
    setUserFeedback({
      feedback: jobOrder.feedback || "No feedback available.",
      firstName: jobOrder.firstName,
      lastName: jobOrder.lastName,
      date: jobOrder.feedbackDate || new Date().toISOString(),
    });
  };
  const handleCloseFeedbackModal = () => {
    setOpenFeedbackModal(false);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed": return "Complete";
      case "notCompleted": return "Not Completed";
      case "rejected": return "Rejected";
      default: return "Unknown";
    }
  };

  return (
    <div className="flex flex-col p-4">
      <Box>
        <Suspense fallback={<div>Loading...</div>}>
          <FilterModal open={openFilterModal} onClose={handleCloseFilterModal} status={status} setStatus={setStatus} lastName={lastName} setLastName={setLastName} dateRange={dateRange} setDateRange={setDateRange} filterBy={filterBy} setFilterBy={setFilterBy} onApply={handleApplyFilters} />
        </Suspense>

        <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", fontWeight: "bold" }}>Name</TableCell>
                <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", fontWeight: "bold" }}>Job Description</TableCell>
                <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", fontWeight: "bold" }}>Status</TableCell>
                <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", fontWeight: "bold", textAlign: "center" }}>Rejection Reason</TableCell>
                <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", fontWeight: "bold" }}>Remarks</TableCell>
                <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", fontWeight: "bold" }}>View Feedback</TableCell>
                <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", fontWeight: "bold", textAlign: "center"}}>Track Job Order</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobOrders.length > 0 ? (
                jobOrders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.firstName} {order.lastName}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handleOpenDetailsModal(order)}>View Details</Button>
                    </TableCell>
                    <TableCell>{getStatusLabel(order.status)}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {["rejected", "notCompleted"].includes(order.status) && (
                        <Button variant="contained" color="primary" onClick={() => handleOpenRejectionReasonModal(order)}>View Reason</Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {["completed"].includes(order.status) ? (
                        <Button variant="contained" color="primary" onClick={() => handleOpenRemarksModal(order)}>View Remarks</Button>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {order.feedback ? (
                        <Button variant="contained" color="primary" onClick={() => handleOpenFeedbackViewModal(order)}>View Feedback</Button>
                      ) : null}
                    </TableCell>
                    <TableCell style={{ display: "flex", justifyContent: "center" }}>
                      <IconButton aria-label="view-tracking" onClick={() => handleOpenTrackingModal(order)}><VisibilityIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6}>No job orders found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Suspense fallback={<div>Loading...</div>}>
        <ViewDetailsModal open={detailsModalOpen} onClose={handleCloseDetailsModal} request={selectedOrder} />
      </Suspense>

      <RemarksModal open={openRemarksModal} onClose={handleCloseRemarksModal} remarks={remarksContent.remarks} />
      <FeedbackModal open={Boolean(userFeedback)} onClose={() => setUserFeedback(null)} feedback={userFeedback} />
      <RejectionReasonModal open={openRejectionReasonModal} onClose={handleCloseRejectionReasonModal} reason={rejectionReasonContent.reason} />

      <Modal open={trackingModalOpen} onClose={handleCloseTrackingModal} aria-labelledby="tracking-modal-title" aria-describedby="tracking-modal-description">
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, maxHeight: "80vh", bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
          <Typography id="tracking-modal-title" variant="h6" component="h2">
            Tracking Updates for Job Order: {selectedOrder?.jobOrderNumber}
          </Typography>
          <Box sx={{ mt: 2, maxHeight: "30vh", overflowY: "auto" }}>
            {selectedOrder?.tracking && selectedOrder.tracking.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Note</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedOrder.tracking.map((update, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(update.date).toLocaleDateString()}</TableCell>
                      <TableCell>{update.status || "No status"}</TableCell>
                      <TableCell>{update.note || "No note"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No tracking updates available.</Typography>
            )}
          </Box>
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseTrackingModal} variant="outlined" color="error">Close</Button>
          </Box>
        </Box>
      </Modal>

      <Loader isLoading={isLoading} />
    </div>
  );
};

export default ArchivePage;