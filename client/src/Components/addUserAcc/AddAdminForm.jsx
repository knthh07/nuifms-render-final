import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, InputAdornment, IconButton, FormControl, Select, MenuItem, InputLabel } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { toast } from 'react-hot-toast';
import validator from "validator";

const AddAdminForm = ({ open, onClose, onUserAdded = () => { }, sx }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [dept, setDept] = useState("");
    const [campus, setCampus] = useState("");
    const [idNum1, setIdNum1] = useState("");
    const [idNum2, setIdNum2] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");

    const handleClickShowPassword = () => setShowPassword(!showPassword);
    const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleIdNum1Change = (e) => {
        const value = e.target.value;
        if (/^\d{0,2}$/.test(value)) {
            setIdNum1(value);
        }
    };

    const handleIdNum2Change = (e) => {
        const value = e.target.value;
        if (/^\d{0,4}$/.test(value)) {
            setIdNum2(value);
        }
    };

    const resetState = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDept("");
        setCampus("");
        setIdNum1("");
        setIdNum2("");
        setError("");
    };

    const handleSubmit = async () => {
        if (!firstName) {
            toast.error("First name is required");
            return;
        }
        if (!lastName) {
            toast.error("Last name is required");
            return;
        }
        if (!email) {
            toast.error("Email is required");
            return;
        }
        if (!dept) {
            toast.error("Department is required");
            return;
        }
        if (!campus) {
            toast.error("Department is required");
            return;
        }
        if (!password) {
            toast.error("Password is required");
            return;
        }
        if (!validator.isStrongPassword(password) || password.length <= 6) {
            toast.error(
                'Password should be at least 6 characters long, contains an ' +
                'uppercase and lowercase letter, and at least 1 symbol'
            );
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (!idNum1 || !idNum2) {
            toast.error("ID Number is required");
            return;
        }

        try {
            const response = await axios.post("/api/signupAdmin", { firstName, lastName, email, dept, campus, password, confirmPassword, idNum1, idNum2 });
            if (response.data.error) {
                setError(response.data.error);
            } else {
                onUserAdded(); // This will now safely call a function, even if onUserAdded is not provided
                resetState();
                onClose();
            }
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} sx={sx}>
            <DialogTitle>Register Admin</DialogTitle>
            <DialogContent>
                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '24px' }}>
                    <TextField label="First Name" value={firstName} autoComplete="false" required onChange={(e) => setFirstName(e.target.value)} fullWidth />
                    <TextField label="Last Name" value={lastName} required onChange={(e) => setLastName(e.target.value)} fullWidth />
                    <TextField label="Email" value={email} required onChange={(e) => setEmail(e.target.value)} fullWidth />
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>Campus</InputLabel>
                        <Select
                            onChange={(e) => setCampus(e.target.value)}
                            value={campus}
                            required
                            label="Department"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="National University - Main">National University - Main</MenuItem>
                            <MenuItem value="National University - Annex">National University - Annex</MenuItem>
                            <MenuItem value="National University - Annex 2">National University - Annex 2</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl variant="outlined" fullWidth>
                        <InputLabel>Department</InputLabel>
                        <Select
                            onChange={(e) => setDept(e.target.value)}
                            value={dept}
                            required
                            label="Department"
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="CCIT">College of Computing and Information Technologies</MenuItem>
                            <MenuItem value="COE">College of Engineering</MenuItem>
                            <MenuItem value="COAB">College of Accounting and Business Management</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        onClick={handleClickShowPassword}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        required
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        edge="end"
                                        onClick={handleClickShowConfirmPassword}
                                    >
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        label="ID Number 1"
                        value={idNum1}
                        required
                        onChange={handleIdNum1Change}
                        fullWidth
                        type="number" // Restrict input to numbers
                        inputProps={{ min: "0", max: "99", step: "1" }} // Restrict to 2 digits
                    />
                    <TextField
                        label="ID Number 2"
                        value={idNum2}
                        required
                        onChange={handleIdNum2Change}
                        fullWidth
                        type="number" // Restrict input to numbers
                        inputProps={{ min: "0", max: "9999", step: "1" }} // Restrict to 4 digits
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSubmit} color="primary">Add</Button>
                <Button onClick={onClose} color="secondary">Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddAdminForm;
