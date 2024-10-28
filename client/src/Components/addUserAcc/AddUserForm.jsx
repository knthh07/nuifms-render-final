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

                                <MenuItem sx={{ color: 'black' }} value="Admissions">Admissions</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Alumni/marketing and communications office - manila">Alumni/marketing and communications office - manila</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Athletics office">Athletics office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Athlete academic development office">Athlete academic development office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Asset management office">Asset management office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="AVP-academic services">Avp-academic services</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="AVP-administration">Avp-administration</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Business development and linkages">Business development and linkages</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Bulldogs exchange">Bulldogs exchange</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Center for innovative and sustainable development">Center for innovative and sustainable development</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="CFO">Cfo</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="College of allied health">College of allied health</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="College of computing and information technologies">College of computing and information technologies</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="College of engineering">College of engineering</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="College of tourism and hospitality management">College of tourism and hospitality management</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COMEX/NSTP">Comex/nstp</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Construction and facilities management office">Construction and facilities management office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Data privacy office">Data privacy office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Education technology">Education technology</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Faculty and administration office">Faculty and administration office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Finance shared">Finance shared</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="General accounting and budgeting - manila">General accounting and budgeting - manila</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Guidance services office">Guidance services office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Health services">Health services</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Human resources - manila">Human resources - manila</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="International student services office">International student services office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="IT systems office">IT systems office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Learning resource center">Learning resource center</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Legacy office">Legacy office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Motorpool">Motorpool</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="National university alumni foundation inc">National university alumni foundation inc</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="NUCSG office">Nucsg office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Payroll office">Payroll office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Physical facilities management office">Physical facilities management office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Quality management office">Quality management office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="QMO manila">Qmo manila</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Registrar">Registrar</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Research and development">Research and development</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Safety and security">Safety and security</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Safety office">Safety office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Student development and activities office">Student development and activities office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Technology services office">Technology services office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Treasury office">Treasury office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-administrative services">Vp-administrative services</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-corporate affairs">Vp-corporate affairs</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-operations">Vp-operations</MenuItem>

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

                        <div className="flex items-center space-x-2">
                            <TextField
                                variant='filled'
                                label='ID Number 1'
                                fullWidth
                                InputLabelProps={{
                                    style: { color: 'black' }, // Change to black for consistency
                                }}
                                sx={{
                                    input: { color: 'black' }, // Text color
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'transparent', // Transparent background
                                        borderBottom: '1px solid black', // Black border for the bottom
                                    },
                                    '& .Mui-focused .MuiFilledInput-input': {
                                        backgroundColor: 'transparent', // Keep background transparent on focus
                                    },
                                    '& .Mui-focused': {
                                        borderColor: 'black', // Border color on focus
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'black', // Label color on focus
                                    },
                                }}
                                value={idNum1}
                                onChange={handleIdNumChange}
                                name="idNum1"
                                inputProps={{ maxLength: 2 }} // Limit the number of characters
                            />

                            {/* Dash separator */}
                            <span
                                style={{
                                    color: 'black', // Color of the dash
                                    fontSize: '24px', // Adjust size as needed
                                    lineHeight: '30px', // Match the height of the text fields
                                }}
                            >
                                -
                            </span>

                            <TextField
                                variant='filled'
                                label='ID Number 2'
                                fullWidth
                                InputLabelProps={{
                                    style: { color: 'black' }, // Change to black for consistency
                                }}
                                sx={{
                                    input: { color: 'black' }, // Text color
                                    '& .MuiFilledInput-root': {
                                        backgroundColor: 'transparent', // Transparent background
                                        borderBottom: '1px solid black', // Black border for the bottom
                                    },
                                    '& .Mui-focused .MuiFilledInput-input': {
                                        backgroundColor: 'transparent', // Keep background transparent on focus
                                    },
                                    '& .Mui-focused': {
                                        borderColor: 'black', // Border color on focus
                                    },
                                    '& .MuiInputLabel-root.Mui-focused': {
                                        color: 'black', // Label color on focus
                                    },
                                }}
                                value={idNum2}
                                onChange={handleIdNumChange}
                                name="idNum2"
                                inputProps={{ maxLength: 4 }} // Limit the number of characters
                            />
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
