import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon
import LayoutComponent from "./LayoutComponent";
import UserHistory from "../User/UserHistory";

const UserDashboardComponent = () => {
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
                border: "1px solid #3f51b5", // Primary color border
                color: "#3f51b5",
                "&:hover": {
                  backgroundColor: "#3f51b5", // Darken on hover
                  color: "#fff", // Change text color on hover
                },
                marginRight: "16px", // Space between the back button and the title
              }}
            >
              Back
            </Button>
          </Link>
        </div>

        {/* Buttons and Status Containers */}
        <div className="flex justify-between mb-4">
          {/* Status Containers */}
          <div className="flex space-x-3">
            {" "}
            {/* Flex container for status boxes */}
            {["Pending", "Ongoing", "Completed", "Rejected"].map((status) => (
              <div
                key={status}
                className="flex flex-col items-center justify-center border border-gray-300 rounded-lg bg-gray-100 h-10 w-32" // Style for each container
              >
                <span className="text-gray-600 font-medium">{status}</span>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <Link to="/UserApplication" className="text-decoration-none">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6", // Tailwind's blue-600
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
                  "&:hover": {
                    backgroundColor: "#2563eb", // Tailwind's blue-700
                  },
                  transition: "background-color 0.3s, transform 0.2s", // Smooth transitions
                  marginRight: "5px",
                }}
              >
                Apply Request
              </Button>
            </Link>
            <Link to="/UserReport" className="text-decoration-none">
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#3b82f6", // Tailwind's blue-600
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
                  "&:hover": {
                    backgroundColor: "#2563eb", // Tailwind's blue-700
                  },
                  transition: "background-color 0.3s, transform 0.2s", // Smooth transitions
                }}
              >
                Report
              </Button>
            </Link>
          </div>
        </div>

        {/* User History Section */}
        <UserHistory />
      </div>
    </LayoutComponent>
  );
};

export default UserDashboardComponent;
