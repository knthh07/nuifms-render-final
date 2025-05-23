import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, Select, MenuItem, InputLabel, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from "axios";
import DOMPurify from 'dompurify';
import { toast } from 'react-hot-toast';
import Loader from '../../hooks/Loader';

const generatePassword = (length = 12) => {
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_+";
    const allChars = lowerCase + upperCase + numbers + specialChars;
    const passwordArray = [
        lowerCase[Math.floor(Math.random() * lowerCase.length)],
        upperCase[Math.floor(Math.random() * upperCase.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)],
    ];
    for (let i = passwordArray.length; i < length; i++) {
        passwordArray.push(allChars[Math.floor(Math.random() * allChars.length)]);
    }
    return passwordArray.sort(() => Math.random() - 0.5).join('');
};

const AddUserForm = ({ open, onClose, onUserAdded, sx }) => {
    const [step, setStep] = useState(1);
    const [role, setRole] = useState("user");
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
    const [isLoading, setIsLoading] = useState(false);
    const [offices, setOffices] = useState([]);

    useEffect(() => {
        const fetchOffices = async () => {
            try {
                const response = await axios.get('/api/offices');
                setOffices(response.data);
            } catch (error) {
                console.error("Error fetching offices:", error);
                toast.error('Failed to load offices');
            }
        };
        fetchOffices();
    }, []);

    const resetState = () => {
        setStep(1); setRole(""); setFirstName(""); setLastName(""); setEmail(""); 
        setPassword(""); setConfirmPassword(""); setDept(""); setPosition(""); 
        setIdNum1(""); setIdNum2(""); setShowPassword(false); 
        setShowConfirmPassword(false); setEmailError('');
    };

    const toggleShowPassword = () => setShowPassword(!showPassword);
    const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleEmailChange = (e) => {
        const email = DOMPurify.sanitize(e.target.value).trim();
        setEmail(email);
        const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students\.)?national-u\.edu\.ph$/;
        setEmailError(!emailDomainRegex.test(email) ? 'Please provide a valid email.' : '');
    };

    const handleIdNumChange = (e) => {
        const { name, value } = e.target;
        if (/^\d*$/.test(value) && value.length <= (name === 'idNum1' ? 2 : 4)) {
            name === 'idNum1' ? setIdNum1(value) : setIdNum2(value);
        }
    };

    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
            setFirstName(DOMPurify.sanitize(value));
        }
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
            setLastName(DOMPurify.sanitize(value));
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
                setPassword(""); setConfirmPassword("");
                return;
            }
            const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students\.)?national-u\.edu\.ph$/;
            if (!emailDomainRegex.test(email)) {
                toast.error('Please provide a valid email.');
                return;
            }
            try {
                const sanitizedData = {
                    role: DOMPurify.sanitize(role),
                    firstName: DOMPurify.sanitize(firstName),
                    lastName: DOMPurify.sanitize(lastName),
                    email: DOMPurify.sanitize(email),
                    password: DOMPurify.sanitize(password),
                    confirmPassword: DOMPurify.sanitize(confirmPassword),
                };
                setIsLoading(true);
                const response = await axios.post("/api/addUser", sanitizedData);
                setIsLoading(false);
                response.data.error ? toast.error(response.data.error) : (toast.success('User details added successfully!'), setStep(2));
            } catch (error) {
                setIsLoading(false);
                error.response?.data?.error ? toast.error(error.response.data.error) : toast.error("Failed to add user. Please try again.");
            }
        } else if (step === 2) {
            try {
                if (!dept || !position) {
                    toast.error('Please select a department and position.');
                    return;
                }
                const sanitizedData = {
                    firstName: DOMPurify.sanitize(firstName),
                    lastName: DOMPurify.sanitize(lastName),
                    email: DOMPurify.sanitize(email),
                    dept: DOMPurify.sanitize(dept),
                    position: DOMPurify.sanitize(position),
                    idNum1: DOMPurify.sanitize(idNum1),
                    idNum2: DOMPurify.sanitize(idNum2),
                };
                setIsLoading(true);
                const response = await axios.post("/api/addUserInfo", sanitizedData);
                setIsLoading(false);
                if (response.data.error) {
                    toast.error(response.data.error);
                } else {
                    toast.success('User info added successfully!');
                    onUserAdded(); onClose(); resetState();
                }
            } catch (error) {
                setIsLoading(false);
                error.response?.data?.error ? toast.error(error.response.data.error) : toast.error("Failed to add user. Please try again.");
            }
        }
    };

    const handleGeneratePassword = () => {
        const newPassword = generatePassword();
        setPassword(newPassword);
        setConfirmPassword(newPassword);
    };

    const commonTextFieldStyles = {
        input: { color: 'black' },
        '& .MuiFilledInput-root': { backgroundColor: 'transparent', borderBottom: '1px solid black' },
        '& .Mui-focused .MuiFilledInput-input': { backgroundColor: 'transparent' },
        '& .Mui-focused': { borderColor: 'black' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'black' }
    };

    const commonSelectStyles = {
        '.MuiSelect-filled': { color: 'black' },
        '.MuiSelect-icon': { color: 'black' },
        backgroundColor: 'transparent',
        borderBottom: '1px solid black',
        '& .Mui-focused .MuiSelect-filled': { backgroundColor: 'transparent' },
        '& .Mui-focused': { borderColor: 'black' },
        '& .MuiInputLabel-root.Mui-focused': { color: 'black' }
    };

    return (
        <Dialog open={open} onClose={onClose} sx={sx}>
            <DialogTitle>{step === 1 ? "Register User" : "Add Additional Info"}</DialogTitle>
            <DialogContent>
                {step === 1 ? (
                    <>
                        <TextField variant='filled' label='Email' fullWidth InputLabelProps={{ style: { color: 'black' } }}
                            sx={commonTextFieldStyles} value={email} required onChange={handleEmailChange}
                            error={!!emailError} helperText={emailError} />

                        <FormControl variant="filled" fullWidth>
                            <InputLabel style={{ color: 'black' }}>Role</InputLabel>
                            <Select sx={commonSelectStyles} value={role} required onChange={(e) => setRole(e.target.value)}>
                                <MenuItem sx={{ color: 'black' }} value="user">Set as User</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="admin">Set as Admin</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField variant='filled' type={showPassword ? 'text' : 'password'} label='Password'
                            InputLabelProps={{ style: { color: 'black' } }} InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <IconButton onClick={toggleShowPassword} edge="end" style={{ color: "black" }}>
                                        {showPassword ? <VisibilityOff style={{ color: 'black' }} /> : <Visibility style={{ color: 'black' }} />}
                                    </IconButton>
                                </InputAdornment>
                            }} fullWidth sx={commonTextFieldStyles} value={password} required
                            onChange={(e) => setPassword(e.target.value)} />

                        <TextField variant='filled' type={showConfirmPassword ? 'text' : 'password'} label='Confirm Password'
                            InputLabelProps={{ style: { color: 'black' } }} InputProps={{
                                endAdornment: <InputAdornment position="end">
                                    <IconButton onClick={toggleShowConfirmPassword} edge="end" style={{ color: "black" }}>
                                        {showConfirmPassword ? <VisibilityOff style={{ color: 'black' }} /> : <Visibility style={{ color: 'black' }} />}
                                    </IconButton>
                                </InputAdornment>
                            }} fullWidth sx={commonTextFieldStyles} value={confirmPassword} required
                            onChange={(e) => setConfirmPassword(e.target.value)} />

                        <Button onClick={handleGeneratePassword} variant="outlined" sx={{ marginTop: 2 }}>Generate Password</Button>
                    </>
                ) : (
                    <>
                        <TextField variant='filled' label='First Name' fullWidth InputLabelProps={{ style: { color: 'black' } }}
                            sx={commonTextFieldStyles} value={firstName} required onChange={handleFirstNameChange} />

                        <TextField variant='filled' label='Last Name' fullWidth InputLabelProps={{ style: { color: 'black' } }}
                            sx={commonTextFieldStyles} value={lastName} required onChange={handleLastNameChange} />

                        <FormControl variant="filled" fullWidth>
                            <InputLabel style={{ color: 'black' }}>Department</InputLabel>
                            <Select sx={commonSelectStyles} value={dept} required onChange={(e) => setDept(e.target.value)}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                {offices.map((office) => (
                                    <MenuItem key={office._id} sx={{ color: 'black' }} value={office.name}>{office.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl variant="filled" fullWidth>
                            <InputLabel style={{ color: 'black' }}>Position</InputLabel>
                            <Select sx={commonSelectStyles} value={position} required onChange={(e) => setPosition(e.target.value)}>
                                <MenuItem value=""><em>None</em></MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ASP">ASP</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Faculty">Faculty</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Facilities Employee">Facilities Employee</MenuItem>
                            </Select>
                        </FormControl>

                        <div className="flex items-center space-x-2">
                            <TextField variant='filled' label='ID Number 1' fullWidth InputLabelProps={{ style: { color: 'black' } }}
                                sx={commonTextFieldStyles} value={idNum1} onChange={handleIdNumChange} name="idNum1" inputProps={{ maxLength: 2 }} />
                            <span style={{ color: 'black', fontSize: '24px', lineHeight: '30px' }}>-</span>
                            <TextField variant='filled' label='ID Number 2' fullWidth InputLabelProps={{ style: { color: 'black' } }}
                                sx={commonTextFieldStyles} value={idNum2} onChange={handleIdNumChange} name="idNum2" inputProps={{ maxLength: 4 }} />
                        </div>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="error">Cancel</Button>
                <Button onClick={handleNextStep}>{step === 1 ? "Next" : "Submit"}</Button>
            </DialogActions>
            <Loader isLoading={isLoading} />
        </Dialog>
    );
};

export default AddUserForm;