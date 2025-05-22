import React, { useState, useEffect, useCallback } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon
import { Link } from "react-router-dom";
import LayoutComponent from "../Components/LayoutComponent";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Typography, Divider } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-hot-toast";
import Loader from "../hooks/Loader";

const data = {
  "National University Manila": {
    "MAIN BUILDING": {
      GROUND: ["HEALTH SERVICES", "LOGISTICS/PURCHASING", "NATIONAL UNIVERSITY ALUMNI FOUNDATION INC", "MOTORPOOL", "ASSET MANAGEMENT OFFICE", "PHYSICAL FACILITIES MANAGEMENT OFFICE", "BULLDOGS EXCHANGE"],
      SECOND: ["TREASURY OFFICE", "ADMISSIONS", "REGISTRAR"],
      THIRD: ["COLLEGE OF ALLIED HEALTH"],
      FOURTH: ["RESEARCH AND DEVELOPMENT", "IT SYSTEMS OFFICE", "FACULTY AND ADMINISTRATION OFFICE", "QMO MANILA", "SAFETY OFFICE", "AVP-ACADEMIC SERVICES", "AVP-ADMINISTRATION", "VP-OPERATIONS"],
      FIFTH: ["ACADEME INTERNSHIP AND PLACEMENT OFFICE", "DATA PRIVACY OFFICE", "EDUCATION TECHNOLOGY", "CCIT"],
      SIXTH: ["ROOMS"],
      SEVENTH: ["COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT"],
      EIGHTH: ["ATHLETICS OFFICE"]
    },
    JMB: {
      GROUND: ["SECURITY OFFICE"],
      SECOND: ["ROOMS"],
      THIRD: ["DISCIPLINE OFFICE"],
      FOURTH: ["ROOMS"],
      FIFTH: ["LEARNING RESOURCE CENTER"]
    },
    ANNEX: {
      GROUND: ["ALUMNI/MARKETING AND COMMUNICATIONS OFFICE - MANILA"],
      SECOND: ["LEARNING RESOURCE CENTER"],
      THIRD: ["COMEX/NSTP", "NUCSG OFFICE", "STUDENT DEVELOPMENT AND ACTIVITIES OFFICE", "ATHLETE ACADEMIC DEVELOPMENT OFFICE", "COLLEGE OF ENGINEERING"],
      FOURTH: ["GENERAL ACCOUNTING AND BUDGETING - MANILA", "HUMAN RESOURCES - MANILA", "GUIDANCE SERVICES OFFICE", "CENTER FOR INNOVATIVE AND SUSTAINABLE DEVELOPMENT", "INTERNATIONAL STUDENT SERVICES OFFICE"],
      FIFTH: ["ROOMS"],
      SIXTH: ["ROOMS"],
      SEVENTH: ["CEAS"],
      EIGHTH: ["ROOMS"],
      NINTH: ["ROOMS"],
      TENTH: ["ROOMS"],
      ELEVENTH: ["ROOMS"],
      TWELFTH: ["GYM"]
    },
    "ANNEX II": {
      GROUND: ["FACULTY OFFICE", "HEALTH SERVICES", "GYM", "STUDENT SERVICES", "CANTEEN"],
      SECOND: ["ROOMS"],
      THIRD: ["ROOMS"],
      FOURTH: ["LEARNING RESOURCE CENTER"]
    },
    OSIAS: {
      GROUND: ["CORPORATE MARKETING AND COMMUNICATION OFFICE", "ALUMNI OFFICE", "LEGACY OFFICE", "SAFETY AND SECURITY"],
      SECOND: ["QUALITY MANAGEMENT OFFICE", "CONSTRUCTION AND FACILITIES MANAGEMENT OFFICE", "OFFICE OF THE PRESIDENT", "BUSINESS DEVELOPMENT AND LINKAGES", "VP-CORPORATE AFFAIRS", "CFO", "AVP-ADMINISTRATIVE SERVICES", "VP-ADMINISTRATIVE SERVICES"],
      THIRD: ["PAYROLL OFFICE", "HUMAN RESOURCES - SHARED SERVICES", "FINANCE SHARED", "TECHNOLOGY SERVICES OFFICE", "GAO/CIO", "ACADEMIC TECHNOLOGY OFFICE"]
    }
  }
};

const UserReport = () => {
  const [specificJobOrder, setSpecificJobOrder] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [department, setDepartment] = useState("");
  const [building, setBuilding] = useState("");
  const [campus, setCampus] = useState("");
  const [jobOrders, setJobOrders] = useState([]);
  const [userName, setUserName] = useState("");
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [floor, setFloor] = useState("");
  const [reqOffice, setReqOffice] = useState("");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes] = await Promise.all([
          axios.get("/api/profile", { withCredentials: true }),
          axios.get("/api/history", { withCredentials: true })
        ]);
        setUserName(`${profileRes.data.firstName} ${profileRes.data.lastName}`);
        setJobOrders(ordersRes.data.requests || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleCampusChange = useCallback((e) => {
    const selectedCampus = e.target.value;
    setCampus(selectedCampus);
    setBuilding("");
    setFloors([]);
    setReqOffice("");
    setBuildings(Object.keys(data[selectedCampus] || {}));
  }, []);

  const handleBuildingChange = useCallback((e) => {
    const selectedBuilding = e.target.value;
    setBuilding(selectedBuilding);
    setFloors(Object.keys(data[campus][selectedBuilding] || []));
    setReqOffice("");
  }, [campus]);

  const handleFloorChange = useCallback((e) => {
    const selectedFloor = e.target.value;
    setFloor(selectedFloor);
    setReqOffice(data[campus][building][selectedFloor]?.[0] || "");
  }, [campus, building]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/history", {
        params: {
          specificJobOrder,
          status,
          startDate: startDate ? startDate.toISODate() : undefined,
          endDate: endDate ? endDate.toISODate() : undefined,
          reqOffice,
          building,
          floor,
          campus
        }
      });


      if (!response.data.requests?.length) {
        toast("No results found for the specified filters.", { icon: "⚠️" });
        return;
      }

      const doc = new jsPDF("landscape");
      const logo = await import("../assets/img/NU_shield.png");

      doc.addImage(logo.default, "PNG", 45, 10, 20, 20);
      doc.setFontSize(28).setFont("Helvetica", "bold").setTextColor("#35408e");
      doc.text("National University Job Order Report", 70, 25);

      doc.setFontSize(14).setTextColor("#333");
      doc.text(`Generated by: ${userName || "N/A"}`, 10, 45);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 55);

      doc.setDrawColor(150).line(10, 67, 280, 67);

      doc.autoTable({
        startY: 75,
        head: [["First Name", "Last Name", "Request Office", "Date"]],
        body: response.data.requests.map(req => [
          req.firstName,
          req.lastName,
          req.reqOffice,
          new Date(req.dateOfRequest).toLocaleDateString()
        ]),
        headStyles: { fillColor: "#35408e", textColor: "#fff", fontSize: 12 },
        bodyStyles: { textColor: "#333", fontSize: 10 },
        alternateRowStyles: { fillColor: "#f3f3f3" }
      });

      doc.setFontSize(10).setTextColor("#888");
      doc.text("This report was machine-generated by the National University job order system.", 10, doc.internal.pageSize.height - 10);

      doc.save("job_order_report.pdf");
      toast.success("Report Generated!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("An error occurred while generating the report.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSpecificJobOrder("");
    setStatus("");
    setStartDate(null);
    setEndDate(null);
    setBuilding("");
    setCampus("");
    setFloors([]);
    setReqOffice("");
    setFloor("");
  };

  return (
    <LayoutComponent>
      <div className="flex items-center p-4">
        <Link to="/UserHomePage">
          <Button variant="outlined" color="primary" startIcon={<ArrowBackIcon />}
            sx={{
              padding: "6px 12px", borderRadius: "8px", border: "1px solid #3f51b5", color: "#3f51b5",
              "&:hover": { backgroundColor: "#3f51b5", color: "#fff" }, marginRight: "16px"
            }}>
            Back
          </Button>
        </Link>
      </div>
      <Box component="form" autoComplete="off" sx={{ padding: 2, maxWidth: 800, margin: "auto" }}>
        <Typography variant="h6" gutterBottom sx={{ color: "#35408e", fontWeight: "bold" }}>
          Job Order Report Generation
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Use the filters below to specify criteria for your report. You can filter by campus, building, and floor to view job orders specific to a department or office.
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <LocalizationProvider dateAdapter={AdapterLuxon}>
          <Box sx={{ display: "flex", width: "100%", gap: 1 }}>
            <DesktopDatePicker
              label="Start Date"
              inputFormat="MM/dd/yyyy"
              value={startDate}
              onChange={setStartDate}
              slots={{ textField: TextField }}
              slotProps={{ textField: { fullWidth: true, margin: "dense" } }}
            />
            <DesktopDatePicker
              label="End Date"
              inputFormat="MM/dd/yyyy"
              value={endDate}
              onChange={setEndDate}
              slots={{ textField: TextField }}
              slotProps={{ textField: { fullWidth: true, margin: "dense" } }}
            />
          </Box>
        </LocalizationProvider>

        <FormControl fullWidth margin="dense" variant="outlined">
          <InputLabel id="status-label">Status</InputLabel>
          <Select labelId="status-label" value={status} onChange={(e) => setStatus(e.target.value)}>
            <MenuItem value="ongoing">On Going</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </Select>
        </FormControl>

        <div className="flex justify-between mt-4">
          <Button variant="contained" onClick={handleGenerateReport}
            sx={{ backgroundColor: "#35408e", color: "#fff", "&:hover": { backgroundColor: "#1d2c56" } }}>
            Generate Report
          </Button>
          <Button variant="outlined" onClick={handleResetFilters}
            sx={{ borderColor: "#35408e", color: "#35408e", "&:hover": { backgroundColor: "#35408e", color: "#fff" } }}>
            Reset Filters
          </Button>
        </div>
        <Loader isLoading={isLoading} />
      </Box>
    </LayoutComponent>
  );
};

export default UserReport;