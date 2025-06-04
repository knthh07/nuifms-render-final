import React, { useEffect, useState } from "react";
import { Button, Box, Drawer, List, ListItem, ListItemText, IconButton, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from "react-router-dom";
import axios from "axios";
import LayoutComponent from "../Components/LayoutComponent";
import DashboardComponent from "../Components/DashboardComponent";
import logo from '../assets/img/nu_webp.webp';

const Dashboard = () => {
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    ongoing: 0,
    completed: 0,
    rejected: 0,
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [jobOrders, setJobOrders] = useState([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);  // State for Drawer

  useEffect(() => {
    const fetchStatusCounts = async () => {
      try {
        const response = await axios.get("/api/allStatus");
        setStatusCounts(response.data);
      } catch (error) {
        console.error("Error fetching status counts:", error);
      }
    };

    fetchStatusCounts();
  }, []);

  const handleStatusClick = async (status) => {
    if (selectedStatus === status && isListOpen) {
      setIsListOpen(false); // Collapse if clicked again
      return;
    }

    setSelectedStatus(status);
    setIsListOpen(true);

    try {
      const response = await axios.get(`/api/statusList?status=${status}`);
      setJobOrders(response.data);
    } catch (error) {
      console.error("Error fetching job orders:", error);
    }
  };

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);  // Toggle Drawer

  return (
    <LayoutComponent>
      <div className="flex flex-col p-4">
        {/* Back Button and Hamburger Menu */}
        <div className="flex items-center justify-between mb-4">
          <Link to="/AdminHomePage" className="text-decoration-none">
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

          {/* Hamburger Menu Icon (Mobile View) */}
          <IconButton color="primary" onClick={toggleDrawer} sx={{ display: { xs: 'block', md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </div>

        {/* Main Content: Status Buttons (Desktop View) */}
        <Box display={{ xs: 'none', md: 'flex' }} justifyContent="space-between">
          {/* <div className="flex space-x-3">
            {["pending", "ongoing", "completed", "rejected"].map((status) => (
              <div
                key={status}
                onClick={() => handleStatusClick(status)}
                className="flex flex-col items-center justify-center border border-gray-300 rounded-lg bg-gray-100 h-15 w-32 cursor-pointer transition-transform duration-300 transform hover:scale-105"
              >
                <span className="text-gray-600 font-medium">
                  {status.charAt(0).toUpperCase() + status.slice(1)}:{" "}
                  {statusCounts[status] || 0}
                </span>
              </div>
            ))}
          </div> */}

          {/* Links to Manage Campuses, Analytics, and Report */}
          <div className="flex space-x-2">
            <Link to="/AdminCampusManagement" className="text-decoration-none">
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
            <Link to="/AdminAnalytics" className="text-decoration-none">
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
            <Link to="/report" className="text-decoration-none">
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
        </Box>

        <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer}>
          <List sx={{ width: 250, backgroundColor: "#35408e", color: "#fff", height: '100vh' }}>
            {/* Logo at the top */}
            <ListItem sx={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={logo} // Replace with your logo path
                alt="Logo"
                style={{ width: '100px', height: 'auto' }} // Adjust logo size
              />
            </ListItem>

            {/* Menu Links */}
            <ListItem button component={Link} to="/AdminCampusManagement">
              <ListItemText primary="Manage Campuses" />
            </ListItem>
            <ListItem button component={Link} to="/AdminAnalytics">
              <ListItemText primary="Analytics" />
            </ListItem>
            <ListItem button component={Link} to="/report ">
              <ListItemText primary="Report" />
            </ListItem>
          </List>
        </Drawer>

        {/* Collapsible Job Orders (Desktop View) */}
        <Collapse in={isListOpen} timeout="auto" unmountOnExit>
          <div className="mt-6 border border-gray-300 rounded-lg p-4 shadow-md transition-all duration-300">
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
                    Order #{job.jobOrderNumber} - {job.reqOffice}
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No job orders found.</p>
              )}
            </ul>
          </div>
        </Collapse>
      </div>

      <div>
        <DashboardComponent />
      </div>
    </LayoutComponent>
  );
};

export default Dashboard;
