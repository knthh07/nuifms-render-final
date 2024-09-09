import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Box, Button } from "@mui/material";
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');

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
            const response = await axios.post('/api/reset-password', { email, otp, newPassword });
            if (response.status === 200) {
                setMessage('Password reset successfully.');
                toast.success('Password reset successfully.');
                // Redirect to login page or another page
                navigate('/login');
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
                <Box component="form" autoComplete="off" noValidate onSubmit={handleSubmit}>
                    <div id="input" className="space-y-6">
                        <h1 className="text-2xl font-bold underline text-white text-center">Reset Password</h1>
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
                        <Button type="submit" variant="contained" color="primary" fullWidth className="mt-4">
                            Reset Password
                        </Button>
                        {message && <div className="mt-6 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center text-gray-800">{message}</div>}
                    </div>
                </Box>
            </div>
        </div>
    );
};

export default ResetPassword;
