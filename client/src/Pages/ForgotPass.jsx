import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Box, Button, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import signupLogoSrc from '../assets/img/nu_logo.webp';
import backgroundImage from '../assets/img/bg.webp';
import toast from 'react-hot-toast'; // Import toast from react-hot-toast
import Loader from '../hooks/Loader';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    // States for showing/hiding passwords
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleOtpChange = (e) => setOtp(e.target.value);
    const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
    const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

    // Toast notifications
    const showErrorToast = (message) => toast.error(message);
    const showSuccessToast = (message) => toast.success(message);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading
        try {
            const response = await axios.post('/api/forgot-password', { email });
            if (response.status === 200) {
                showSuccessToast(`OTP sent to ${email}`);
                setShowOtpInput(true);
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Server error, please try again later';
            showErrorToast(errMsg);
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await axios.post('/api/verify-otp', { email, otp });
            if (response.status === 200) {
                showSuccessToast('OTP verified successfully. You can now reset your password.');
                setShowOtpInput(false);
                setShowPasswordInput(true);
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Server error, please try again later';
            showErrorToast(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showErrorToast('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('/api/reset-password', { email, otp, newPassword });
            if (response.status === 200) {
                showSuccessToast('Password reset successfully.');
                navigate('/login');
            }
        } catch (error) {
            const errMsg = error.response?.data?.message || 'Server error, please try again later';
            showErrorToast(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="bg-[#35408e] p-8 rounded-2xl shadow-md w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img src={signupLogoSrc} alt="NU LOGO" className="w-36 h-auto" />
                </div>
                <Box
                    component="form"
                    autoComplete="off"
                    noValidate
                    onSubmit={showPasswordInput ? handlePasswordSubmit : (showOtpInput ? handleOtpSubmit : handleSubmit)}
                >
                    <div id="input" className="space-y-6">
                        <h1 className="text-2xl font-bold underline text-white text-center">Reset Password</h1>

                        {isLoading && (
                            <div className="flex justify-center">
                                <Loader isLoading={isLoading} />
                            </div>
                        )}

                        {!showOtpInput && !showPasswordInput && (
                            <div className="space-y-4">
                                <TextField
                                    variant="filled"
                                    label="Email"
                                    fullWidth
                                    InputLabelProps={{ style: { color: 'white' } }}
                                    sx={{
                                        input: { color: 'white' },
                                        '& .MuiFilledInput-root': {
                                            backgroundColor: 'transparent',
                                            borderBottom: '1px solid white',
                                        },
                                    }}
                                    value={email}
                                    onChange={handleEmailChange}
                                />
                            </div>
                        )}

                        {showOtpInput && (
                            <div className="space-y-4">
                                <TextField
                                    variant="filled"
                                    label="Enter OTP"
                                    fullWidth
                                    InputLabelProps={{ style: { color: 'white' } }}
                                    sx={{
                                        input: { color: 'white' },
                                        '& .MuiFilledInput-root': {
                                            backgroundColor: 'transparent',
                                            borderBottom: '1px solid white',
                                        },
                                    }}
                                    value={otp}
                                    onChange={handleOtpChange}
                                />
                            </div>
                        )}

                        {showPasswordInput && (
                            <>
                                <div className="space-y-4">
                                    <TextField
                                        variant="filled"
                                        label="New Password"
                                        type={showNewPassword ? 'text' : 'password'}
                                        fullWidth
                                        InputLabelProps={{ style: { color: 'white' } }}
                                        sx={{
                                            input: { color: 'white' },
                                            '& .MuiFilledInput-root': {
                                                backgroundColor: 'transparent',
                                                borderBottom: '1px solid white',
                                            },
                                        }}
                                        value={newPassword}
                                        onChange={handleNewPasswordChange}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        edge="end"
                                                        style={{ color: "white" }}
                                                    >
                                                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <TextField
                                        variant="filled"
                                        label="Confirm Password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        fullWidth
                                        InputLabelProps={{ style: { color: 'white' } }}
                                        sx={{
                                            input: { color: 'white' },
                                            '& .MuiFilledInput-root': {
                                                backgroundColor: 'transparent',
                                                borderBottom: '1px solid white',
                                            },
                                        }}
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                        style={{ color: "white" }}
                                                    >
                                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
                            {showPasswordInput ? 'Change Password' : (showOtpInput ? 'Verify OTP' : 'Reset Password')}
                        </Button>

                        <Button onClick={() => navigate('/login')} variant="contained" color="primary" fullWidth className="mt-4">
                            Back
                        </Button>
                    </div>
                </Box>
            </div>
        </div>
    );
};

export default ForgotPassword;
