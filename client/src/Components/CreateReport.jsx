import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-hot-toast";
import Loader from "../hooks/Loader";

const data = {
  "National University Manila": {
    "MAIN BUILDING": {
      GROUND: [
        "HEALTH SERVICES",
        "LOGISTICS/PURCHASING",
        "NATIONAL UNIVERSITY ALUMNI FOUNDATION INC",
        "MOTORPOOL",
        "ASSET MANAGEMENT OFFICE",
        "PHYSICAL FACILITIES MANAGEMENT OFFICE",
        "BULLDOGS EXCHANGE",
      ],
      SECOND: ["TREASURY OFFICE", "ADMISSIONS", "REGISTRAR"],
      THIRD: ["COLLEGE OF ALLIED HEALTH"],
      FOURTH: [
        "RESEARCH AND DEVELOPMENT",
        "IT SYSTEMS OFFICE",
        "FACULTY AND ADMINISTRATION OFFICE",
        "QMO MANILA",
        "SAFETY OFFICE",
        "AVP-ACADEMIC SERVICES",
        "AVP-ADMINISTRATION",
        "VP-OPERATIONS",
      ],
      FIFTH: [
        "ACADEME INTERNSHIP AND PLACEMENT OFFICE",
        "DATA PRIVACY OFFICE",
        "EDUCATION TECHNOLOGY",
        "CCIT",
      ],
      SIXTH: ["ROOMS"],
      SEVENTH: ["COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT"],
      EIGHTH: ["ATHLETICS OFFICE"],
    },
    JMB: {
      GROUND: ["SECURITY OFFICE"],
      SECOND: ["ROOMS"],
      THIRD: ["DISCIPLINE OFFICE"],
      FOURTH: ["ROOMS"],
      FIFTH: ["LEARNING RESOURCE CENTER"],
    },
    ANNEX: {
      GROUND: ["ALUMNI/MARKETING AND COMMUNICATIONS OFFICE - MANILA"],
      SECOND: ["LEARNING RESOURCE CENTER"],
      THIRD: [
        "COMEX/NSTP",
        "NUCSG OFFICE",
        "STUDENT DEVELOPMENT AND ACTIVITIES OFFICE",
        "ATHLETE ACADEMIC DEVELOPMENT OFFICE",
        "COLLEGE OF ENGINEERING",
      ],
      FOURTH: [
        "GENERAL ACCOUNTING AND BUDGETING - MANILA",
        "HUMAN RESOURCES - MANILA",
        "GUIDANCE SERVICES OFFICE",
        "CENTER FOR INNOVATIVE AND SUSTAINABLE DEVELOPMENT",
        "INTERNATIONAL STUDENT SERVICES OFFICE",
      ],
      FIFTH: ["ROOMS"],
      SIXTH: ["ROOMS"],
      SEVENTH: ["CEAS"],
      EIGHTH: ["ROOMS"],
      NINTH: ["ROOMS"],
      TENTH: ["ROOMS"],
      ELEVENTH: ["ROOMS"],
      TWELFTH: ["GYM"],
    },
    "ANNEX II": {
      GROUND: [
        "FACULTY OFFICE",
        "HEALTH SERVICES",
        "GYM",
        "STUDENT SERVICES",
        "CANTEEN",
      ],
      SECOND: ["ROOMS"],
      THIRD: ["ROOMS"],
      FOURTH: ["LEARNING RESOURCE CENTER"],
    },
    OSIAS: {
      GROUND: [
        "CORPORATE MARKETING AND COMMUNICATION OFFICE",
        "ALUMNI OFFICE",
        "LEGACY OFFICE",
        "SAFETY AND SECURITY",
      ],
      SECOND: [
        "QUALITY MANAGEMENT OFFICE",
        "CONSTRUCTION AND FACILITIES MANAGEMENT OFFICE",
        "OFFICE OF THE PRESIDENT",
        "BUSINESS DEVELOPMENT AND LINKAGES",
        "VP-CORPORATE AFFAIRS",
        "CFO",
        "AVP-ADMINISTRATIVE SERVICES",
        "VP-ADMINISTRATIVE SERVICES",
      ],
      THIRD: [
        "PAYROLL OFFICE",
        "HUMAN RESOURCES - SHARED SERVICES",
        "FINANCE SHARED",
        "TECHNOLOGY SERVICES OFFICE",
        "GAO/CIO",
        "ACADEMIC TECHNOLOGY OFFICE",
      ],
    },
  },
};

const CreateReport = () => {
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
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("/api/profile", {
          withCredentials: true,
        });
        const userData = response.data;
        setUserName(`${userData.firstName} ${userData.lastName}`);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchAllJobOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/report", {
          withCredentials: true,
        });
        setJobOrders(response.data.requests || []);
      } catch (error) {
        console.error("Error fetching job orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllJobOrders();
  }, []);

  const handleCampusChange = useCallback((e) => {
    const selectedCampus = e.target.value;
    setCampus(selectedCampus);
    setBuilding("");
    setFloors([]);
    setReqOffice("");
    setBuildings(Object.keys(data[selectedCampus] || {}));
  }, []);

  const handleBuildingChange = useCallback(
    (e) => {
      const selectedBuilding = e.target.value;
      setBuilding(selectedBuilding);
      const availableFloors = Object.keys(data[campus][selectedBuilding] || {});
      setFloors(availableFloors);
      setReqOffice("");
    },
    [campus]
  );

  const handleFloorChange = useCallback(
    (e) => {
      const selectedFloor = e.target.value;
      setFloor(selectedFloor);
      const offices = data[campus][building][selectedFloor] || [];
      setReqOffice(offices.length > 0 ? offices[0] : "");
    },
    [campus, building]
  );

  const handleReqOfficeChange = useCallback((e) => {
    setReqOffice(e.target.value);
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const dateRange =
        startDate && endDate
          ? `${startDate.toISODate()}:${endDate.toISODate()}`
          : "";

      const response = await axios.get("/api/report", {
        params: {
          specificJobOrder,
          status,
          dateRange,
          reqOffice,
          building,
          floor,
          campus,
        },
      });

      const requests = response.data.requests;
      if (!requests || requests.length === 0) {
        toast("No results found for the specified filters.", { icon: "⚠️" });
        return;
      }

      const doc = new jsPDF("landscape");
      const logo = await import("../assets/img/NU_shield.png");

      doc.addImage(logo.default, "PNG", 45, 10, 20, 20);
      doc.setFontSize(28);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor("#35408e");
      doc.text("National University Job Order Report", 70, 25);

      doc.setFontSize(14);
      doc.setTextColor("#333");
      doc.text(`Generated by: ${userName || "N/A"}`, 10, 45);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 55);

      doc.setDrawColor(150);
      doc.line(10, 67, 280, 67);

      doc.autoTable({
        startY: 75,
        head: [["First Name", "Last Name", "Request Office", "Date"]],
        body: requests.map((req) => [
          req.firstName,
          req.lastName,
          req.reqOffice,
          new Date(req.dateOfRequest).toLocaleDateString(),
        ]),
        headStyles: { fillColor: "#35408e", textColor: "#fff", fontSize: 12 },
        bodyStyles: { textColor: "#333", fontSize: 10 },
        alternateRowStyles: { fillColor: "#f3f3f3" },
      });

      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor("#888");
      doc.text(
        "This report was machine-generated by the National University job order system.",
        10,
        pageHeight - 10
      );

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
    <Box
      component="form"
      autoComplete="off"
      sx={{ padding: 2, maxWidth: 800, margin: "auto" }}
    >
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#35408e", fontWeight: "bold" }}
      >
        Job Order Report Generation
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Use the filters below to specify criteria for your report. You can
        filter by campus, building, and floor to view job orders specific to a
        department or office. If no specific criteria are selected, all
        available records will be shown.
      </Typography>
      <Divider sx={{ mb: 3 }} />
      {/* Campus Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="campus-label">Campus</InputLabel>
        <Select
          labelId="campus-label"
          value={campus}
          onChange={handleCampusChange}
        >
          {Object.keys(data).map((campusName) => (
            <MenuItem key={campusName} value={campusName}>
              {campusName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Building Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="building-label">Building</InputLabel>
        <Select
          labelId="building-label"
          value={building}
          onChange={handleBuildingChange}
          disabled={!campus}
        >
          {buildings.map((buildingName) => (
            <MenuItem key={buildingName} value={buildingName}>
              {buildingName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Floor Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="floor-label">Floor</InputLabel>
        <Select
          labelId="floor-label"
          value={floor}
          onChange={handleFloorChange}
          disabled={!building}
        >
          {floors.map((floorName) => (
            <MenuItem key={floorName} value={floorName}>
              {floorName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Requesting Office Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="reqOffice-label">Requesting Office</InputLabel>
        <Select
          labelId="reqOffice-label"
          value={reqOffice}
          onChange={handleReqOfficeChange}
          disabled={!floor}
        >
          {data[campus]?.[building]?.[floor]?.map((office) => (
            <MenuItem key={office} value={office}>
              {office}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Specific Job Order Selection */}
      <FormControl fullWidth margin="dense" variant="outlined" className="mt-6">
        <InputLabel id="specificJobOrder-label">Specific Job Order</InputLabel>
        <Select
          labelId="specificJobOrder-label"
          value={specificJobOrder}
          onChange={(e) => setSpecificJobOrder(e.target.value)}
        >
          {jobOrders && jobOrders.length > 0 ? (
            jobOrders.map((jobOrder) => (
              <MenuItem key={jobOrder._id} value={jobOrder._id}>
                {jobOrder.jobDesc}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No Job Orders Available</MenuItem>
          )}
        </Select>
      </FormControl>

      {/* Start and End Date Pickers */}
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <Box sx={{ display: "flex", width: "100%", gap: 1 }}>
          <DesktopDatePicker
            label="Start Date"
            inputFormat="MM/dd/yyyy"
            value={startDate}
            onChange={setStartDate}
            slots={{ textField: TextField }} // Use slots for the TextField
            slotProps={{
              textField: {
                fullWidth: true,
                margin: "dense",
              },
            }}
          />
          <DesktopDatePicker
            label="End Date"
            inputFormat="MM/dd/yyyy"
            value={endDate}
            onChange={setEndDate}
            slots={{ textField: TextField }} // Use slots for the TextField
            slotProps={{
              textField: {
                fullWidth: true,
                margin: "dense",
              },
            }}
          />
        </Box>
      </LocalizationProvider>

      {/* Status Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="status-label">Status</InputLabel>
        <Select
          labelId="status-label"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="ongoing">On Going</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
        </Select>
      </FormControl>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <Button
          variant="contained"
          onClick={handleGenerateReport}
          sx={{
            backgroundColor: "#35408e",
            color: "#fff",
            "&:hover": { backgroundColor: "#1d2c56" },
          }}
        >
          Generate Report
        </Button>
        <Button
          variant="outlined"
          onClick={handleResetFilters}
          sx={{
            borderColor: "#35408e",
            color: "#35408e",
            "&:hover": { backgroundColor: "#35408e", color: "#fff" },
          }}
        >
          Reset Filters
        </Button>
      </div>
      <Loader isLoading={isLoading} />
    </Box>
  );
};
export default CreateReport;
