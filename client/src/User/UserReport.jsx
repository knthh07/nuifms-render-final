import React from "react";
import CreateReport from "../Components/CreateReport";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon
import { Link } from "react-router-dom";
import LayoutComponent from "../Components/LayoutComponent";

const UserReport = () => {
  return (
    <LayoutComponent>
      <div className="flex items-center p-4">
        <Link to="/UserDashboardComponent" className="text-decoration-none">
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
      <CreateReport />
    </LayoutComponent>
  );
};

export default UserReport;
