import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import DashboardComponent from "../Components/DashboardComponent";
import LayoutComponent from "../Components/LayoutComponent";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link } from "react-router-dom";
import axios from "axios";

const SuperAdminDashboard = () => {
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    ongoing: 0,
    completed: 0,
    rejected: 0,
  });

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const response = await axios.get('/api/allStatus'); // Adjust the URL based on your setup
        setStatusCounts(response.data);
      } catch (error) {
        console.error("Error fetching status counts:", error);
      }
    };

    fetchStatusCounts();
  }, []);

  return (
    <LayoutComponent>
      <div className="flex flex-col p-4">
        <div className="flex items-center mb-4">
          <Link to="/SuperAdminHomePage" className="text-decoration-none">
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
        <div className="flex justify-between">
          <div className="flex space-x-3">
            {["pending", "ongoing", "completed", "rejected"].map((status) => (
              <div
                key={status}
                className="flex flex-col items-center justify-center border border-gray-300 rounded-lg bg-gray-100 h-15 w-32"
              >
                <span className="text-gray-600 font-medium">
                  {status.charAt(0).toUpperCase() + status.slice(1)}: {statusCounts[status] || 0}
                </span>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <Link to="/campus-management" className="text-decoration-none">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": { backgroundColor: "#2563eb" },
                  transition: "background-color 0.3s, transform 0.2s",
                }}
              >
                Manage Campuses
              </Button>
            </Link>
            <Link to="/AnalyticsDashboard" className="text-decoration-none">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": { backgroundColor: "#2563eb" },
                  transition: "background-color 0.3s, transform 0.2s",
                }}
              >
                Analytics
              </Button>
            </Link>
            <Link to="/SuperAdminReport" className="text-decoration-none">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": { backgroundColor: "#2563eb" },
                  transition: "background-color 0.3s, transform 0.2s",
                }}
              >
                Report
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <div>
        <DashboardComponent />
      </div>
    </LayoutComponent>
  );
};

export default SuperAdminDashboard;
