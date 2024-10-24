import React, { useEffect, useState } from "react";
import SideNav from "../Components/sidenav/SideNav";
import axios from "axios";
import {
    Box,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    Typography,
    TableHead,
    TableRow,
    Paper,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import AddUserForm from "../Components/addUserAcc/AddUserForm";
import { toast } from 'react-hot-toast';
import Loader from "../hooks/Loader";

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openActionDialog, setOpenActionDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setLoading] = useState(false); // Loading state

    const fetchUsers = async (page) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/users?page=${page}`);
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage]);

    const handleDeleteUser = (user) => {
        if (!user) {
            console.error("User is null");
            return;
        }
        setSelectedUser(user);
        setOpenDeleteDialog(true);
    };

    const confirmDeleteUser = async () => {
        try {
            setLoading(true);
            if (!selectedUser) {
                console.error("Selected user is null");
                return;
            }
            await axios.delete(`/api/users/${selectedUser.email}`);
            fetchUsers(currentPage);
            closeDeleteDialog();
            toast.success("User deleted successfully.");
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error("Error deleting user.");
        } finally {
            setLoading(false);
        }
    };

    const closeDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setSelectedUser(null);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleAddUser = () => {
        setOpenAddDialog(true);
    };

    const handleUserAdded = () => {
        fetchUsers(currentPage);
        toast.success("User added successfully.");
    };

    const handleToggleUserStatus = (user) => {
        setSelectedUser(user);
        setOpenActionDialog(true);
    };

    const confirmToggleUserStatus = async () => {
        try {
            setLoading(true);
            if (!selectedUser) {
                console.error("Selected user is null");
                return;
            }
            const action = selectedUser.status === 'active' ? 'deactivate' : 'activate';
            await axios.put(`/api/users/${selectedUser.email}/${action}`);
            fetchUsers(currentPage);
            toast.success(`User ${action}d successfully.`);
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            toast.error(`Error ${action}ing user.`);
        } finally {
            setOpenActionDialog(false);
            setSelectedUser(null);
            setLoading(false);
        }
    };

    const closeActionDialog = () => {
        setOpenActionDialog(false);
        setSelectedUser(null);
    };

    return (
        <div className="flex">
            <SideNav />
            <div className="flex flex-col w-full">
                <div className="w-[80%] ml-[20%] p-6">
                    <Typography variant="h5" gutterBottom>Account Management</Typography>

                    <Button sx={{ marginBottom: 3 }} variant="contained" color="primary" startIcon={<Add />} onClick={handleAddUser}>
                        Add User
                    </Button>

                    <TableContainer component={Paper}>
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
                                            <Button
                                                variant="contained"
                                                color={user.status === 'active' ? 'secondary' : 'primary'}
                                                onClick={() => handleToggleUserStatus(user)}
                                                sx={{ marginRight: 1 }}
                                            >
                                                {user.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </Button>
                                            {user.status !== 'active' && (
                                                <IconButton onClick={() => handleDeleteUser(user)}>
                                                    <Delete />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 3, marginBottom: 3 }}>
                            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} />
                        </Box>
                    </TableContainer>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={closeDeleteDialog}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this user?
                </DialogContent>
                <DialogActions>
                    <Button onClick={confirmDeleteUser} color="error">Delete</Button>
                    <Button onClick={closeDeleteDialog} color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Activation/Deactivation Confirmation Dialog */}
            <Dialog open={openActionDialog} onClose={closeActionDialog}>
                <DialogTitle>Confirm {selectedUser?.status === 'active' ? 'Deactivation' : 'Activation'}</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to {selectedUser?.status === 'active' ? 'deactivate' : 'activate'} this user?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={confirmToggleUserStatus} color="primary">
                        {selectedUser?.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button onClick={closeActionDialog} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>

            {/* Add User Form */}
            <AddUserForm
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                onUserAdded={handleUserAdded}
                sx={{ marginBottom: 3 }}
            />

            <Loader isLoading={isLoading} />
        </div>
    );
};

export default UserManagementPage;
