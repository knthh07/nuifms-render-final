import React, { useEffect, useState, Suspense, lazy } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Skeleton,
  IconButton,
  Modal,
} from "@mui/material";
import FeedbackModal from "../Components/FeedbackModal";
import { toast } from "react-hot-toast"; // Make sure to import react-hot-toast
import Loader from "../hooks/Loader";
const ViewDetailsModal = lazy(() => import("../Components/ViewDetailsModal"));
import RejectionReasonModal from "../Components/RejectionReasonModal"; // Import the new modal
import RemarksModal from "../Components/RemarksModal";
import SubmitFeedbackModal from "../Components/SubmitFeedbackModal";
import PaginationComponent from "../hooks/Pagination";
import VisibilityIcon from "@mui/icons-material/Visibility";

const UserHistory = () => {
  const [jobOrders, setJobOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [openJobDescriptionModal, setOpenJobDescriptionModal] = useState(false);
  const [openRejectionReasonModal, setOpenRejectionReasonModal] = useState(false);
  const [openRemarksModal, setOpenRemarksModal] = useState(false);
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [selectedJobOrder, setSelectedJobOrder] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [userFeedback, setUserFeedback] = useState(null); // For viewing feedback
  const [rejectionReasonContent, setRejectionReasonContent] = useState("");
  const [remarksContent, setRemarksContent] = useState("");
  const [isLoading, setLoading] = useState(false); // Loading state
  const [orderNumberFilter, setOrderNumberFilter] = useState("");
  const [dateSubmittedFilter, setDateSubmittedFilter] = useState("");
  const [dateCompletedFilter, setdateCompletedFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchJobOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("/api/history", {
          params: {
            page: currentPage,
          },
        });
        setJobOrders(response.data.requests);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        setError("Failed to load job orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobOrders();
  }, [currentPage]);

  const handleOpenTrackingModal = async (order) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/jobOrders/${order._id}/tracking`, {
        withCredentials: true,
      });
      setSelectedJobOrder({
        ...order,
        tracking: response.data.jobOrder.tracking,
      });
      setTrackingModalOpen(true);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTrackingModal = () => {
    setTrackingModalOpen(false);
    setSelectedJobOrder(null);
  };

  const getLatestTrackingStatus = (tracking) => {
    if (tracking && tracking.length > 0) {
      return tracking[tracking.length - 1]?.status || "No updates";
    }
    return "No updates"; // Fallback if no tracking updates are available
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleOpenJobDescriptionModal = (jobOrder) => {
    setSelectedJobOrder(jobOrder);
    setOpenJobDescriptionModal(true);
  };

  const handleCloseJobDescriptionModal = () => {
    setOpenJobDescriptionModal(false);
    setSelectedJobOrder(null);
  };

  const handleOpenRejectionReasonModal = (jobOrder) => {
    const content = jobOrder.rejectionReason || "No rejection reason provided.";
    setRejectionReasonContent({ reason: content });
    setOpenRejectionReasonModal(true);
  };

  const handleOpenRemarksModal = (jobOrder) => {
    const content = jobOrder.remarks || "No remarks provided.";
    setRemarksContent({ remarks: content });
    setOpenRemarksModal(true);
  };

  const handleCloseRejectionReasonModal = () => {
    setOpenRejectionReasonModal(false);
  };

  const handleCloseRemarksModal = () => {
    setOpenRemarksModal(false);
  };

  const handleOpenFeedbackModal = (jobOrder) => {
    setSelectedJobOrder(jobOrder);
    setOpenFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setOpenFeedbackModal(false);
  };

  const handleOpenFeedbackViewModal = (jobOrder) => {
    setUserFeedback({
      feedback: jobOrder.feedback || "No feedback available.",
      firstName: jobOrder.firstName,
      lastName: jobOrder.lastName,
      date: jobOrder.feedbackDate || new Date().toISOString(),
    });
  };

  const handleFeedbackChange = (event) => {
    setFeedback(event.target.value);
  };

  // Function to map status values to user-friendly labels
  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "notCompleted":
        return "Not Completed";
      case "rejected":
        return "Rejected";
      case "pending":
        return "Pending";
      case "ongoing":
        return "On Going";
      default:
        return "Unknown"; // or return an empty string if you prefer
    }
  };

  const handleFeedbackSubmit = async () => {
    if (selectedJobOrder) {
      try {
        setLoading(true);
        const response = await axios.put(
          `/api/jobOrders/${selectedJobOrder._id}/feedback`,
          { feedback }
        );
        if (response.data.error) {
          alert(response.data.error);
          return;
        }
        // Show toast notification
        toast.success("Feedback submitted successfully");

        // Update jobOrders state to reflect the feedback status change
        setJobOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedJobOrder._id
              ? {
                ...order,
                feedback: response.data.jobOrder.feedback,
                feedbackSubmitted: true,
              }
              : order
          )
        );
        handleCloseFeedbackModal();
        handleOpenFeedbackViewModal(response.data.jobOrder);
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data.message || "Failed to submit feedback."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFollowUp = async () => {
    if (selectedJobOrder) {
      try {
        setLoading(true);
        const response = await axios.post(
          `/api/jobOrders/${selectedJobOrder._id}/follow-up`,
          {}, // Empty body
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.error) {
          alert(response.data.error);
          return;
        }

        toast.success(response.data.message || "Follow-up request processed successfully");
        setJobOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === selectedJobOrder._id
              ? { ...order, followUpRequested: true }
              : order
          )
        );
      } catch (error) {
        console.error("Error in handleFollowUp:", error);
        toast.error(
          error.response?.data.message || "Failed to send follow-up request."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "orderNumberFilter") setOrderNumberFilter(value);
    if (name === "jobDescFilter") setJobDescFilter(value);
    if (name === "assignedToFilter") setAssignedToFilter(value);
    if (name === "dateSubmittedFilter") setDateSubmittedFilter(value);
    if (name === "dateCompletedFilter") setdateCompletedFilter(value);
    if (name === "statusFilter") setStatusFilter(value);
    if (name === "urgencyFilter") setUrgencyFilter(value);
  };

  // Filter job orders based on filters
  const filteredJobOrders = jobOrders
    .filter((order) =>
      (order.jobOrderNumber || "")
        .toLowerCase()
        .includes(orderNumberFilter.toLowerCase())
    )
    .filter((order) => {
      const dateSubmitted = new Date(order.createdAt);
      const filterDateSubmitted = new Date(dateSubmittedFilter);
      return isNaN(filterDateSubmitted) || dateSubmitted >= filterDateSubmitted;
    })
    .filter((order) => {
      const dateCompleted = new Date(order.updatedAt);
      const filterDateCompleted = new Date(dateCompletedFilter);
      return isNaN(filterDateCompleted) || dateCompleted >= filterDateCompleted;
    })
    .filter((order) =>
      (order.status || "").toLowerCase().includes(statusFilter.toLowerCase())
    );

  // Sort job orders so 'ongoing' status is at the top
  const sortedJobOrders = filteredJobOrders.sort((a, b) => {
    if (a.status.toLowerCase() === "ongoing" && b.status.toLowerCase() !== "ongoing") {
      return -1;
    }
    if (a.status.toLowerCase() !== "ongoing" && b.status.toLowerCase() === "ongoing") {
      return 1;
    }
    return 0;
  });

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <Skeleton variant="rectangular" width="100%" height={200} />
      ) : error ? (
        <Typography variant="h6" className="text-center text-red-500">
          {error}
        </Typography>
      ) : jobOrders.length === 0 ? (
        <Typography variant="h6" className="text-center">
          No Job Orders found.
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} className="shadow-md">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    style={{ backgroundColor: "#35408e", color: "#ffffff" }}
                  >
                    #
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#35408e", color: "#ffffff" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                      }}
                    >
                      <span>Order Number</span>
                      <input
                        type="text"
                        name="orderNumberFilter"
                        style={{ color: "#000000", marginTop: "0.2rem", width: "90px" }}
                        placeholder="Enter here"
                        value={orderNumberFilter}
                        onChange={handleFilterChange}
                        className="table-filter-input"
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#35408e",
                      color: "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    Job Description
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#35408e",
                      color: "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    Status
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#35408e",
                      color: "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    Rejection Reason
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#35408e",
                      color: "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    Remarks
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#35408e", color: "#ffffff" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                      }}
                    >
                      <span>Date Submitted</span>
                      <input
                        type="date"
                        name="dateSubmittedFilter"
                        style={{ color: "#000000", marginTop: "0.2rem" }} // Fixed typo from '0.2 rem' to '0.2rem'
                        placeholder="Filter by Date Submitted"
                        value={dateSubmittedFilter}
                        onChange={handleFilterChange}
                        className="table-filter-input"
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    style={{ backgroundColor: "#35408e", color: "#ffffff" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "start",
                      }}
                    >
                      <span>Date Completed</span>
                      <input
                        type="date"
                        name="dateCompletedFilter"
                        style={{ color: "#000000", marginTop: "0.2rem" }} // Fixed typo from '0.2 rem' to '0.2rem'
                        placeholder="Filter by Date Completed"
                        value={dateCompletedFilter}
                        onChange={handleFilterChange}
                        className="table-filter-input"
                      />
                    </div>
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#35408e",
                      color: "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    Feedback
                  </TableCell>
                  <TableCell
                    style={{
                      backgroundColor: "#35408e",
                      color: "#ffffff",
                      fontWeight: "bold",
                    }}
                  >
                    Track Job Order
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobOrders && filteredJobOrders.length > 0 ? (
                  filteredJobOrders.map((order, index) => (
                    <TableRow key={order._id || order.createdAt}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{order.jobOrderNumber}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleOpenJobDescriptionModal(order)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                      <TableCell>{getStatusLabel(order.status || "N/A")}</TableCell>
                      <TableCell>
                        {["rejected"].includes(order.status) ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenRejectionReasonModal(order)}
                          >
                            View Reason
                          </Button>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {["completed"].includes(order.status) ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenRemarksModal(order)}
                          >
                            View Remarks
                          </Button>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(order.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {order.feedback ? (
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenFeedbackViewModal(order)}
                          >
                            View Feedback
                          </Button>
                        ) : (
                          order.status === "completed" &&
                          !order.feedbackSubmitted && (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenFeedbackModal(order)}
                            >
                              Submit Feedback
                            </Button>
                          )
                        )}
                      </TableCell>
                      <TableCell style={{ display: "flex", justifyContent: "center" }}>
                        <IconButton
                          aria-label="view-tracking"
                          onClick={() => handleOpenTrackingModal(order)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} align="center">
                      No job orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>

          {/* Pagination */}
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
          {/* Job Order Details Modal */}
          <Suspense
            fallback={
              <Skeleton variant="rectangular" width="100%" height={400} />
            }
          >
            {openJobDescriptionModal && (
              <ViewDetailsModal
                open={openJobDescriptionModal}
                onClose={handleCloseJobDescriptionModal}
                request={selectedJobOrder}
              />
            )}
          </Suspense>

          {/* Rejection Reason Modal */}
          <RejectionReasonModal
            open={openRejectionReasonModal}
            onClose={handleCloseRejectionReasonModal}
            reason={rejectionReasonContent.reason}
          />

          {/* Remarks Modal */}
          <RemarksModal
            open={openRemarksModal}
            onClose={handleCloseRemarksModal}
            remarks={remarksContent.remarks}
          />

          {/* Feedback Modal for Viewing Feedback */}
          <FeedbackModal
            open={Boolean(userFeedback)}
            onClose={() => setUserFeedback(null)}
            feedback={userFeedback}
          />

          {/* Submit Feedback Modal */}
          <SubmitFeedbackModal
            open={openFeedbackModal} // Use the correct state variable here
            onClose={handleCloseFeedbackModal} // Close feedback modal
            feedback={feedback}
            handleFeedbackChange={handleFeedbackChange}
            handleFeedbackSubmit={handleFeedbackSubmit}
          />

          <Modal
            open={trackingModalOpen}
            onClose={handleCloseTrackingModal}
            aria-labelledby="tracking-modal-title"
            aria-describedby="tracking-modal-description"
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 600,
                maxHeight: "80vh",  // Limit the height of the modal to 50% of the viewport height
                bgcolor: "background.paper",
                border: "2px solid #000",
                boxShadow: 24,
                p: 4,
              }}
            >
              {/* Modal Header */}
              <Typography
                id="tracking-modal-title"
                variant="h6"
                component="h2"
              >
                Tracking Updates for Job Order: {selectedJobOrder?.jobOrderNumber}
              </Typography>

              {/* Scrollable Container for Notes */}
              <Box
                sx={{
                  mt: 2,
                  maxHeight: "30vh", // Set a fixed height for the notes section (30% of the viewport)
                  overflowY: "auto", // Make the notes section scrollable
                }}
              >
                {selectedJobOrder?.tracking && selectedJobOrder.tracking.length > 0 ? (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Note</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedJobOrder.tracking.map((update, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(update.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{update.note || "No note"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Typography>No tracking updates available.</Typography>
                )}
              </Box>

              {/* Footer with Buttons */}
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                {/* Follow Up Button (Only shown if status is 'ongoing') */}
                {selectedJobOrder?.status?.toLowerCase().trim() === "ongoing" && (
                  <Button
                    onClick={handleFollowUp}
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : "Follow Up"}
                  </Button>
                )}
                <Button
                  onClick={handleCloseTrackingModal}
                  variant="outlined"
                  color="error"
                  sx={{ marginLeft: 2 }} // Add margin to the left of the Close button
                >
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
