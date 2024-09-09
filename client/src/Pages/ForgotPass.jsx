import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Box, Button } from "@mui/material";
import signupLogoSrc from '../assets/img/nu_logo.png';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const handleNewPasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/forgot-password', { email });
            if (response.status === 200) {
                setMessage(`OTP sent to ${email}`);
                setShowOtpInput(true);
            } else {
                setMessage(response.data.message || 'Error sending OTP');
            }
        } catch (error) {
            setMessage('Server error, please try again later');
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/verify-otp', { email, otp });
            if (response.status === 200) {
                setMessage('OTP verified successfully. You can now reset your password.');
                setShowOtpInput(false);
                setShowPasswordInput(true);
            } else {
                setMessage(response.data.message || 'Invalid OTP');
            }
        } catch (error) {
            setMessage('Server error, please try again later');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/reset-password', { email, otp, newPassword });
            if (response.status === 200) {
                setMessage('Password reset successfully.');
                navigate('/login'); // Redirect to login page or show a success message
            } else {
                setMessage(response.data.message || 'Error resetting password');
            }
        } catch (error) {
            setMessage('Server error, please try again later');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffffff]">
            <div className="bg-[#35408e] p-8 rounded-2xl shadow-md w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <img src={signupLogoSrc} alt="NU LOGO" className="w-36 h-auto" />
                </div>
                <Box component="form" autoComplete="off" noValidate onSubmit={showPasswordInput ? handlePasswordSubmit : (showOtpInput ? handleOtpSubmit : handleSubmit)}>
                    <div id="input" className="space-y-6">
                        <h1 className="text-2xl font-bold underline text-white text-center">Reset Password</h1>
                        {!showOtpInput && !showPasswordInput && (
                            <div className="space-y-4">
                                <TextField
                                    variant="filled"
                                    label="Email"
                                    fullWidth
                                    InputLabelProps={{
                                        style: { color: 'white' },
                                    }}
                                    sx={{
                                        input: { color: 'white' },
                                        '& .MuiFilledInput-root': {
                                            backgroundColor: 'transparent',
                                            borderBottom: '1px solid white',
                                        },
                                        '& .Mui-focused .MuiFilledInput-input': {
                                            backgroundColor: 'transparent',
                                        },
                                        '& .Mui-focused': {
                                            borderColor: 'white',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'white',
                                        }
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
                                    InputLabelProps={{
                                        style: { color: 'white' },
                                    }}
                                    sx={{
                                        input: { color: 'white' },
                                        '& .MuiFilledInput-root': {
                                            backgroundColor: 'transparent',
                                            borderBottom: '1px solid white',
                                        },
                                        '& .Mui-focused .MuiFilledInput-input': {
                                            backgroundColor: 'transparent',
                                        },
                                        '& .Mui-focused': {
                                            borderColor: 'white',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'white',
                                        }
                                    }}
                                    value={otp}
                                    onChange={handleOtpChange}
                                />
                            </div>
                        )}

                        {showPasswordInput && (
                            <div className="space-y-4">
                                <TextField
                                    variant="filled"
                                    label="New Password"
                                    type="password"
                                    fullWidth
                                    InputLabelProps={{
                                        style: { color: 'white' },
                                    }}
                                    sx={{
                                        input: { color: 'white' },
                                        '& .MuiFilledInput-root': {
                                            backgroundColor: 'transparent',
                                            borderBottom: '1px solid white',
                                        },
                                        '& .Mui-focused .MuiFilledInput-input': {
                                            backgroundColor: 'transparent',
                                        },
                                        '& .Mui-focused': {
                                            borderColor: 'white',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'white',
                                        }
                                    }}
                                    value={newPassword}
                                    onChange={handleNewPasswordChange}
                                />
                            </div>
                        )}

                        <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
                            {showPasswordInput ? 'Change Password' : (showOtpInput ? 'Verify OTP' : 'Reset Password')}
                        </Button>

                        {message && <div className="mt-6 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center text-gray-800">{message}</div>}

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
