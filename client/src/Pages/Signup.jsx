import React, { useState } from "react";
import { IconButton, InputAdornment, TextField, Box, Button, Checkbox, FormControlLabel, Modal, Typography, Tooltip } from "@mui/material";
import { Visibility, VisibilityOff, Warning } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import signupLogoSrc from '../assets/img/nu_logo.webp';
import Loader from "../hooks/Loader";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false); // To handle the Terms and Conditions modal
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

  const verifyOtp = async () => {
    try {
      const { email } = data;
      setIsLoading(true);
      const response = await axios.post('/api/verify-otp-signup', { email, otp });
      if (response.data.error) {
        setIsLoading(false);
        toast.error(response.data.error);
      } else {
        setIsLoading(false);
        registerUser(); // Proceed to registration after OTP verification
      }
    } catch (error) {
      toast.error('Invalid OTP.');
    }
  };

  const registerUser = async () => {
    const { email, password } = data;
    const sanitizedData = {
      email: DOMPurify.sanitize(email),
      password: DOMPurify.sanitize(password),
    };
    try {
      setIsLoading(true);
      const response = await axios.post('/api/signup', sanitizedData); // Send only password, not confirmPassword
      const result = response.data;
      if (result.error) {
        setIsLoading(false);
        toast.error(result.error);
      } else {
        setIsLoading(false);
        setData({ email: '', password: '', confirmPassword: '' });
        toast.success('Registration successful.');
        navigate('/addInfo');
      }
    } catch (error) {
      toast.error('Error submitting form.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword } = data;

    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Check for valid email
    if (emailError) {
      toast.error(emailError);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (!termsAccepted) {
      toast.error('You must accept the terms and conditions.');
      return;
    }

    try {
      const response = await axios.post('/api/signup', data); // Call your registerUser function
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        // If no error, proceed to OTP step
        setIsOtpStep(true);
        toast.success('OTP sent to your email.');
      }
    } catch (error) {
      toast.error('Error submitting form.');
    }
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
                          <Tooltip title="Password must be at least 8 characters long, contain uppercase, lowercase letters, and at least 1 symbol.">
                            <IconButton size="small" style={{ color: 'white' }}>
                              <Warning />
                            </IconButton>
                          </Tooltip>
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
                    onChange={(e) => setData({ ...data, password: DOMPurify.sanitize(e.target.value) })}
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
                  onChange={(e) => setData({ ...data, confirmPassword: DOMPurify.sanitize(e.target.value) })}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={termsAccepted}
                      onChange={() => setTermsAccepted(!termsAccepted)}
                      style={{ color: 'white' }}
                    />
                  }
                  label={<span onClick={() => setIsTermsModalOpen(true)} style={{ cursor: 'pointer', color: '#Ffff00', textDecoration: 'underline' }}>Terms and Conditions</span>}
                  style={{ color: 'white' }}
                />

                <button
                  type='submit'
                  className="bg-white text-[#35408e] rounded-md cursor-pointer block py-2 px-8 mx-auto mt-6 hover:bg-[#e0e0e0] border border-white">
                  SIGN UP
                </button>
                <Loader isLoading={isLoading} />

                <p className="mt-6 text-center text-white">
                  Already have an account?
                  <a href="/login" className="text-yellow-400 underline ml-1">Login here</a>
                </p>
              </div>
            </div>
          ) : (
            <div className="otp-container flex flex-col items-center space-y-4">
              <TextField
                label="Enter OTP"
                variant="filled"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                InputLabelProps={{ style: { color: 'white' } }}
                sx={{ input: { color: 'white' }, '& .MuiFilledInput-root': { borderBottom: '1px solid white' } }}
              />
              <Button
                onClick={verifyOtp}
                className="bg-white text-[#35408e] rounded-md cursor-pointer block py-2 px-8 mx-auto mt-6 border border-[#35408e]" // No hover effect
                fullWidth
              >
                Verify OTP
              </Button>

              <Loader isLoading={isLoading} />
            </div>
          )}
        </Box>

        {/* Terms and Conditions Modal */}
        <Modal open={isTermsModalOpen} onClose={handleTermsModalClose}>
          <div className="p-6 bg-white rounded-lg max-w-lg mx-auto mt-40">
            <Typography variant="h6">Terms and Conditions</Typography>
            <Typography variant="body1" className="mt-4">
              These terms and conditions are in accordance with the Data Privacy Act of 2012 of the Philippines, ensuring that all personal data collected is protected and processed in compliance with the law. By signing up, you agree that National University may collect, use, and process your data for academic, administrative, and operational purposes. This includes but is not limited to, your educational records, contact information, and other necessary details required by the University.
              <br /><br />
              For more details, visit our <a href="https://national-u.edu.ph/privacy-policy" target="_blank" className="text-blue-500 underline">Privacy Policy</a>.
            </Typography>
            <Button onClick={handleTermsModalClose} className="mt-6 bg-[#35408e] hover:bg-[#25366e] text-white">Close</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Signup;
