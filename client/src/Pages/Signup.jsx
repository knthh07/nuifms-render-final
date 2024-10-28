import React, { useState } from "react";
import { IconButton, InputAdornment, TextField, Box, Button, Checkbox, FormControlLabel, Modal, Typography, Tooltip } from "@mui/material";
import { Visibility, VisibilityOff, Warning } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import backgroundImage from '../assets/img/bg.webp';
import signupLogoSrc from '../assets/img/nu_webp.webp';
import Loader from "../hooks/Loader";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordValid, setPasswordValid] = useState(true); // New state for password validity
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [data, setData] = useState({ email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleEmailChange = (e) => {
    const email = DOMPurify.sanitize(e.target.value).trim();
    setData({ ...data, email });
    const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students\.)?national-u\.edu\.ph$/;
    setEmailError(!emailDomainRegex.test(email) ? 'Please provide a valid email.' : '');
  };

  // Function to validate the password
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const handlePasswordChange = (e) => {
    const password = DOMPurify.sanitize(e.target.value);
    setData({ ...data, password });
    setPasswordValid(validatePassword(password)); // Check if the new password is valid
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = DOMPurify.sanitize(e.target.value);
    setData({ ...data, confirmPassword });
  };

  const registerUser = async () => {
    const { email, password } = data;
    const sanitizedData = {
      email: DOMPurify.sanitize(email),
      password: DOMPurify.sanitize(password),
    };

    try {
      setIsLoading(true);
      const response = await axios.post('/api/signup', sanitizedData);
      const result = response.data;

      if (result.message) {
        toast.success(result.message);
        setIsOtpStep(true); // Move to OTP verification step
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      // Handle errors returned from backend
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || 'An unexpected error occurred.');
      } else {
        toast.error('Error submitting form.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      const { email } = data;
      setIsLoading(true);
      const response = await axios.post('/api/verify-otp-signup', { email, otp });
      const result = response.data;

      if (result.message) {
        toast.success(result.message);
        navigate('/addInfo'); // Redirect to addInfo on successful OTP verification
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      // Handle errors returned from backend
      if (error.response && error.response.data) {
        toast.error(error.response.data.error || 'An unexpected error occurred.');
      } else {
        toast.error('Invalid OTP.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = data;

    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }

    if (emailError) {
      toast.error(emailError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!passwordValid) {
      toast.error('Password does not meet requirements.'); // Notify if password is invalid
      return;
    }

    if (!termsAccepted) {
      toast.error('You must accept the terms and conditions.');
      return;
    }

    // Call registerUser to handle registration and OTP sending
    registerUser();
  };

  const handleTermsModalClose = () => setIsTermsModalOpen(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-[#35408e] p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={signupLogoSrc} alt="NU LOGO" className="w-36 h-auto" />
        </div>
        <Box component="form" autoComplete="off" noValidate onSubmit={handleSubmit}>
          {!isOtpStep ? (
            <div id="input" className="space-y-6">
              <h1 className="text-2xl font-bold text-white text-center">Register</h1>
              <div className="space-y-4">
                <TextField
                  variant='filled'
                  label='Email'
                  fullWidth
                  InputLabelProps={{ style: { color: 'white' } }}
                  sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { borderBottom: '1px solid white' } }}
                  value={data.email}
                  required
                  onChange={handleEmailChange}
                  error={!!emailError}
                  helperText={emailError}
                />
                <div>
                  <TextField
                    variant="filled"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    InputLabelProps={{ style: { color: 'white' } }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {!passwordValid && ( // Show warning icon if password is invalid
                            <Tooltip title="Password must be at least 8 characters long, contain uppercase, lowercase letters, and at least 1 symbol.">
                              <IconButton size="small" style={{ color: 'red' }}>
                                <Warning />
                              </IconButton>
                            </Tooltip>
                          )}
                          <IconButton onClick={toggleShowPassword} style={{ color: 'white' }}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    sx={{
                      input: { color: 'white' },
                      '& .MuiFilledInput-root': { borderBottom: '1px solid white' },
                    }}
                    value={data.password}
                    required
                    onChange={handlePasswordChange} // Use the new handler
                  />
                </div>
                <TextField
                  variant='filled'
                  label='Confirm Password'
                  type={showConfirmPassword ? 'text' : 'password'}
                  fullWidth
                  InputLabelProps={{ style: { color: 'white' } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowConfirmPassword} style={{ color: 'white' }}>
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { borderBottom: '1px solid white' } }}
                  value={data.confirmPassword}
                  required
                  onChange={handleConfirmPasswordChange} // Use the new handler
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      onChange={() => setTermsAccepted(!termsAccepted)}
                      style={{ color: 'white' }}
                    />
                  }
                  label={<span onClick={() => setIsTermsModalOpen(true)} style={{ cursor: 'pointer', color: '#FBBF24' }}>Terms and Conditions</span>}
                  style={{ color: 'white' }}
                />
                <Button
                  type='submit'
                  variant='contained'
                  sx={{
                    backgroundColor: 'white', // Matches the style
                    color: '#35408e', // Text color to match
                    border: '1px solid white', // White border for consistency
                    borderRadius: '8px', // Rounded corners
                    padding: '8px 16px', // Reduced padding for compactness
                    fontWeight: 'bold', // Bold text
                    fontSize: '0.875rem', // Slightly smaller font size
                    cursor: 'pointer', // Change cursor on hover
                    marginTop: 2, // Maintain the existing margin
                    '&:hover': {
                      backgroundColor: '#e0e0e0', // Hover effect to match the login button
                    },
                  }}
                  fullWidth
                >
                  Register
                </Button>

                <p className="mt-6 text-white text-center">
                  Don't have an account?
                  <a href="/signup" className="text-yellow-400 ml-1">Sign up here</a>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center p-4 bg-[#35408e]">
              <h1 className="text-2xl font-bold text-white mb-4">Enter OTP</h1>
              <TextField
                label="OTP"
                fullWidth
                variant="filled"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{
                  input: { color: 'white' },
                  '& .MuiFilledInput-root': {
                    backgroundColor: 'transparent', // Make the background transparent
                    borderBottom: '1px solid white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white', // Label color
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'white', // Focused label color
                  },
                }}
              />
              <Button
                onClick={verifyOtp}
                variant='contained'
                sx={{
                  backgroundColor: 'white', // Matches the style
                  color: '#35408e', // Text color to match
                  border: '1px solid white', // White border for consistency
                  borderRadius: '8px', // Rounded corners
                  padding: '8px 16px', // Reduced padding for compactness
                  fontWeight: 'bold', // Bold text
                  fontSize: '0.875rem', // Slightly smaller font size
                  cursor: 'pointer', // Change cursor on hover
                  marginTop: 2, // Maintain the existing margin
                  '&:hover': {
                    backgroundColor: '#e0e0e0', // Hover effect to match the login button
                  },
                }}
              >
                Verify OTP
              </Button>
            </div>
          )}
        </Box>
      </div>
      {isLoading && <Loader />}
      <Modal open={isTermsModalOpen} onClose={handleTermsModalClose}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 600,
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            padding: '20px',
            outline: 'none',
            overflowY: 'auto',
            maxHeight: '80vh', // Ensures the modal does not exceed 80% of viewport height
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Privacy Policy (Example Only)
          </Typography>
          <Typography variant="h6" component="h3" gutterBottom>
            Your Rights as the Data Subject
          </Typography>
          <Typography variant="body1" paragraph>
            National University values your privacy highly in pursuant to our legitimate purpose of being an academic institution. You may change or ask us to remove your data to be modified or completely deleted from our Service. For questions and clarifications, please contact our Data Protection Office at:
          </Typography>
          <Typography variant="body1" paragraph>
            Data Protection Office<br />
            Address: 551 MF Jhocson Street, Sampaloc Manila 1008<br />
            Email: <a href="mailto:dpo@national-u.edu.ph">dpo@national-u.edu.ph</a>
          </Typography>
          <Typography variant="body2" style={{ marginTop: '20px', fontStyle: 'italic' }}>
            Source: <a href="https://national-u.edu.ph/privacy/" target="_blank" rel="noopener noreferrer">https://national-u.edu.ph/privacy/</a>
          </Typography>
          <Button onClick={handleTermsModalClose} variant="contained" color="primary" style={{ marginTop: '20px' }}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Signup;
