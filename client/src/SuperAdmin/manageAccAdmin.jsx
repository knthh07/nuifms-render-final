import React, { useEffect, useState } from "react";
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import axios from "axios";
import {
    Box,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Tabs,
    Tab,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import AddUserForm from "../Components/addUserAcc/AddUserForm";
import { toast } from 'react-hot-toast'; // Ensure toast is imported

const SuperAdminManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openActionDialog, setOpenActionDialog] = useState(false);
    const [entityType, setEntityType] = useState(""); // 'user' or 'admin'
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tabValue, setTabValue] = useState(0); // 0 for users, 1 for admins
    const [loading, setLoading] = useState(false); // Loading state

    const fetchUsers = async (page) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/users?page=${page}`);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdmins = async (page) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/admins?page=${page}`);
            setAdmins(response.data.admins);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching admins:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
        fetchAdmins(currentPage);
    }, [currentPage]);

    const handleEntityAction = async (action) => {
        if (!selectedEntity) {
            console.error("Selected entity is null");
            return;
        }

        const actionUrl =
            entityType === 'user'
                ? `/api/users/${selectedEntity.email}/${selectedEntity.status === 'active' ? 'deactivate' : 'activate'}`
                : `/api/admins/${selectedEntity.email}/${selectedEntity.status === 'active' ? 'deactivate' : 'activate'}`;

        try {
            const response = await axios.put(actionUrl);
            toast.success(response.data.message);
            entityType === 'user' ? fetchUsers(currentPage) : fetchAdmins(currentPage);
            setOpenActionDialog(false);
        } catch (error) {
            toast.error(error.response?.data.message || `Error ${action} entity`);
            console.error(`Error ${action} entity:`, error);
        }
    };

    const handleDelete = async () => {
        if (!selectedEntity) {
            console.error("Selected entity is null");
            return;
        }

        const actionUrl = entityType === 'user' ? `/api/users/${selectedEntity.email}` : `/api/admins/${selectedEntity.email}`;

        try {
            const response = await axios.delete(actionUrl);
            toast.success(response.data.message);
            entityType === 'user' ? fetchUsers(currentPage) : fetchAdmins(currentPage);
            setOpenDeleteDialog(false);
        } catch (error) {
            toast.error(error.response?.data.message || 'Error deleting entity');
            console.error('Error deleting entity:', error);
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleAddUser = () => {
        setOpenAddDialog(true);
    };

    const handleUserAdded = () => {
        fetchUsers(currentPage);
        fetchAdmins(currentPage); // Refresh both users and admins lists
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const buttonStyle = {
        margin: '0 5px',
        padding: '8px 16px',
        borderRadius: '4px',
        fontWeight: 'bold',
    };

    return (
        <div className="flex h-screen">
            <SuperAdminSideNav />
            <div className="flex flex-col w-full">
                <div className="w-[80%] ml-[20%] p-6">
                    <h1 className="text-2xl font-bold mb-4">Account Management</h1>
                    <Button sx={{ marginBottom: 3 }} variant="contained" color="primary" startIcon={<Add />} onClick={handleAddUser}>
                        Add User
                    </Button>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="account management tabs">
                        <Tab label="Users" />
                        <Tab label="Admins" />
                    </Tabs>
                    {tabValue === 0 && (
                        <div className="space-y-4">
                            <TableContainer component={Paper} className="mt-4">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Department</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.email}>
                                                <TableCell>{user.idNum}</TableCell>
                                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.dept}</TableCell>
                                                <TableCell>{user.status}</TableCell>
                                                <TableCell>
                                                    {user.status === 'active' ? (
                                                        <Button
                                                            sx={buttonStyle}
                                                            onClick={() => { setSelectedEntity(user); setOpenActionDialog(true); setEntityType('user'); }}
                                                            variant="contained"
                                                            color="secondary"
                                                        >
                                                            Deactivate
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                sx={buttonStyle}
                                                                onClick={() => { setSelectedEntity(user); setOpenActionDialog(true); setEntityType('user'); }}
                                                                variant="contained"
                                                                color="primary"
                                                            >
                                                                Activate
                                                            </Button>
                                                            <IconButton onClick={() => { setSelectedEntity(user); setOpenDeleteDialog(true); setEntityType('user'); }}>
                                                                <Delete />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                    {tabValue === 1 && (
                        <div className="space-y-4">
                            <TableContainer component={Paper} className="mt-4">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Department</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {admins.map((admin) => (
                                            <TableRow key={admin.email}>
                                                <TableCell>{admin.idNum}</TableCell>
                                                <TableCell>{admin.firstName} {admin.lastName}</TableCell>
                                                <TableCell>{admin.email}</TableCell>
                                                <TableCell>{admin.dept}</TableCell>
                                                <TableCell>{admin.status}</TableCell>
                                                <TableCell>
                                                    {admin.status === 'active' ? (
                                                        <Button
                                                            sx={buttonStyle}
                                                            onClick={() => { setSelectedEntity(admin); setOpenActionDialog(true); setEntityType('admin'); }}
                                                            variant="contained"
                                                            color="primary"
                                                        >
                                                            Deactivate
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                sx={buttonStyle}
                                                                onClick={() => { setSelectedEntity(admin); setOpenActionDialog(true); setEntityType('admin'); }}
                                                                variant="contained"
                                                                color="primary"
                                                            >
                                                                Activate
                                                            </Button>
                                                            <IconButton onClick={() => { setSelectedEntity(admin); setOpenDeleteDialog(true); setEntityType('admin'); }}>
                                                                <Delete />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            variant="outlined"
                            color="primary"
                        />
                    </Box>
                </div>
            </div>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Delete Entity</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this {entityType}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openActionDialog} onClose={() => setOpenActionDialog(false)}>
                <DialogTitle>{entityType === 'user' ? 'Deactivate User' : 'Deactivate Admin'}</DialogTitle>
                <DialogContent>
                    Are you sure you want to {selectedEntity?.status === 'active' ? 'deactivate' : 'activate'} this {entityType}?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenActionDialog(false)}>Cancel</Button>
                    <Button onClick={() => handleEntityAction(selectedEntity.status === 'active' ? 'deactivate' : 'activate')}>Confirm</Button>
                </DialogActions>
            </Dialog>

            {/* Add User Form */}
            <AddUserForm
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                onUserAdded={handleUserAdded}
                sx={{ marginBottom: 3 }}
            />
        </div>
    );
};

export default SuperAdminManagementPage;
