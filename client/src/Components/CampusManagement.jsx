import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Snackbar,
    Alert,
    IconButton,
    Box,
    Collapse,
} from "@mui/material";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Loader from "../hooks/Loader";
import { Link } from "react-router-dom";
import LayoutComponent from "./LayoutComponent";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const CampusManagement = () => {
    const [campuses, setCampuses] = useState([]);
    const [openCampusDialog, setOpenCampusDialog] = useState(false);
    const [openBuildingDialog, setOpenBuildingDialog] = useState(false);
    const [openFloorDialog, setOpenFloorDialog] = useState(false);
    const [openOfficeDialog, setOpenOfficeDialog] = useState(false);
    const [editingCampus, setEditingCampus] = useState(null);
    const [campusName, setCampusName] = useState("");
    const [buildingName, setBuildingName] = useState("");
    const [floorName, setFloorName] = useState("");
    const [officeName, setOfficeName] = useState("");
    const [selectedCampusId, setSelectedCampusId] = useState(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const [selectedFloorId, setSelectedFloorId] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const fetchCampuses = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/campuses");
            setCampuses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching campuses:", error);
            setSnackbar({
                open: true,
                message: "Failed to load campuses",
                severity: "error",
            });
            setCampuses([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampuses();
    }, []);

    const handleOpenCampusDialog = (campus = null) => {
        setEditingCampus(campus);
        setCampusName(campus ? campus.name : "");
        setOpenCampusDialog(true);
    };

    const handleOpenBuildingDialog = (campusId) => {
        setSelectedCampusId(campusId);
        setBuildingName("");
        setOpenBuildingDialog(true);
    };

    const handleOpenFloorDialog = (buildingId) => {
        const campus = campuses.find((c) =>
            c.buildings.some((b) => b._id === buildingId)
        );
        if (campus) {
            setSelectedCampusId(campus._id);
            setSelectedBuildingId(buildingId);
            setFloorName("");
            setOpenFloorDialog(true);
        } else {
            console.error("Building or Campus not found for ID:", buildingId);
        }
    };

    const handleOpenOfficeDialog = (floorId) => {
        const campus = campuses.find((c) =>
            c.buildings.some((b) => b.floors.some((f) => f._id === floorId))
        );
        if (campus) {
            const building = campus.buildings.find((b) =>
                b.floors.some((f) => f._id === floorId)
            );
            if (building) {
                setSelectedCampusId(campus._id);
                setSelectedBuildingId(building._id);
                setSelectedFloorId(floorId);
                setOfficeName("");
                setOpenOfficeDialog(true);
            } else {
                console.error("Building not found for floor ID:", floorId);
            }
        } else {
            console.error("Campus not found for floor ID:", floorId);
        }
    };

    const handleCloseDialog = () => {
        setOpenCampusDialog(false);
        setOpenBuildingDialog(false);
        setOpenFloorDialog(false);
        setOpenOfficeDialog(false);
        setEditingCampus(null);
        setSelectedCampusId(null);
        setSelectedBuildingId(null);
        setSelectedFloorId(null);
        setCampusName("");
        setBuildingName("");
        setFloorName("");
        setOfficeName("");
    };

    const handleCampusSubmit = async (e) => {
        e.preventDefault();
        if (!campusName) {
            setSnackbar({
                open: true,
                message: "Campus name is required",
                severity: "warning",
            });
            return;
        }
        try {
            if (editingCampus) {
                await axios.put(`/api/campuses/${editingCampus._id}`, {
                    name: campusName,
                });
            } else {
                await axios.post("/api/campuses", { name: campusName });
            }
            fetchCampuses();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving campus:", error);
            setSnackbar({
                open: true,
                message: "Failed to save campus",
                severity: "error",
            });
        }
    };

    const handleBuildingSubmit = async (e) => {
        e.preventDefault();
        if (!buildingName) {
            setSnackbar({
                open: true,
                message: "Building name is required",
                severity: "warning",
            });
            return;
        }
        try {
            setIsLoading(true);
            await axios.post(`/api/campuses/${selectedCampusId}/buildings`, {
                name: buildingName,
            });
            fetchCampuses();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving building:", error);
            setSnackbar({
                open: true,
                message: "Failed to save building",
                severity: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFloorSubmit = async (e) => {
        e.preventDefault();
        if (!floorName) {
            setSnackbar({
                open: true,
                message: "Floor number is required",
                severity: "warning",
            });
            return;
        }
        try {
            setIsLoading(true);
            await axios.post(
                `/api/campuses/${selectedCampusId}/buildings/${selectedBuildingId}/floors`,
                { number: floorName }
            );
            fetchCampuses();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving floor:", error);
            setSnackbar({
                open: true,
                message: "Failed to save floor",
                severity: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOfficeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCampusId || !selectedBuildingId || !selectedFloorId) {
            console.error("Missing IDs:", {
                selectedCampusId,
                selectedBuildingId,
                selectedFloorId,
            });
            alert("Unable to add office: Campus, Building, or Floor ID is missing.");
            return;
        }
        try {
            setIsLoading(true);
            await axios.post(
                `/api/campuses/${selectedCampusId}/buildings/${selectedBuildingId}/floors/${selectedFloorId}/offices`,
                { name: officeName }
            );
            fetchCampuses();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving office:", error);
            alert("Failed to save office. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteCampus = async (campusId) => {
        if (window.confirm("Are you sure you want to delete this campus?")) {
            try {
                setIsLoading(true);
                await axios.delete(`/api/campuses/${campusId}`);
                fetchCampuses();
            } catch (error) {
                console.error("Error deleting campus:", error);
                setSnackbar({
                    open: true,
                    message: "Failed to delete campus",
                    severity: "error",
                });
            } finally {
                setIsLoading(false);
            }
        }
    };

    const toggleExpandRow = (campusId) => {
        setExpandedRow(expandedRow === campusId ? null : campusId);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ open: false, message: "", severity: "success" });
    };

    return (
        <LayoutComponent>
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Link to="/SuperAdminDashboard">
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            sx={{ mr: 2 }}
                        >
                            Back
                        </Button>
                    </Link>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                        Campus Management
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenCampusDialog()}
                    sx={{ mb: 3 }}
                >
                    Add Campus
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                                    Name
                                </TableCell>
                                <TableCell sx={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {campuses.map((campus) => (
                                <React.Fragment key={campus._id}>
                                    <TableRow hover>
                                        <TableCell sx={{ fontSize: "1rem", fontWeight: "medium" }}>
                                            {campus.name}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() => handleOpenCampusDialog(campus)}
                                                sx={{ mr: 1, fontSize: "0.9rem" }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => handleOpenBuildingDialog(campus._id)}
                                                sx={{ mr: 1, fontSize: "0.9rem" }}
                                            >
                                                Add Building
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteCampus(campus._id)}
                                                color="error"
                                                sx={{ mr: 1, fontSize: "0.9rem" }}
                                            >
                                                Delete
                                            </Button>
                                            <IconButton
                                                onClick={() => toggleExpandRow(campus._id)}
                                                size="small"
                                            >
                                                {expandedRow === campus._id ? (
                                                    <ExpandLessIcon />
                                                ) : (
                                                    <ExpandMoreIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={2} sx={{ p: 0 }}>
                                            <Collapse in={expandedRow === campus._id}>
                                                <Box sx={{ p: 3, backgroundColor: "#f9fafb" }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{ mb: 3, fontWeight: "bold", fontSize: "1.25rem", color: "#374151" }}
                                                    >
                                                        Buildings
                                                    </Typography>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "#374151" }}>
                                                                    Name
                                                                </TableCell>
                                                                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "#374151" }}>
                                                                    Floors
                                                                </TableCell>
                                                                <TableCell sx={{ fontSize: "1rem", fontWeight: "bold", color: "#374151" }}>
                                                                    Actions
                                                                </TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {campus.buildings?.map((building) => (
                                                                <TableRow key={building._id} hover>
                                                                    <TableCell
                                                                        sx={{ fontSize: "0.95rem", fontWeight: "medium", color: "#374151" }}
                                                                    >
                                                                        {building.name}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {building.floors?.map((floor) => (
                                                                            <Box key={floor._id} sx={{ mb: 3, p: 2, backgroundColor: "#ffffff", borderRadius: "8px" }}>
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    sx={{ fontSize: "0.95rem", fontWeight: "medium", color: "#374151", mb: 1 }}
                                                                                >
                                                                                    Floor: {floor.number}
                                                                                </Typography>
                                                                                <Button
                                                                                    onClick={() => handleOpenOfficeDialog(floor._id)}
                                                                                    size="small"
                                                                                    sx={{ mr: 1, fontSize: "0.85rem", textTransform: "none", backgroundColor: "#3b82f6", color: "#ffffff", "&:hover": { backgroundColor: "#2563eb" } }}
                                                                                >
                                                                                    Add Office
                                                                                </Button>
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    sx={{ fontSize: "0.95rem", fontWeight: "medium", color: "#374151", mt: 2 }}
                                                                                >
                                                                                    Offices:
                                                                                </Typography>
                                                                                {floor.offices && floor.offices.length > 0 ? (
                                                                                    <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                                                                                        {floor.offices.map((office) => (
                                                                                            <li
                                                                                                key={office._id}
                                                                                                style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "8px" }}
                                                                                            >
                                                                                                {office.name}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ul>
                                                                                ) : (
                                                                                    <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
                                                                                        No offices available.
                                                                                    </span>
                                                                                )}
                                                                            </Box>
                                                                        ))}
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Button
                                                                            onClick={() => handleOpenFloorDialog(building._id)}
                                                                            size="small"
                                                                            sx={{ fontSize: "0.85rem", textTransform: "none", backgroundColor: "#10b981", color: "#ffffff", "&:hover": { backgroundColor: "#059669" } }}
                                                                        >
                                                                            Add Floor
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {/* Dialogs */}
                <Dialog open={openCampusDialog} onClose={handleCloseDialog}>
                    <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        {editingCampus ? "Edit Campus" : "Add Campus"}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Campus Name"
                            value={campusName}
                            onChange={(e) => setCampusName(e.target.value)}
                            fullWidth
                            sx={{ mt: 2, fontSize: "1rem" }}
                            InputProps={{ style: { fontSize: "1rem" } }}
                            InputLabelProps={{ style: { fontSize: "1rem" } }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleCampusSubmit} color="primary">
                            {editingCampus ? "Update" : "Save"}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openBuildingDialog} onClose={handleCloseDialog}>
                    <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        Add Building
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Building Name"
                            value={buildingName}
                            onChange={(e) => setBuildingName(e.target.value)}
                            fullWidth
                            sx={{ mt: 2, fontSize: "1rem" }}
                            InputProps={{ style: { fontSize: "1rem" } }}
                            InputLabelProps={{ style: { fontSize: "1rem" } }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleBuildingSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openFloorDialog} onClose={handleCloseDialog}>
                    <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        Add Floor
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Floor Number"
                            value={floorName}
                            onChange={(e) => setFloorName(e.target.value)}
                            fullWidth
                            sx={{ mt: 2, fontSize: "1rem" }}
                            InputProps={{ style: { fontSize: "1rem" } }}
                            InputLabelProps={{ style: { fontSize: "1rem" } }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleFloorSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openOfficeDialog} onClose={handleCloseDialog}>
                    <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                        Add Office
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Office Name"
                            value={officeName}
                            onChange={(e) => setOfficeName(e.target.value)}
                            fullWidth
                            sx={{ mt: 2, fontSize: "1rem" }}
                            InputProps={{ style: { fontSize: "1rem" } }}
                            InputLabelProps={{ style: { fontSize: "1rem" } }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleOfficeSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: "100%", fontSize: "1rem" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
                <Loader isLoading={isLoading} />
            </Box>
        </LayoutComponent>
    );
};

export default CampusManagement;