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
} from "@mui/material";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import the back arrow icon
import Loader from "../hooks/Loader";
import { Link } from "react-router-dom";
import LayoutComponent from "./LayoutComponent";

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
        severity: "",
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
        // Find the building that contains this floor
        const campus = campuses.find((c) =>
            c.buildings.some((b) => b.floors.some((f) => f._id === floorId))
        );

        if (campus) {
            // Find the specific building that contains the floor
            const building = campus.buildings.find((b) =>
                b.floors.some((f) => f._id === floorId)
            );

            if (building) {
                setSelectedCampusId(campus._id); // Set the campus ID
                setSelectedBuildingId(building._id); // Set the building ID
                setSelectedFloorId(floorId); // Set the floor ID
                setOfficeName(""); // Clear the office name input
                setOpenOfficeDialog(true); // Open the dialog
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

        // Check if all IDs are set correctly
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
            console.log("Creating office with IDs:", {
                selectedCampusId,
                selectedBuildingId,
                selectedFloorId,
            });

            // Assuming the API expects this structure
            const response = await axios.post(
                `/api/campuses/${selectedCampusId}/buildings/${selectedBuildingId}/floors/${selectedFloorId}/offices`,
                { name: officeName }
            );

            if (response.status === 200 || response.status === 201) {
                // Successful response
                fetchCampuses();
                handleCloseDialog();
            } else {
                console.error("Unexpected response:", response);
                alert("Failed to save office. Please try again.");
            }
        } catch (error) {
            console.error(
                "Error saving office:",
                error.response || error.message || error
            );
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
        setSnackbar({ open: false, message: "", severity: "" });
    };

    return (
        <LayoutComponent>
            <div className="flex items-center p-4">
                {" "}
                {/* Align buttons horizontally */}
                {/* Back Button */}
                <Link to="/SuperAdminDashboard" className="text-decoration-none">
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
            <div className=" w-full p-4">
                <Typography variant="h4" component="h1" gutterBottom>
                    Campus Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenCampusDialog()}
                >
                    Add Campus
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {campuses.map((campus) => (
                                <React.Fragment key={campus._id}>
                                    <TableRow>
                                        <TableCell>{campus.name}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleOpenCampusDialog(campus)}>
                                                Edit
                                            </Button>
                                            <Button
                                                onClick={() => handleOpenBuildingDialog(campus._id)}
                                            >
                                                Add Building
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteCampus(campus._id)}
                                                color="secondary"
                                            >
                                                Delete
                                            </Button>
                                            <Button onClick={() => toggleExpandRow(campus._id)}>
                                                {expandedRow === campus._id ? "Hide" : "Show"} Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    {expandedRow === campus._id && (
                                        <TableRow>
                                            <TableCell colSpan={3}>
                                                <Typography variant="h6">Buildings</Typography>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell>Name</TableCell>
                                                            <TableCell>Floors</TableCell>
                                                            <TableCell>Actions</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {campus.buildings?.map((building) => (
                                                            <TableRow key={building._id}>
                                                                <TableCell>{building.name}</TableCell>
                                                                <TableCell>
                                                                    {building.floors?.map((floor) => (
                                                                        <div key={floor._id}>
                                                                            <Typography variant="body2">
                                                                                Floor: {floor.number}
                                                                            </Typography>
                                                                            <Button
                                                                                onClick={() =>
                                                                                    handleOpenOfficeDialog(floor._id)
                                                                                }
                                                                            >
                                                                                Add Office
                                                                            </Button>
                                                                            <Typography variant="body2">
                                                                                Offices:
                                                                            </Typography>
                                                                            {floor.offices &&
                                                                                floor.offices.length > 0 ? (
                                                                                <ul>
                                                                                    {floor.offices.map((office) => (
                                                                                        <li key={office._id}>
                                                                                            {office.name}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            ) : (
                                                                                <span>No offices available.</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        onClick={() =>
                                                                            handleOpenFloorDialog(building._id)
                                                                        }
                                                                    >
                                                                        Add Floor
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Campus Dialog */}
                <Dialog open={openCampusDialog} onClose={handleCloseDialog}>
                    <DialogTitle>
                        {editingCampus ? "Edit Campus" : "Add Campus"}
                    </DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Campus Name"
                            value={campusName}
                            onChange={(e) => setCampusName(e.target.value)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleCampusSubmit} color="primary">
                            {editingCampus ? "Update" : "Save"}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Building Dialog */}
                <Dialog open={openBuildingDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Add Building</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Building Name"
                            value={buildingName}
                            onChange={(e) => setBuildingName(e.target.value)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleBuildingSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Floor Dialog */}
                <Dialog open={openFloorDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Add Floor</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Floor Number"
                            value={floorName}
                            onChange={(e) => setFloorName(e.target.value)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleFloorSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Office Dialog */}
                <Dialog open={openOfficeDialog} onClose={handleCloseDialog}>
                    <DialogTitle>Add Office</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Office Name"
                            value={officeName}
                            onChange={(e) => setOfficeName(e.target.value)}
                            fullWidth
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleOfficeSubmit} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for feedback */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    message={snackbar.message}
                    severity={snackbar.severity}
                />
            </div>
        </LayoutComponent>
    );
};

export default CampusManagement;
