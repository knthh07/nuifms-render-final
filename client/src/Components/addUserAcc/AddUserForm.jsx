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
} from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from "axios";
import DOMPurify from 'dompurify';
import { toast } from 'react-hot-toast';
import Loader from '../../hooks/Loader';

// Function to generate a random password
const generatePassword = (length = 12) => {
    const lowerCase = "abcdefghijklmnopqrstuvwxyz";
    const upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_+";

    const allChars = lowerCase + upperCase + numbers + specialChars;

    // Ensure at least one character from each category
    const passwordArray = [
        lowerCase[Math.floor(Math.random() * lowerCase.length)],
        upperCase[Math.floor(Math.random() * upperCase.length)],
        numbers[Math.floor(Math.random() * numbers.length)],
        specialChars[Math.floor(Math.random() * specialChars.length)],
    ];

    // Fill the rest of the password length with random characters
    for (let i = passwordArray.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        passwordArray.push(allChars[randomIndex]);
    }

    // Shuffle the password array to randomize the order
    const password = passwordArray.sort(() => Math.random() - 0.5).join('');
    return password;
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

    const resetState = () => {
        setStep(1);
        setRole("");
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
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleShowConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleEmailChange = (e) => {
        const email = DOMPurify.sanitize(e.target.value).trim();
        setEmail(email);  // Update the email state
        const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students\.)?national-u\.edu\.ph$/;
        setEmailError(!emailDomainRegex.test(email) ? 'Please provide a valid email.' : '');
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

    const handleFirstNameChange = (e) => {
        const value = e.target.value;
        // Regular expression to allow only letters (and spaces, if needed)
        if (/^[a-zA-Z\s]*$/.test(value) || value === '') {
            setFirstName(DOMPurify.sanitize(value));
        }
    };

    const handleLastNameChange = (e) => {
        const value = e.target.value;
        // Regular expression to allow only letters (and spaces, if needed)
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
                setPassword("");
                setConfirmPassword("");
                return;
            }

            // Add a check for email validity here
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

                setIsLoading(true); // Optionally set loading state
                const response = await axios.post("/api/addUser", sanitizedData);
                setIsLoading(false);

                if (response.data.error) {
                    // Call the error from the backend response and trigger a toast
                    toast.error(response.data.error);
                } else {
                    toast.success('User details added successfully!'); // Success toast
                    setStep(2); // Proceed to the next step if no errors
                }
            } catch (error) {
                setIsLoading(false);
                // Handle any unexpected error
                if (error.response && error.response.data && error.response.data.error) {
                    toast.error(error.response.data.error); // Backend error
                } else {
                    toast.error("Failed to add user. Please try again."); // General error
                }
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

                setIsLoading(true); // Optionally set loading state
                const response = await axios.post("/api/addUserInfo", sanitizedData);
                setIsLoading(false);

                if (response.data.error) {
                    // Call the error from the backend response and trigger a toast
                    toast.error(response.data.error);
                } else {
                    toast.success('User info added successfully!'); // Success toast
                    onUserAdded(); // Trigger the onUserAdded callback
                    onClose(); // Close the form/modal
                    resetState(); // Reset form state
                }
            } catch (error) {
                setIsLoading(false);
                // Handle any unexpected error
                if (error.response && error.response.data && error.response.data.error) {
                    toast.error(error.response.data.error); // Backend error
                } else {
                    toast.error("Failed to add user. Please try again."); // General error
                }
            }
        }
    };

    // Function to handle password generation
    const handleGeneratePassword = () => {
        const newPassword = generatePassword();
        setPassword(newPassword);
        setConfirmPassword(newPassword);
    };

    return (
        <Dialog open={open} onClose={onClose} sx={sx}>
            <DialogTitle>{step === 1 ? "Register User" : "Add Additional Info"}</DialogTitle>
            <DialogContent>
                {step === 1 ? (
                    <>
                        <TextField
                            variant='filled'
                            label='Email'
                            fullWidth
                            InputLabelProps={{ style: { color: 'black' } }}
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

                        <FormControl variant="filled" fullWidth>
                            <InputLabel style={{ color: 'black' }}>Role</InputLabel>
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
                                value={role} // Use the state value
                                required
                                onChange={(e) => setRole(e.target.value)}
                            >
                                <MenuItem sx={{ color: 'black' }} value="user">Set as User</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="admin">Set as Admin</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            variant='filled'
                            type={showPassword ? 'text' : 'password'}
                            label='Password'
                            InputLabelProps={{ style: { color: 'black' } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={toggleShowPassword}
                                            edge="end"
                                            style={{ color: "black" }}
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
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <TextField
                            variant='filled'
                            type={showConfirmPassword ? 'text' : 'password'}
                            label='Confirm Password'
                            InputLabelProps={{ style: { color: 'black' } }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                            onClick={toggleShowConfirmPassword}
                                            edge="end"
                                            style={{ color: "black" }}
                                        >
                                            {showConfirmPassword ? <VisibilityOff style={{ color: 'black' }} /> : <Visibility style={{ color: 'black' }} />}
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
                            value={confirmPassword}
                            required
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <Button onClick={handleGeneratePassword} variant="outlined" sx={{ marginTop: 2 }}>
                            Generate Password
                        </Button>

                    </>
                ) : (
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
                            onChange={handleFirstNameChange} // Use the handler
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
                            onChange={handleLastNameChange} // Use the handler
                        />

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

                                {/* National University Manila - Main */}
                                <MenuItem sx={{ color: 'black' }} value="HEALTH SERVICES">HEALTH SERVICES</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="LOGISTICS/PURCHASING">LOGISTICS/PURCHASING</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="NATIONAL UNIVERSITY ALUMNI FOUNDATION INC">NATIONAL UNIVERSITY ALUMNI FOUNDATION INC</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="MOTORPOOL">MOTORPOOL</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ASSET MANAGEMENT OFFICE">ASSET MANAGEMENT OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="PHYSICAL FACILITIES MANAGEMENT OFFICE">PHYSICAL FACILITIES MANAGEMENT OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="BULLDOGS EXCHANGE">BULLDOGS EXCHANGE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="TREASURY OFFICE">TREASURY OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ADMISSIONS">ADMISSIONS</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="REGISTRAR">REGISTRAR</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COLLEGE OF ALLIED HEALTH">COLLEGE OF ALLIED HEALTH</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="RESEARCH AND DEVELOPMENT">RESEARCH AND DEVELOPMENT</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="IT SYSTEMS OFFICE">IT SYSTEMS OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="FACULTY AND ADMINISTRATION OFFICE">FACULTY AND ADMINISTRATION OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="QMO MANILA">QMO MANILA</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="SAFETY OFFICE">SAFETY OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="AVP-ACADEMIC SERVICES">AVP-ACADEMIC SERVICES</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="AVP-ADMINISTRATION">AVP-ADMINISTRATION</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-OPERATIONS">VP-OPERATIONS</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ACADEME INTERNSHIP AND PLACEMENT OFFICE">ACADEME INTERNSHIP AND PLACEMENT OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="DATA PRIVACY OFFICE">DATA PRIVACY OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="EDUCATION TECHNOLOGY">EDUCATION TECHNOLOGY</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COLLEGE OF COMPUTING AND INFORMATION TECHNOLOGIES">COLLEGE OF COMPUTING AND INFORMATION TECHNOLOGIES</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT">COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ATHLETICS OFFICE">ATHLETICS OFFICE</MenuItem>

                                {/* National University Annex */}
                                <MenuItem sx={{ color: 'black' }} value="ALUMNI/MARKETING AND COMMUNICATIONS OFFICE - MANILA">ALUMNI/MARKETING AND COMMUNICATIONS OFFICE - MANILA</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="LEARNING RESOURCE CENTER">LEARNING RESOURCE CENTER</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COMEX/NSTP">COMEX/NSTP</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="NUCSG OFFICE">NUCSG OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="STUDENT DEVELOPMENT AND ACTIVITIES OFFICE">STUDENT DEVELOPMENT AND ACTIVITIES OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ATHLETE ACADEMIC DEVELOPMENT OFFICE">ATHLETE ACADEMIC DEVELOPMENT OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COLLEGE OF ENGINEERING">COLLEGE OF ENGINEERING</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="GENERAL ACCOUNTING AND BUDGETING - MANILA">GENERAL ACCOUNTING AND BUDGETING - MANILA</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="HUMAN RESOURCES - MANILA">HUMAN RESOURCES - MANILA</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="GUIDANCE SERVICES OFFICE">GUIDANCE SERVICES OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="CENTER FOR INNOVATIVE AND SUSTAINABLE DEVELOPMENT">CENTER FOR INNOVATIVE AND SUSTAINABLE DEVELOPMENT</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="INTERNATIONAL STUDENT SERVICES OFFICE">INTERNATIONAL STUDENT SERVICES OFFICE</MenuItem>

                                {/* National University OSIAS */}
                                <MenuItem sx={{ color: 'black' }} value="CORPORATE MARKETING AND COMMUNICATION OFFICE">CORPORATE MARKETING AND COMMUNICATION OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ALUMNI OFFICE">ALUMNI OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="LEGACY OFFICE">LEGACY OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="SAFETY AND SECURITY">SAFETY AND SECURITY</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="QUALITY MANAGEMENT OFFICE">QUALITY MANAGEMENT OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="CONSTRUCTION AND FACILITIES MANAGEMENT OFFICE">CONSTRUCTION AND FACILITIES MANAGEMENT OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="OFFICE OF THE PRESIDENT">OFFICE OF THE PRESIDENT</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="BUSINESS DEVELOPMENT AND LINKAGES">BUSINESS DEVELOPMENT AND LINKAGES</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-CORPORATE AFFAIRS">VP-CORPORATE AFFAIRS</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="CFO">CFO</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="AVP-ADMINISTRATIVE SERVICES">AVP-ADMINISTRATIVE SERVICES</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-ADMINISTRATIVE SERVICES">VP-ADMINISTRATIVE SERVICES</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="PAYROLL OFFICE">PAYROLL OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="HUMAN RESOURCES - SHARED SERVICES">HUMAN RESOURCES - SHARED SERVICES</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="FINANCE SHARED">FINANCE SHARED</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="TECHNOLOGY SERVICES OFFICE">TECHNOLOGY SERVICES OFFICE</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="GAO/CIO">GAO/CIO</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="ACADEMIC TECHNOLOGY OFFICE">ACADEMIC TECHNOLOGY OFFICE</MenuItem>
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
                                {/* Add more positions as needed */}
                            </Select>
                        </FormControl>

                        <TextField
                            variant='filled'
                            label='ID Number 1'
                            fullWidth
                            InputLabelProps={{ style: { color: 'black' } }}
                            value={idNum1}
                            onChange={handleIdNumChange}
                            name="idNum1"
                            inputProps={{ maxLength: 2 }}
                        />

                        <TextField
                            variant='filled'
                            label='ID Number 2'
                            fullWidth
                            InputLabelProps={{ style: { color: 'black' } }}
                            value={idNum2}
                            onChange={handleIdNumChange}
                            name="idNum2"
                            inputProps={{ maxLength: 4 }}
                        />
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
