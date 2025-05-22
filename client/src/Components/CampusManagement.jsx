import React, { useEffect, useState } from "react";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography,
    Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    IconButton, Box, Collapse, Select, MenuItem
} from "@mui/material";
import axios from "axios";
import Loader from "../hooks/Loader";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { toast } from "react-hot-toast"; // Import react-hot-toast

const CampusManagement = () => {
    const [campuses, setCampuses] = useState([]);
    const [openCampusDialog, setOpenCampusDialog] = useState(false);
    const [openBuildingDialog, setOpenBuildingDialog] = useState(false);
    const [openFloorDialog, setOpenFloorDialog] = useState(false);
    const [openOfficeDialog, setOpenOfficeDialog] = useState(false);
    const [openConfirmationModal, setOpenConfirmationModal] = useState(false); // Confirmation modal state
    const [confirmationAction, setConfirmationAction] = useState(null); // Action to confirm
    const [editingCampus, setEditingCampus] = useState(null);
    const [editingBuilding, setEditingBuilding] = useState(null);
    const [editingFloor, setEditingFloor] = useState(null);
    const [editingOffice, setEditingOffice] = useState(null);
    const [campusName, setCampusName] = useState("");
    const [buildingName, setBuildingName] = useState("");
    const [floorName, setFloorName] = useState("");
    const [officeName, setOfficeName] = useState("");
    const [officePosition, setOfficePosition] = useState("");
    const [selectedCampusId, setSelectedCampusId] = useState(null);
    const [selectedBuildingId, setSelectedBuildingId] = useState(null);
    const [selectedFloorId, setSelectedFloorId] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchCampuses = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get("/api/campuses");
            setCampuses(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error fetching campuses:", error);
            toast.error("Failed to load campuses"); // Use toast for error
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCampuses();
    }, []);

    // Handle opening dialogs
    const handleOpenCampusDialog = (campus = null) => {
        setEditingCampus(campus);
        setCampusName(campus ? campus.name : "");
        setOpenCampusDialog(true);
    };

    const handleOpenBuildingDialog = (campusId, building = null) => {
        setSelectedCampusId(campusId);
        setEditingBuilding(building);
        setBuildingName(building ? building.name : "");
        setOpenBuildingDialog(true);
    };

    const handleOpenFloorDialog = (buildingId, floor = null) => {
        const campus = campuses.find((c) =>
            c.buildings.some((b) => b._id === buildingId)
        );
        if (campus) {
            setSelectedCampusId(campus._id);
            setSelectedBuildingId(buildingId);
            setEditingFloor(floor);
            setFloorName(floor ? floor.number : "");
            setOpenFloorDialog(true);
        } else {
            console.error("Building or Campus not found for ID:", buildingId);
        }
    };

    const handleOpenOfficeDialog = (floorId, office = null) => {
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
                setEditingOffice(office);
                setOfficeName(office ? office.name : "");
                setOfficePosition(office ? office.allowedPositions[0] : "");
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
        setEditingBuilding(null);
        setEditingFloor(null);
        setEditingOffice(null);
        setSelectedCampusId(null);
        setSelectedBuildingId(null);
        setSelectedFloorId(null);
        setCampusName("");
        setBuildingName("");
        setFloorName("");
        setOfficeName("");
        setOfficePosition("");
    };

    // Handle form submissions
    const handleCampusSubmit = async (e) => {
        e.preventDefault();
        if (!campusName) {
            toast.error("Campus name is required"); // Use toast for validation
            return;
        }
        try {
            if (editingCampus) {
                await axios.put(`/api/campuses/${editingCampus._id}`, {
                    name: campusName,
                });
                toast.success("Campus updated successfully"); // Use toast for success
            } else {
                await axios.post("/api/campuses", { name: campusName });
                toast.success("Campus added successfully"); // Use toast for success
            }
            fetchCampuses();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving campus:", error);
            toast.error("Failed to save campus"); // Use toast for error
        }
    };

    const handleBuildingSubmit = async (e) => {
        e.preventDefault();
        if (!buildingName) {
            toast.error("Building name is required"); // Use toast for validation
            return;
        }
        try {
            setIsLoading(true);
            if (editingBuilding) {
                await axios.put(`/api/campuses/${selectedCampusId}/buildings/${editingBuilding._id}`, {
                    name: buildingName,
                });
                toast.success("Building updated successfully"); // Use toast for success
            } else {
                await axios.post(`/api/campuses/${selectedCampusId}/buildings`, {
                    name: buildingName,
                });
                toast.success("Building added successfully"); // Use toast for success
            }
            fetchCampuses();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving building:", error);
            toast.error("Failed to save building"); // Use toast for error
        } finally {
            setIsLoading(false);
        }
    };

    const handleFloorSubmit = async (e) => {
        e.preventDefault();
        if (!floorName) {
            toast.error("Floor number is required"); // Use toast for validation
            return;
        }
        try {
            setIsLoading(true);
            if (editingFloor) {
                await axios.put(
                    `/api/campuses/${selectedCampusId}/buildings/${selectedBuildingId}/floors/${editingFloor._id}`,
                    { number: floorName }
                );
                toast.success("Floor updated successfully"); // Use toast for success
            } else {
                await axios.post(
                    `/api/campuses/${selectedCampusId}/buildings/${selectedBuildingId}/floors`,
                    { number: floorName }
                );
                toast.success("Floor added successfully"); // Use toast for success
            }
            fetchCampuses();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving floor:", error);
            toast.error("Failed to save floor"); // Use toast for error
        } finally {
            setIsLoading(false);
        }
    };

    const handleOfficeSubmit = async (e) => {
        e.preventDefault();
        if (!officeName || !officePosition) {
            toast.error("Office name and position are required"); // Use toast for validation
            return;
        }
        try {
            setIsLoading(true);
            if (editingOffice) {
                await axios.put(
                    `/api/campuses/${selectedCampusId}/buildings/${selectedBuildingId}/floors/${selectedFloorId}/offices/${editingOffice._id}`,
                    { name: officeName, allowedPositions: [officePosition] }
                );
                toast.success("Office updated successfully"); // Use toast for success
            } else {
                await axios.post(
                    `/api/campuses/${selectedCampusId}/buildings/${selectedBuildingId}/floors/${selectedFloorId}/offices`,
                    { name: officeName, allowedPositions: [officePosition] }
                );
                toast.success("Office added successfully"); // Use toast for success
            }
            fetchCampuses();
            handleCloseDialog();
        } catch (error) {
            console.error("Error saving office:", error);
            toast.error("Failed to save office"); // Use toast for error
        } finally {
            setIsLoading(false);
        }
    };

    // Handle delete actions with confirmation modal
    const handleDeleteCampus = (campusId) => {
        setConfirmationAction(() => async () => {
            try {
                setIsLoading(true);
                await axios.delete(`/api/campuses/${campusId}`);
                fetchCampuses();
                toast.success("Campus deleted successfully"); // Use toast for success
            } catch (error) {
                console.error("Error deleting campus:", error);
                toast.error("Failed to delete campus"); // Use toast for error
            } finally {
                setIsLoading(false);
            }
        });
        setOpenConfirmationModal(true);
    };

    const handleDeleteBuilding = (campusId, buildingId) => {
        setConfirmationAction(() => async () => {
            try {
                setIsLoading(true);
                await axios.delete(`/api/campuses/${campusId}/buildings/${buildingId}`);
                fetchCampuses();
                toast.success("Building deleted successfully"); // Use toast for success
            } catch (error) {
                console.error("Error deleting building:", error);
                toast.error("Failed to delete building"); // Use toast for error
            } finally {
                setIsLoading(false);
            }
        });
        setOpenConfirmationModal(true);
    };

    const handleDeleteFloor = (campusId, buildingId, floorId) => {
        setConfirmationAction(() => async () => {
            try {
                setIsLoading(true);
                await axios.delete(`/api/campuses/${campusId}/buildings/${buildingId}/floors/${floorId}`);
                fetchCampuses();
                toast.success("Floor deleted successfully"); // Use toast for success
            } catch (error) {
                console.error("Error deleting floor:", error);
                toast.error("Failed to delete floor"); // Use toast for error
            } finally {
                setIsLoading(false);
            }
        });
        setOpenConfirmationModal(true);
    };

    const handleDeleteOffice = (campusId, buildingId, floorId, officeId) => {
        setConfirmationAction(() => async () => {
            try {
                setIsLoading(true);
                await axios.delete(`/api/campuses/${campusId}/buildings/${buildingId}/floors/${floorId}/offices/${officeId}`);
                fetchCampuses();
                toast.success("Office deleted successfully"); // Use toast for success
            } catch (error) {
                console.error("Error deleting office:", error);
                toast.error("Failed to delete office"); // Use toast for error
            } finally {
                setIsLoading(false);
            }
        });
        setOpenConfirmationModal(true);
    };

    // Confirmation modal handlers
    const handleConfirmAction = async () => {
        if (confirmationAction) {
            await confirmationAction();
        }
        setOpenConfirmationModal(false);
    };

    const handleCloseConfirmationModal = () => {
        setOpenConfirmationModal(false);
    };

    // Toggle expand/collapse for a row
    const toggleExpandRow = (campusId) => {
        setExpandedRow((prevExpandedRow) =>
            prevExpandedRow === campusId ? null : campusId
        );
    };

    // Render
    return (
        <Box sx={{ p: 3 }}>

            {/* Add Campus Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenCampusDialog()}
                sx={{ mb: 3 }}
            >
                Add Campus
            </Button>

            {/* Campuses Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f3f4f6" }}>
                            <TableCell sx={{ fontSize: "1.1rem", fontWeight: "bold", width: "40%" }}>
                                Name
                            </TableCell>
                            <TableCell sx={{ fontSize: "1.1rem", fontWeight: "bold", width: "60%", textAlign: "right" }}>
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {campuses.map((campus) => (
                            <React.Fragment key={campus._id}>
                                <TableRow hover>
                                    <TableCell sx={{ fontSize: "1rem", fontWeight: "medium", color: "#374151" }}>
                                        {campus.name}
                                    </TableCell>
                                    <TableCell sx={{ textAlign: "right" }}>
                                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                            <Button onClick={() => handleOpenCampusDialog(campus)} variant="contained" size="small">
                                                Edit
                                            </Button>
                                            <Button onClick={() => handleOpenBuildingDialog(campus._id)} variant="contained" size="small" color="success">
                                                Add Building
                                            </Button>
                                            <Button onClick={() => handleDeleteCampus(campus._id)} variant="contained" size="small" color="error">
                                                Delete
                                            </Button>
                                            <IconButton onClick={() => toggleExpandRow(campus._id)} size="small">
                                                {expandedRow === campus._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                            </IconButton>
                                        </Box>
                                    </TableCell>
                                </TableRow>

                                {/* Collapsible Area for Buildings */}
                                <TableRow>
                                    <TableCell colSpan={2} sx={{ p: 0 }}>
                                        <Collapse in={expandedRow === campus._id} timeout="auto" unmountOnExit>
                                            <Box sx={{ p: 3, backgroundColor: "#f9fafb", borderRadius: "8px" }}>
                                                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#374151" }}>
                                                    Buildings
                                                </Typography>
                                                <Table size="small">
                                                    <TableHead>
                                                        <TableRow sx={{ backgroundColor: "#e5e7eb" }}>
                                                            <TableCell sx={{ fontSize: "1rem", fontWeight: "bold" }}>Name</TableCell>
                                                            <TableCell sx={{ fontSize: "1rem", fontWeight: "bold" }}>Floors</TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        {campus.buildings?.map((building) => (
                                                            <TableRow key={building._id} hover>
                                                                <TableCell sx={{ fontSize: "1rem", fontWeight: "medium", color: "#374151", p: 2 }}>
                                                                    <Typography variant="body1" sx={{ fontWeight: "bold", color: "#1f2937", mb: 1 }}>
                                                                        {building.name}
                                                                    </Typography>
                                                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                                                        <Button
                                                                            onClick={() => handleOpenFloorDialog(building._id)}
                                                                            variant="contained"
                                                                            size="small"
                                                                            color="success"
                                                                        >
                                                                            Add Floor
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleOpenBuildingDialog(campus._id, building)}
                                                                            variant="contained"
                                                                            size="small"
                                                                        >
                                                                            Edit Building
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => handleDeleteBuilding(campus._id, building._id)}
                                                                            variant="contained"
                                                                            size="small"
                                                                            color="error"
                                                                        >
                                                                            Delete Building
                                                                        </Button>
                                                                    </Box>
                                                                </TableCell>

                                                                <TableCell>
                                                                    {building.floors?.map((floor) => (
                                                                        <Box
                                                                            key={floor._id}
                                                                            sx={{ p: 2, backgroundColor: "#ffffff", borderRadius: 2, mb: 2, boxShadow: 1 }}
                                                                        >
                                                                            <Typography variant="body2" sx={{ fontWeight: "medium", color: "#374151", mb: 1 }}>
                                                                                Floor: {floor.number}
                                                                            </Typography>
                                                                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                                                                                <Button
                                                                                    onClick={() => handleOpenOfficeDialog(floor._id)}
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    color="success"
                                                                                >
                                                                                    Add Office
                                                                                </Button>
                                                                                <Button
                                                                                    onClick={() => handleOpenFloorDialog(building._id, floor)}
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                >
                                                                                    Edit Floor
                                                                                </Button>
                                                                                <Button
                                                                                    onClick={() => handleDeleteFloor(campus._id, building._id, floor._id)}
                                                                                    variant="contained"
                                                                                    size="small"
                                                                                    color="error"
                                                                                >
                                                                                    Delete Floor
                                                                                </Button>
                                                                            </Box>
                                                                            <Typography variant="body2" sx={{ mt: 2, fontWeight: "medium", color: "#374151" }}>
                                                                                Offices:
                                                                            </Typography>
                                                                            {floor.offices && floor.offices.length > 0 ? (
                                                                                <ul style={{ listStyle: "none", paddingLeft: 0 }}>
                                                                                    {floor.offices.map((office) => (
                                                                                        <li
                                                                                            key={office._id}
                                                                                            style={{
                                                                                                display: "flex",
                                                                                                justifyContent: "space-between",
                                                                                                alignItems: "center",
                                                                                                fontSize: "0.9rem",
                                                                                                color: "#374151",
                                                                                                marginBottom: "8px",
                                                                                            }}
                                                                                        >
                                                                                            <span>{office.name}</span>
                                                                                            <Box sx={{ display: "flex", gap: 1 }}>
                                                                                                <Button
                                                                                                    onClick={() => handleOpenOfficeDialog(floor._id, office)}
                                                                                                    variant="contained"
                                                                                                    size="small"
                                                                                                >
                                                                                                    Edit
                                                                                                </Button>
                                                                                                <Button
                                                                                                    onClick={() => handleDeleteOffice(campus._id, building._id, floor._id, office._id)}
                                                                                                    variant="contained"
                                                                                                    size="small"
                                                                                                    color="error"
                                                                                                >
                                                                                                    Delete
                                                                                                </Button>
                                                                                            </Box>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            ) : (
                                                                                <Typography variant="body2" sx={{ fontSize: "0.9rem", color: "#6b7280" }}>
                                                                                    No offices available.
                                                                                </Typography>
                                                                            )}
                                                                        </Box>
                                                                    ))}
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
                    {editingBuilding ? "Edit Building" : "Add Building"}
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
                        {editingBuilding ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openFloorDialog} onClose={handleCloseDialog}>
                <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {editingFloor ? "Edit Floor" : "Add Floor"}
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
                        {editingFloor ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={openOfficeDialog} onClose={handleCloseDialog}>
                <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {editingOffice ? "Edit Office" : "Add Office"}
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
                    <Select
                        value={officePosition}
                        onChange={(e) => setOfficePosition(e.target.value)}
                        displayEmpty
                        fullWidth
                        sx={{ mt: 2 }}
                    >
                        <MenuItem value="" disabled>
                            Select Position
                        </MenuItem>
                        <MenuItem value="ASP">ASP</MenuItem>
                        <MenuItem value="Faculty">Faculty</MenuItem>
                        <MenuItem value="Facilities Employee">Facilities Employee</MenuItem>
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleOfficeSubmit} color="primary">
                        {editingOffice ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirmation Modal */}
            <Dialog open={openConfirmationModal} onClose={handleCloseConfirmationModal}>
                <DialogTitle sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    Confirm Action
                </DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to perform this action?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmationModal}>Cancel</Button>
                    <Button onClick={handleConfirmAction} color="error">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Loader */}
            <Loader isLoading={isLoading} />
        </Box>
    );
};

export default CampusManagement;