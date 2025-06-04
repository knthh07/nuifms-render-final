import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Button, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LayoutComponent from "./LayoutComponent";
import UserHistory from "../User/UserHistory";
import axios from 'axios';
import { AuthContext } from "../context/AuthContext"; // Adjust the path as necessary

const UserDashboardComponent = () => {
  const { profile } = useContext(AuthContext); // Access profile from context
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    ongoing: 0,
    completed: 0,
    rejected: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [jobOrders, setJobOrders] = useState([]);
  const [isListOpen, setIsListOpen] = useState(false);

  useEffect(() => {
    const fetchStatusCounts = async () => {
      if (profile) {
        try {
          const response = await axios.get("/api/getStatusUsers", {
            withCredentials: true,
          });
          setStatusCounts(response.data);
        } catch (error) {
          console.error("Error fetching status counts:", error);
        }
      }
    };

    fetchStatusCounts();
  }, [profile]); // Dependency on profile

  const handleStatusClick = async (status) => {
    if (selectedStatus === status && isListOpen) {
      setIsListOpen(false);
      return;
    }

    setSelectedStatus(status);
    setIsListOpen(true);

    try {
      const response = await axios.get(`/api/getUserJobOrders`, {
        params: { status }, // No need for userId as it's handled server-side
        withCredentials: true,
      });
      setJobOrders(response.data);
    } catch (error) {
      console.error("Error fetching job orders:", error);
    }
  };

  return (
    <LayoutComponent>
      <div className="flex flex-col p-4">
        {/* Back Button Section */}
        <div className="flex items-center mb-4">
          <Link to="/UserHomePage" className="text-decoration-none">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBackIcon />}
              sx={{
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid #3f51b5",
                color: "#3f51b5",
                "&:hover": {
                  backgroundColor: "#3f51b5",
                  color: "#fff",
                },
                marginRight: "16px",
              }}
            >
              Back
            </Button>
          </Link>
        </div>

        {/* Buttons and Status Containers */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-4">
          {/* Status Containers */}
          {/* <div className="flex flex-wrap gap-3 justify-start">

            {["pending", "ongoing", "completed", "rejected"].map((status) => (
              <div
                key={status}
                onClick={() => handleStatusClick(status)}
                className="flex flex-col items-center justify-center border border-gray-300 rounded-lg bg-gray-100 h-20 w-36 sm:w-32 cursor-pointer transition-transform duration-300 transform hover:scale-105"
              >
                <span className="text-gray-600 font-medium">  
                  {status.charAt(0).toUpperCase() + status.slice(1)}:{" "}
                  {statusCounts[status] || 0}
                </span>
              </div>
            ))}
          </div> */}

          <div className="flex flex-wrap gap-2">
            <Link to="/UserApplication" className="text-decoration-none">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    backgroundColor: "#2563eb",
                  },
                  transition: "background-color 0.3s, transform 0.2s",
                  marginRight: "5px",
                }}
              >
                Apply Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Job Orders List */}
        <Collapse in={isListOpen} timeout="auto" unmountOnExit>
          <div className="mt-2 mb-4 border border-gray-300 rounded-lg p-4 shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                Job Orders with Status: {selectedStatus && selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
              </h2>
              <Button
                size="small"
                onClick={() => setIsListOpen(false)}
                sx={{ minWidth: "auto", color: "gray" }}
              >
                {isListOpen ? <ExpandLess /> : <ExpandMore />}
              </Button>
            </div>
            <ul className="mt-2 list-disc pl-6 space-y-1">
              {jobOrders.length > 0 ? (
                jobOrders.map((job) => (
                  <li key={job._id} className="text-gray-700 hover:text-blue-500 transition-colors duration-150">
                    Order #{job.jobOrderNumber} - {job.description}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No job orders found.</p>
              )}
            </ul>
          </div>
        </Collapse>

        {/* User History Section */}
        <UserHistory />
      </div>
    </LayoutComponent>
  );
};

export default UserDashboardComponent;
