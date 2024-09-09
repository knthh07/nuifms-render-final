import React, { useEffect, useState } from "react";
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import axios from "axios";
import { Box, Pagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Tabs, Tab } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import AddUserForm from "../Components/addUserAcc/AddUserForm";
import AddAdminForm from "../Components/addUserAcc/AddAdminForm";

const SuperAdminManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [entityType, setEntityType] = useState(""); // 'user' or 'admin'
    const [openDialog, setOpenDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openAddDialogSA, setOpenAddDialogSA] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [tabValue, setTabValue] = useState(0); // 0 for users, 1 for admins

    const fetchUsers = async (page) => {
        try {
            const response = await axios.get(`/api/users?page=${page}`);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const fetchAdmins = async (page) => {
        try {
            const response = await axios.get(`/api/admins?page=${page}`);
            setAdmins(response.data.admins);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            console.error("Error fetching admins:", error);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
        fetchAdmins(currentPage);
    }, [currentPage]);

    const handleDelete = async () => {
        try {
            if (!selectedEntity) {
                console.error("Selected entity is null");
                return;
            }

            if (entityType === 'user') {
                await axios.delete(`/api/users/${selectedEntity.email}`);
                fetchUsers(currentPage);
            } else if (entityType === 'admin') {
                await axios.delete(`/api/admins/${selectedEntity.email}`);
                fetchAdmins(currentPage);
            }

            setOpenDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting entity:', error);
        }
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleAddUser = () => {
        setOpenAddDialogSA(true);
        setEntityType("user");
    };

    const handleUserAdded = () => {
        fetchUsers(currentPage);
    };

    const handleAddAdmin = () => {
        setOpenAddDialog(true);
        setEntityType("admin");
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <div className="flex h-screen">
            <SuperAdminSideNav />
            <div className="flex flex-col w-full">
                <div className="w-[80%] ml-[20%] p-6">
                    <h1 className="text-2xl font-bold mb-4">Account Management</h1>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="account management tabs">
                        <Tab label="Users" />
                        <Tab label="Admins" />
                    </Tabs>
                    {tabValue === 0 && (
                        <div className="space-y-4">
                            <Button sx={{ marginBottom: 2, marginTop: 2 }} variant="contained" color="primary" onClick={handleAddUser} startIcon={<Add />}>
                                Add User
                            </Button>
                            <TableContainer component={Paper} className="mt-4">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Position</TableCell>
                                            <TableCell>Department</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.email}>
                                                <TableCell>{user.idNum}</TableCell>
                                                <TableCell>{user.firstName} {user.lastName}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.position}</TableCell>
                                                <TableCell>{user.dept}</TableCell>
                                                <TableCell>
                                                    <IconButton onClick={() => { setSelectedEntity(user); setOpenDeleteDialog(true); setEntityType('user'); }}><Delete /></IconButton>
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
                            <Button sx={{ marginBottom: 2, marginTop: 2 }} variant="contained" color="primary" onClick={handleAddAdmin} startIcon={<Add />}>
                                Add Admin
                            </Button>
                            <TableContainer component={Paper} className="mt-4">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
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
                                                <TableCell>
                                                    <IconButton onClick={() => { setSelectedEntity(admin); setOpenDeleteDialog(true); setEntityType('admin'); }}><Delete /></IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3, marginBottom: 3 }}>
                        <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
                    </Box>
                </div>
            </div>

            <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this {entityType}?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDelete} color="primary">Delete</Button>
                    <Button onClick={() => setOpenDeleteDialog(false)} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>

            {entityType === "user" && (
                <AddUserForm
                    open={openAddDialogSA}
                    onClose={() => setOpenAddDialogSA(false)}
                    onUserAdded={handleUserAdded}
                />
            )}
            {entityType === "admin" && (
                <AddAdminForm
                    open={openAddDialog}
                    onClose={() => setOpenAddDialog(false)}
                    onAdminAdded={handleUserAdded}
                />
            )}
        </div>
    );
};

export default SuperAdminManagementPage;

