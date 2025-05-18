import React, { useEffect, useState, lazy, Suspense, useContext } from "react";
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Typography, MenuItem, Select, FormControl, InputLabel, TextField, Modal, Button, InputAdornment, Skeleton } from "@mui/material";
import axios from "axios";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { toast } from "react-hot-toast";
import Loader from "../../hooks/Loader";
import Remarks from "../Remarks";
import PaginationComponent from "../../hooks/Pagination";
import { AuthContext } from "../../context/AuthContext";

const ViewDetailsModal = lazy(() => import("../ViewDetailsModal"));

const JobOrderTable = () => {
  const { profile } = useContext(AuthContext);
  const [jobOrders, setJobOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingOrder, setEditingOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [urgency, setUrgency] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");
  const [users, setUsers] = useState([]);
  const [dateAssigned, setDateAssigned] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [costRequired, setCostRequired] = useState("");
  const [chargeTo, setChargeTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmActionId, setConfirmActionId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [remarksOpem, setRemarksOpen] = useState(false);
  const [orderNumberFilter, setOrderNumberFilter] = useState("");
  const [jobDescFilter, setJobDescFilter] = useState("");
  const [assignedToFilter, setAssignedToFilter] = useState("");
  const [dateSubmittedFilter, setDateSubmittedFilter] = useState("");
  const [dateCompletedFilter, setdateCompletedFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Updated logAdminAction function accepts an optional order parameter.
  const logAdminAction = async (action, orderParam = selectedOrder) => {
    const adminEmail = profile.email;
    try {
      setIsLoading(true);
      if (!orderParam || !orderParam._id) throw new Error('No selected order found.');
      const adminNote = `Admin with email ${adminEmail} performed action: ${action}`;
      await axios.patch(
        `/api/jobOrders/${orderParam._id}/tracking`,
        { status: orderParam.status || "pending", note: adminNote },
        { withCredentials: true }
      );
      setJobOrders(jobOrders.map(order =>
        order._id === orderParam._id
          ? {
            ...order,
            tracking: [
              ...order.tracking,
              { date: new Date(), status: orderParam.status || "pending", note: adminNote, adminName: profile.name }
            ]
          }
          : order
      ));
      toast.success("Admin action logged successfully");
    } catch (error) {
      console.error("Error logging admin action:", error);
      toast.error(`Error logging admin action: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchJobOrders = async (page) => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/jobOrders?page=${page}`, { withCredentials: true });
        setJobOrders(response.data.requests);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || "Something went wrong"}`);
        console.error("Error fetching job orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/users?role=user&position=Facilities Employee", { withCredentials: true });
        setUsers(response.data.users);
      } catch (error) {
        toast.error(`Error: ${error.response?.data?.message || "Something went wrong"}`);
        console.error("Error fetching employees:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobOrders(currentPage);
    fetchEmployees();
  }, [currentPage]);

  const handleEdit = (order) => {
    setEditingOrder(order);
    setUrgency(order.urgency || "");
    setAssignedTo(order.assignedTo || "");
    setStatus(order.status || "");
    setDateAssigned(order.dateAssigned || "");
    setDateFrom(order.dateFrom || "");
    setDateTo(order.dateTo || "");
    setCostRequired(order.costRequired || "");
    setChargeTo(order.chargeTo || "");
    setModalOpen(true);
    setSelectedOrder(order);
    // Log admin action for opening the edit modal.
    logAdminAction(`Opened Edit Modal for Job Order: ${order.jobOrderNumber}`, order);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
    // Log admin action for viewing details.
    if (order.status !== "completed") {
      logAdminAction(`Viewed Details for Job Order: ${order.jobOrderNumber}`, order);
    }
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleConfirmAction = async (action) => {
    if (action === "complete") {
      try {
        setIsLoading(true);
        await axios.patch(`/api/jobOrders/${confirmActionId}/completeRemarks`, { remarks: remarks }, { withCredentials: true });
        // Log admin action for marking the job order as completed.
        const order = jobOrders.find(o => o._id === confirmActionId);
        if (order) logAdminAction(`Marked Job Order as Completed: ${order.jobOrderNumber}`, order);
        setJobOrders(jobOrders.filter((order) => order._id !== confirmActionId));
        handleCloseReasonModal();
        toast.success("Job order marked as Completed");
      } catch (error) {
        console.error("Error completing job order:", error.response ? error.response.data : error);
        toast.error("Please state your remarks.");
      } finally {
        setIsLoading(false);
      }
    }
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmActionId(null);
    setModalOpen(false);
    setRemarks("");
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      await axios.patch(`/api/jobOrders/${editingOrder._id}/update`, {
        urgency,
        assignedTo: users.find((user) => `${user.firstName} ${user.lastName}` === assignedTo)?.email,
        status,
        dateAssigned,
        dateFrom,
        dateTo,
        costRequired,
        chargeTo
      }, { withCredentials: true });
      setJobOrders(jobOrders.map((order) =>
        order._id === editingOrder._id
          ? { ...order, urgency, assignedTo, status, dateAssigned, dateFrom, dateTo, costRequired, chargeTo }
          : order
      ));
      setModalOpen(false);
      toast.success("Job order updated successfully");
      // Log admin action for updating a job order.
      logAdminAction(`Updated Job Order: ${editingOrder.jobOrderNumber}`, editingOrder);
    } catch (error) {
      console.error("Error updating job order:", error);
      toast.error("Error updating job order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenTrackingModal = async (order) => {
    try {
      setIsLoading(true);
      if (order.tracking && order.tracking.length > 0) {
        setSelectedOrder(order);
        setTrackingModalOpen(true);
      } else {
        const response = await axios.get(`/api/jobOrders/${order._id}/tracking`, { withCredentials: true });
        if (response.data.jobOrder.tracking) {
          setSelectedOrder({ ...order, tracking: response.data.jobOrder.tracking });
          setTrackingModalOpen(true);
        } else console.error("No tracking data available.");
      }
      // Log admin action for opening the tracking modal.
      // logAdminAction(`Opened Tracking Modal for Job Order: ${order.jobOrderNumber}`, order);
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

  const handleOpenReasonModal = (jobOrderId) => {
    setConfirmActionId(jobOrderId);
    setRemarksOpen(true);
    setRemarks("");
  };

  const handleCloseReasonModal = () => {
    setRemarksOpen(false);
    setRemarks("");
  };

  const formatDate = (date) => !date ? "" : new Date(date).toISOString().split('T')[0];

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "dateAssigned") setDateAssigned(value);
    if (name === "dateFrom") setDateFrom(value);
    if (name === "dateTo") setDateTo(value);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed": return "Completed";
      case "notCompleted": return "Not Completed";
      case "rejected": return "Rejected";
      case "pending": return "Pending";
      case "ongoing": return "On Going";
      default: return "Unknown";
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

  const filteredJobOrders = jobOrders
    .filter((order) => (order.jobOrderNumber || "").toLowerCase().includes(orderNumberFilter.toLowerCase()))
    .filter((order) => (order.jobDescription || "").toLowerCase().includes(jobDescFilter.toLowerCase()))
    .filter((order) => (order.assignedTo || "").toLowerCase().includes(assignedToFilter.toLowerCase()))
    .filter((order) => isNaN(new Date(dateSubmittedFilter)) || new Date(order.createdAt) >= new Date(dateSubmittedFilter))
    .filter((order) => isNaN(new Date(dateCompletedFilter)) || new Date(order.updatedAt) >= new Date(dateCompletedFilter))
    .filter((order) => (order.status || "").toLowerCase().includes(statusFilter.toLowerCase()))
    .filter((order) => (order.urgency || "").toLowerCase().includes(urgencyFilter.toLowerCase()));

  const sortedJobOrders = filteredJobOrders.sort((a, b) => {
    if (a.status.toLowerCase() === "ongoing" && b.status.toLowerCase() !== "ongoing") return -1;
    if (a.status.toLowerCase() !== "ongoing" && b.status.toLowerCase() === "ongoing") return 1;
    return 0;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="flex">
      <div className="flex flex-col w-full">
        <Box>
          <TableContainer component={Paper} className="shadow-md rounded-lg table-container">
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
                      <span>Assigned To</span>
                      <input type="text" name="assignedToFilter" style={{ color: "#000000", marginTop: "0.2rem", width: "90px" }} placeholder="Enter here" value={assignedToFilter} onChange={handleFilterChange} className="table-filter-input" />
                    </div>
                  </TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "start" }}>
                      <span>Urgency</span>
                      <select name="urgencyFilter" style={{ color: "#000000", marginTop: "0.2rem", width: "100px" }} value={urgencyFilter} onChange={handleFilterChange} className="table-filter-input">
                        <option value="">Select</option>
                        <option value="high">High</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </TableCell>
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
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff" }}>Time Remaining</TableCell>
                  <TableCell style={{ backgroundColor: "#35408e", color: "#ffffff", textAlign: "center" }}>Manage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobOrders.length > 0 ? filteredJobOrders.map((order, index) => (
                  <TableRow key={order._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{order.jobOrderNumber}</TableCell>
                    <TableCell>
                      <Button variant="contained" color="primary" onClick={() => handleViewDetails(order)} aria-label="view details">View Details</Button>
                    </TableCell>
                    <TableCell>{order.assignedTo || "N/A"}</TableCell>
                    <TableCell>{order.urgency || "N/A"}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {order.status === "completed" ? new Date(order.updatedAt).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>{getStatusLabel(order.status || "N/A")}</TableCell>
                    <TableCell>{calculateTimeRemaining(order)}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      {["ongoing"].includes(order.status) && (
                        <>
                          <IconButton aria-label="edit" onClick={() => handleEdit(order)}><EditIcon /></IconButton>
                          <IconButton onClick={() => handleOpenReasonModal(order._id)} aria-label="complete"><CheckCircleIcon /></IconButton>
                          <IconButton aria-label="add-tracking" onClick={() => handleOpenTrackingModal(order)}><VisibilityIcon /></IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Skeleton variant="rectangular" width="100%" height={200} />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <PaginationComponent currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

          <Suspense fallback={<div>Loading...</div>}>
            <ViewDetailsModal open={viewModalOpen} onClose={() => setViewModalOpen(false)} request={selectedOrder} />
          </Suspense>

          <Modal open={modalOpen} onClose={() => setModalOpen(false)} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "90%", maxWidth: 500, bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
              <Typography id="modal-modal-title" variant="h6" component="h2">For Physical Facilities Office Remarks</Typography>
              <FormControl fullWidth margin="normal">
                <TextField label="Cost Required" type="number" value={costRequired} onChange={(e) => setCostRequired(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start">₱</InputAdornment> }} />
              </FormControl>
              <FormControl fullWidth margin="normal">
                <TextField label="Charge To" value={chargeTo} onChange={(e) => setChargeTo(e.target.value)} />
              </FormControl>
              <Box sx={{ mt: 2, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <Button onClick={handleUpdate} variant="contained" color="primary">Update</Button>
                <Button onClick={() => setModalOpen(false)} variant="contained" color="error" sx={{ mt: 1 }}>Cancel</Button>
              </Box>
            </Box>
          </Modal>

          <Modal open={trackingModalOpen} onClose={handleCloseTrackingModal} aria-labelledby="tracking-modal-title" aria-describedby="tracking-modal-description">
            <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 600, maxHeight: "80vh", bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
              <Typography id="tracking-modal-title" variant="h6" component="h2">Tracking Updates for Job Order: {selectedOrder?.jobOrderNumber}</Typography>
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
                ) : <Typography>No tracking updates available.</Typography>}
              </Box>
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button onClick={handleCloseTrackingModal} variant="outlined" color="error">Close</Button>
              </Box>
            </Box>
          </Modal>

          <Remarks open={remarksOpem} onClose={() => setRemarksOpen(false)} remarks={remarks} setRemarks={setRemarks} onComplete={() => handleConfirmAction("complete")} />
        </Box>
        <Loader isLoading={isLoading} />
      </div>
    </div>
  );
};

export default JobOrderTable;
