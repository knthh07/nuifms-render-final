import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    Select,
    MenuItem,
    InputLabel,
    IconButton,
    InputAdornment,
    Box
} from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from "axios";
import DOMPurify from 'dompurify';
import { toast } from 'react-hot-toast';

const AddUserForm = ({ open, onClose, onUserAdded, sx }) => {
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [dept, setDept] = useState("");
    const [position, setPosition] = useState("");
    const [idNum1, setIdNum1] = useState("");
    const [idNum2, setIdNum2] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [error, setError] = useState("");

    const resetState = () => {
        setStep(1);
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setDept("");
        setPosition("");
        setIdNum1("");
        setIdNum2("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setEmailError('');
        setError("");
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleEmailChange = (e) => {
        const email = DOMPurify.sanitize(e.target.value).trim();
        setEmail(email);

        const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students|faculty|admin)\.national-u\.edu\.ph$/;
        if (!emailDomainRegex.test(email)) {
            setEmailError('Please provide a valid email.');
        } else {
            setEmailError('');
        }
    };

    const handleIdNumChange = (e) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value) && value.length <= (name === 'idNum1' ? 2 : 4)) {
            if (name === 'idNum1') {
                setIdNum1(value);
            } else {
                setIdNum2(value);
            }
        }
    };

    const handleNextStep = async () => {
        if (step === 1) {
            if (firstName.length > 16 || lastName.length > 16) {
                toast.error('First Name and Last Name must be 16 characters or fewer');
                return;
            }

            if (password !== confirmPassword) {
                toast.error('Passwords do not match');
                return;
            }

            try {
                const sanitizedData = {
                    firstName: DOMPurify.sanitize(firstName),
                    lastName: DOMPurify.sanitize(lastName),
                    email: DOMPurify.sanitize(email),
                    password: DOMPurify.sanitize(password),
                    confirmPassword: DOMPurify.sanitize(confirmPassword),
                };

                const response = await axios.post("/api/addUser", sanitizedData);
                if (response.data.error) {
                    setError(response.data.error);
                } else {
                    setStep(2);
                    setError("");
                }
            } catch (error) {
                console.error("Error adding user:", error);
            }
        } else if (step === 2) {
            try {
                if (!/^\d{2}$/.test(idNum1) || !/^\d{4}$/.test(idNum2)) {
                    setError('ID Numbers must be in the correct format.');
                    return;
                }

                const response = await axios.post("/api/addUserInfo", { email, dept, position, idNum1, idNum2 });
                if (response.data.error) {
                    setError(response.data.error);
                } else {
                    onUserAdded();
                    onClose();
                    resetState();
                }
            } catch (error) {
                console.error("Error adding user info:", error);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} sx={sx}>
            <DialogTitle>{step === 1 ? "Register User" : "Add Additional Info"}</DialogTitle>
            <DialogContent>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {step === 1 ? (
                    <>
                        <TextField
                            variant='filled'
                            label='First Name'
                            fullWidth
                            InputLabelProps={{
                                style: { color: 'black' },
                            }}
                            sx={{
                                input: { color: 'black' },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'transparent',
                                    borderBottom: '1px solid black',
                                },
                                '& .Mui-focused .MuiFilledInput-input': {
                                    backgroundColor: 'transparent',
                                },
                                '& .Mui-focused': {
                                    borderColor: 'black',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'black',
                                }
                            }}
                            value={firstName}
                            required
                            onChange={(e) => setFirstName(DOMPurify.sanitize(e.target.value))}
                        />

                        <TextField
                            variant='filled'
                            label='Last Name'
                            fullWidth
                            InputLabelProps={{
                                style: { color: 'black' },
                            }}
                            sx={{
                                input: { color: 'black' },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'transparent',
                                    borderBottom: '1px solid black',
                                },
                                '& .Mui-focused .MuiFilledInput-input': {
                                    backgroundColor: 'transparent',
                                },
                                '& .Mui-focused': {
                                    borderColor: 'black',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'black',
                                }
                            }}
                            value={lastName}
                            required
                            onChange={(e) => setLastName(DOMPurify.sanitize(e.target.value))}
                        />

                        <TextField
                            variant='filled'
                            label='Email'
                            fullWidth
                            InputLabelProps={{
                                style: { color: 'black' },
                            }}
                            sx={{
                                input: { color: 'black' },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'transparent',
                                    borderBottom: '1px solid black',
                                },
                                '& .Mui-focused .MuiFilledInput-input': {
                                    backgroundColor: 'transparent',
                                },
                                '& .Mui-focused': {
                                    borderColor: 'black',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'black',
                                }
                            }}
                            value={email}
                            required
                            onChange={handleEmailChange}
                            error={!!emailError}
                            helperText={emailError}
                        />

                        <TextField
                            variant='filled'
                            type={showPassword ? 'text' : 'password'}
                            label='Password'
                            InputLabelProps={{
                                style: { color: 'black' },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={toggleShowPassword}
                                            edge="end"
                                            style={{ color: "black" }} // Change the icon color to black
                                        >
                                            {showPassword ? <VisibilityOff style={{ color: 'black' }} /> : <Visibility style={{ color: 'black' }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                            sx={{
                                input: { color: 'black' },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'transparent',
                                    borderBottom: '1px solid black',
                                },
                                '& .Mui-focused .MuiFilledInput-input': {
                                    backgroundColor: 'transparent',
                                },
                                '& .Mui-focused': {
                                    borderColor: 'black',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'black',
                                }
                            }}
                            value={password}
                            required
                            onChange={(e) => setPassword(DOMPurify.sanitize(e.target.value))}
                        />

                        <TextField
                            variant='filled'
                            label='Confirm Password'
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            InputLabelProps={{
                                style: { color: 'black' },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={toggleShowConfirmPassword}
                                            edge="end"
                                            style={{ color: "black" }}
                                        >
                                            {showConfirmPassword ? <VisibilityOff style={{ color: 'black' }} /> : <Visibility style={{ color: 'black' }} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                input: { color: 'black' },
                                '& .MuiFilledInput-root': {
                                    backgroundColor: 'transparent',
                                    borderBottom: '1px solid black',
                                },
                                '& .Mui-focused .MuiFilledInput-input': {
                                    backgroundColor: 'transparent',
                                },
                                '& .Mui-focused': {
                                    borderColor: 'black',
                                },
                                '& .MuiInputLabel-root.Mui-focused': {
                                    color: 'black',
                                }
                            }}
                            value={confirmPassword}
                            required
                            onChange={(e) => setConfirmPassword(DOMPurify.sanitize(e.target.value))}
                        />
                    </>
                ) : (
                    <>
                        <FormControl variant="filled" fullWidth>
                            <InputLabel style={{ color: 'black' }}>Department</InputLabel>
                            <Select
                                sx={{
                                    '.MuiSelect-filled': { color: 'black' },
                                    '.MuiSelect-icon': { color: 'black' },
                                    backgroundColor: 'transparent',
                                    borderBottom: '1px solid black',
                                    '& .Mui-focused .MuiSelect-filled': { backgroundColor: 'transparent' },
                                    '& .Mui-focused': { borderColor: 'black' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
                                }}
                                value={dept}
                                required
                                onChange={(e) => setDept(e.target.value)}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="CCIT">CCIT</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="CBA">CBA</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COAH">COAH</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COE">COE</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl variant="filled" fullWidth>
                            <InputLabel style={{ color: 'black' }}>Position</InputLabel>
                            <Select
                                sx={{
                                    '.MuiSelect-filled': { color: 'black' },
                                    '.MuiSelect-icon': { color: 'black' },
                                    backgroundColor: 'transparent',
                                    borderBottom: '1px solid black',
                                    '& .Mui-focused .MuiSelect-filled': { backgroundColor: 'transparent' },
                                    '& .Mui-focused': { borderColor: 'black' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: 'black' },
                                }}
                                value={position}
                                required
                                onChange={(e) => setPosition(e.target.value)}
                            >
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ASP">ASP</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Faculty">Faculty</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Facilities Employee">Facilities Employee</MenuItem>
                            </Select>
                        </FormControl>

                        <div className="flex space-x-2">
                            <TextField
                                variant='filled'
                                label='ID Number 1'
                                fullWidth
                                InputLabelProps={{ style: { color: 'black' } }}
                                sx={{
                                    input: { color: 'black' },
                                    '& .MuiFilledInput-root': { backgroundColor: 'transparent', borderBottom: '1px solid black' },
                                    '& .Mui-focused .MuiFilledInput-input': { backgroundColor: 'transparent' },
                                    '& .Mui-focused': { borderColor: 'black' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: 'black' }
                                }}
                                name="idNum1"
                                value={idNum1}
                                required
                                onChange={handleIdNumChange}
                            />

                            <TextField
                                variant='filled'
                                label='ID Number 2'
                                fullWidth
                                InputLabelProps={{ style: { color: 'black' } }}
                                sx={{
                                    input: { color: 'black' },
                                    '& .MuiFilledInput-root': { backgroundColor: 'transparent', borderBottom: '1px solid black' },
                                    '& .Mui-focused .MuiFilledInput-input': { backgroundColor: 'transparent' },
                                    '& .Mui-focused': { borderColor: 'black' },
                                    '& .MuiInputLabel-root.Mui-focused': { color: 'black' }
                                }}
                                name="idNum2"
                                value={idNum2}
                                required
                                onChange={handleIdNumChange}
                            />
                        </div>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleNextStep} variant="contained" color="primary">
                    {step === 1 ? "Next" : "Submit"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddUserForm;
