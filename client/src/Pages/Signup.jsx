import React, { useState, useEffect } from "react";
import { IconButton, InputAdornment, TextField, Box, Button, Checkbox, FormControlLabel, Modal, Tooltip, Typography } from "@mui/material";
import { Visibility, VisibilityOff, Warning } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import signupLogoSrc from '../assets/img/nu_webp.webp';
import Loader from "../hooks/Loader";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordValid, setPasswordValid] = useState(true);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [data, setData] = useState({ email: '', password: '', confirmPassword: '' });
  const navigate = useNavigate();
  const [cooldown, setCooldown] = useState(0);

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleEmailChange = (e) => {
    const email = DOMPurify.sanitize(e.target.value).trim();
    setData({ ...data, email });
    const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students\.)?(national-u\.edu\.ph|nu-nazareth\.edu\.ph|nu-laguna\.edu\.ph|nu-moa\.edu\.ph|nu-fairview\.edu\.ph|nu-baliwag\.edu\.ph|nu-dasma\.edu\.ph|lipa\.nu\.edu\.ph|apc\.edu\.ph)$/;
    setEmailError(!emailDomainRegex.test(email) ? 'Please enter a valid National University email' : '');
  };

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
    setPasswordValid(validatePassword(password));
  };

  const handleConfirmPasswordChange = (e) => {
    const confirmPassword = DOMPurify.sanitize(e.target.value);
    setData({ ...data, confirmPassword });
  };

  const registerUser = async () => {
    const { email, password } = data;
    const sanitizedData = { email: DOMPurify.sanitize(email), password: DOMPurify.sanitize(password) };

    try {
      setIsLoading(true);
      const response = await axios.post('/api/signup', sanitizedData);
      toast.success(response.data.message);
      setIsOtpStep(true);
      setCooldown(180); // Start 3-minute cooldown
    } catch (error) {
      const backendMessage = error.response?.data?.error || 'An unexpected error occurred.';
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('/api/signupOTP', { email: data.email });
      toast.success(response.data.message);
      setCooldown(180); // Restart 3-minute cooldown
    } catch (error) {
      const backendMessage = error.response?.data?.error || 'Failed to resend OTP.';
      toast.error(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      const { email } = data;
      setIsLoading(true);
      const response = await axios.post('/api/verify-otp-signup', { email, otp });
      toast.success(response.data.message);
      navigate('/addInfo');
    } catch (error) {
      const backendMessage = error.response?.data?.error || 'Invalid OTP.';
      toast.error(backendMessage);
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
      toast.error('Password does not meet the minimum requirements.');
      return;
    }

    if (!termsAccepted) {
      toast.error('You must accept the terms and conditions.');
      return;
    }

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
                <TextField
                  variant="filled"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  InputLabelProps={{ style: { color: 'white' } }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        {!passwordValid && (
                          <Tooltip title="Password must be at least 8 characters long, contain uppercase, lowercase letters, a number, and a symbol.">
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
                  sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { borderBottom: '1px solid white' } }}
                  value={data.password}
                  required
                  onChange={handlePasswordChange}
                />
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
                  onChange={handleConfirmPasswordChange}
                />
                <FormControlLabel
                  control={<Checkbox checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} style={{ color: 'white' }} />}
                  label={<span onClick={() => setIsTermsModalOpen(true)} style={{ cursor: 'pointer', color: '#FBBF24' }}>Terms and Conditions</span>}
                  style={{ color: 'white' }}
                />
                <Button
                  type='submit'
                  variant='contained'
                  fullWidth
                  sx={{
                    backgroundColor: 'white',
                    color: '#35408e',
                    border: '1px solid white',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    marginTop: 2,
                    '&:hover': { backgroundColor: '#e0e0e0' },
                  }}
                >
                  Register
                </Button>
                <p className="mt-6 text-white text-center">
                  Already have an account?
                  <a href="/login" className="text-yellow-400 ml-1">Login</a>
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <h2 className="text-xl font-semibold text-white text-center">Enter OTP</h2>
              <Typography variant="body2" color="white" textAlign="center" gutterBottom>
                Please check your email for the OTP. Don't forget to look in your spam or junk folders.
              </Typography>
              <TextField
                variant="filled"
                label="OTP"
                fullWidth
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { borderBottom: '1px solid white' } }}
                value={otp}
                required
                onChange={(e) => setOtp(e.target.value)}
              />
              <Button
                onClick={verifyOtp}
                variant="contained"
                sx={{
                  backgroundColor: 'white',
                  color: '#35408e',
                  border: '1px solid white',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  '&:hover': { backgroundColor: '#e0e0e0' },
                }}
              >
                Verify OTP
              </Button>
              <Button
                onClick={resendOtp}
                variant="text"
                disabled={cooldown > 0}
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  backgroundColor: "#35408e", // Example background color
                  '&:hover': {
                    backgroundColor: "#2c2f77", // Lighter shade on hover
                  }
                }}
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
              </Button>
              <Button
                onClick={() => setIsOtpStep(false)}
                variant="text"
                sx={{
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                  backgroundColor: "#35408e", // Example background color
                  '&:hover': {
                    backgroundColor: "#2c2f77", // Lighter shade on hover
                  }
                }}
              >
                Go Back
              </Button>
            </div>
          )}
        </Box>
      </div>

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

      <Loader isLoading={isLoading} />
    </div>
  );
};

export default Signup;
