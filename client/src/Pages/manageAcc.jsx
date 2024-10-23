import React, { useEffect, useState } from "react";
import SideNav from "../Components/sidenav/SideNav";
import axios from "axios";
import { Box, Pagination, Table, TableBody, TableCell, TableContainer, Typography, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import AddUserForm from "../Components/addUserAcc/AddUserForm";
import { toast } from 'react-hot-toast'; // Ensure toast is imported

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
            if (!selectedUser) {
                console.error("Selected user is null");
                return;
            }
            await axios.delete(`/api/users/${selectedUser.email}`);
            fetchUsers(currentPage);
            closeDeleteDialog();
            toast.success("User deleted successfully."); // Notify success
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error("Error deleting user."); // Notify error
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
        toast.success("User added successfully."); // Notify success
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
                                    <TableCell>Position</TableCell>
                                    <TableCell>Role</TableCell>
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
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleDeleteUser(user)}>
                                                <Delete />
                                            </IconButton>
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

            <AddUserForm
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                onUserAdded={handleUserAdded}
                sx={{ marginBottom: 3 }}
            />
        </div>
    );
};

export default UserManagementPage;
