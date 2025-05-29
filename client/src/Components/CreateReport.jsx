import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterLuxon } from "@mui/x-date-pickers/AdapterLuxon";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Typography, Divider } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { toast } from "react-hot-toast";
import Loader from "../hooks/Loader";

const CreateReport = () => {
  const [specificJobOrder, setSpecificJobOrder] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [jobOrders, setJobOrders] = useState([]);
  const [userName, setUserName] = useState("");
  const [isLoading, setLoading] = useState(false);

  // Dynamic location data
  const [campuses, setCampuses] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [offices, setOffices] = useState([]);
  const [campus, setCampus] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [reqOffice, setReqOffice] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, ordersRes, campusesRes] = await Promise.all([
          axios.get("/api/profile", { withCredentials: true }),
          axios.get("/api/report", { withCredentials: true }),
          axios.get("/api/campuses", { withCredentials: true })
        ]);
        setUserName(`${profileRes.data.firstName} ${profileRes.data.lastName}`);
        setJobOrders(ordersRes.data.requests || []);
        setCampuses(campusesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCampusChange = useCallback((e) => {
    const selectedCampusName = e.target.value;
    const selectedCampus = campuses.find(c => c.name === selectedCampusName);
    setCampus(selectedCampusName);
    setBuilding("");
    setFloor("");
    setReqOffice("");
    setBuildings(selectedCampus?.buildings || []);
    setFloors([]);
    setOffices([]);
  }, [campuses]);

  const handleBuildingChange = useCallback((e) => {
    const selectedBuildingName = e.target.value;
    setBuilding(selectedBuildingName);
    setFloor("");
    setReqOffice("");
    const selectedCampusData = campuses.find(c => c.name === campus);
    if (selectedCampusData) {
      const selectedBuildingData = selectedCampusData.buildings.find(b => b.name === selectedBuildingName);
      setFloors(selectedBuildingData?.floors || []);
      setOffices([]);
    }
  }, [campus, campuses]);

  const handleFloorChange = useCallback((e) => {
    const selectedFloorName = e.target.value;
    setFloor(selectedFloorName);
    setReqOffice("");
    const selectedCampusData = campuses.find(c => c.name === campus);
    if (selectedCampusData) {
      const selectedBuildingData = selectedCampusData.buildings.find(b => b.name === building);
      if (selectedBuildingData) {
        const selectedFloor = selectedBuildingData.floors.find(f => f.number === selectedFloorName);
        setOffices(selectedFloor?.offices || []);
      }
    }
  }, [campus, building, campuses]);

  const handleReqOfficeChange = useCallback((e) => {
    setReqOffice(e.target.value);
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);

      // Normalize location data
      const locationFilters = {
        campus: campus || undefined,
        building: building || undefined,
        floor: floor || undefined,
        reqOffice: reqOffice || undefined
      };

      console.log("Sending normalized filters:", {
        ...locationFilters,
        startDate: startDate?.toISODate(),
        endDate: endDate?.toISODate(),
        status: status || undefined,
        specificJobOrder: specificJobOrder || undefined
      });

      const response = await axios.get("/api/report", {
        params: {
          specificJobOrder: specificJobOrder || undefined,
          status: status || undefined,
          startDate: startDate?.toISODate(),
          endDate: endDate?.toISODate(),
          ...locationFilters
        },
        paramsSerializer: params => {
          return Object.entries(params)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        },
        withCredentials: true
      });

      const requests = response.data.requests;
      console.log("Received", requests?.length, "matching records");

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
        body: requests.map((req) => [req.firstName, req.lastName, req.reqOffice, new Date(req.dateOfRequest).toLocaleDateString()]),
        headStyles: { fillColor: "#35408e", textColor: "#fff", fontSize: 12 },
        bodyStyles: { textColor: "#333", fontSize: 10 },
        alternateRowStyles: { fillColor: "#f3f3f3" }
      });

      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(10);
      doc.setTextColor("#888");
      doc.text("This report was machine-generated by the National University job order system.", 10, pageHeight - 10);

      doc.save("job_order_report.pdf");
      toast.success("Report Generated!");
    } catch (error) {
      console.error("Report generation error:", {
        response: error.response?.data,
        config: error.config,
        error: error.message
      });
      toast.error(error.response?.data?.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSpecificJobOrder("");
    setStatus("");
    setStartDate(null);
    setEndDate(null);
    setCampus("");
    setBuilding("");
    setFloor("");
    setReqOffice("");
    setBuildings([]);
    setFloors([]);
    setOffices([]);
  };

  return (
    <Box component="form" autoComplete="off" sx={{ padding: 2, maxWidth: 800, margin: "auto" }}>
      <Typography variant="h6" gutterBottom sx={{ color: "#35408e", fontWeight: "bold" }}>
        Job Order Report Generation
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Use the filters below to specify criteria for your report. You can filter by campus, building, and floor to view job orders specific to a department or office.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* Campus Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="campus-label">Campus</InputLabel>
        <Select labelId="campus-label" value={campus} onChange={handleCampusChange}>
          {campuses.map((campusItem) => (
            <MenuItem key={campusItem.name} value={campusItem.name}>{campusItem.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Building Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="building-label">Building</InputLabel>
        <Select labelId="building-label" value={building} onChange={handleBuildingChange} disabled={!campus}>
          {buildings.map((buildingItem) => (
            <MenuItem key={buildingItem.name} value={buildingItem.name}>{buildingItem.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Floor Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="floor-label">Floor</InputLabel>
        <Select labelId="floor-label" value={floor} onChange={handleFloorChange} disabled={!building}>
          {floors.map((floorItem) => (
            <MenuItem key={floorItem.number} value={floorItem.number}>{floorItem.number}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Requesting Office Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="reqOffice-label">Requesting Office</InputLabel>
        <Select labelId="reqOffice-label" value={reqOffice} onChange={handleReqOfficeChange} disabled={!floor}>
          {offices.map((office) => (
            <MenuItem key={office.name} value={office.name}>{office.name}</MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Specific Job Order Selection */}
      <FormControl fullWidth margin="dense" variant="outlined" className="mt-6">
        <InputLabel id="specificJobOrder-label">Specific Job Order</InputLabel>
        <Select labelId="specificJobOrder-label" value={specificJobOrder} onChange={(e) => setSpecificJobOrder(e.target.value)}>
          {jobOrders && jobOrders.length > 0 ? (
            jobOrders.map((jobOrder) => (
              <MenuItem key={jobOrder._id} value={jobOrder._id}>{jobOrder.jobDesc}</MenuItem>
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

      {/* Status Selection */}
      <FormControl fullWidth margin="dense" variant="outlined">
        <InputLabel id="status-label">Status</InputLabel>
        <Select labelId="status-label" value={status} onChange={(e) => setStatus(e.target.value)}>
          <MenuItem value="ongoing">On Going</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </FormControl>

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        <Button variant="contained" onClick={handleGenerateReport} sx={{ backgroundColor: "#35408e", color: "#fff", "&:hover": { backgroundColor: "#1d2c56" } }}>
          Generate Report
        </Button>
        <Button variant="outlined" onClick={handleResetFilters} sx={{ borderColor: "#35408e", color: "#35408e", "&:hover": { backgroundColor: "#35408e", color: "#fff" } }}>
          Reset Filters
        </Button>
      </div>
      <Loader isLoading={isLoading} />
    </Box>
  );
};
export default CreateReport;