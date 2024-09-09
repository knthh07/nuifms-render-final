import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton, InputAdornment, TextField, Box } from "@mui/material";
import { Visibility, VisibilityOff, MailOutline, LockOutlined } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import './login.css';
import axios from 'axios';
import signupLogoSrc from '../../assets/img/nu_logo.png';
import backgroundImage from '../../assets/img/jhocsonPic.jpg'; // Update the path to your background image

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const [data, setData] = useState({
    email: '',
    password: '',
  });

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setData({ ...data, email });

    // Regex to check if email matches the specified domain
    const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students|faculty|admin)\.national-u\.edu\.ph$/;
    if (!emailDomainRegex.test(email)) {
      setEmailError('Please provide a valid email.');
    } else {
      setEmailError('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Sanitize inputs
    const email = DOMPurify.sanitize(data.email);
    const password = DOMPurify.sanitize(data.password);

    try {
      // Validate email and password
      if (!email || !password) {
        toast.error('Email and password are required');
        return;
      }

      const loginEndpoints = [
        { endpoint: '/api/login', role: 'user' },
        { endpoint: '/api/loginAdmin', role: 'admin' },
        { endpoint: '/api/loginSuperAdmin', role: 'superAdmin' },
      ];

      let isLoggedIn = false;

      for (const { endpoint, role } of loginEndpoints) {
        try {
          const response = await axios.post(endpoint, { email, password });
          const result = response.data;

          if (!result.error) {
            setData({ email: '', password: '' });
            toast.success('Login Successful. Welcome!');
            navigate(getDashboardPath(role));
            isLoggedIn = true;
            break;
          }
        } catch (error) {
          console.error(`Error logging in to ${endpoint}:`, error.response ? error.response.data : error.message);
        }
      }

      if (!isLoggedIn) {
        toast.error('Invalid credentials or server error. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error.response ? error.response.data : error.message);
      toast.error('Invalid credentials or server error. Please try again.');
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case 'user':
        return '/UserDashboard';
      case 'admin':
        return '/AdminDashboard';
      case 'superAdmin':
        return '/SuperAdminDashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="bg-[#35408e] p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <img src={signupLogoSrc} alt="NU LOGO" className="w-36 h-auto" />
        </div>
        <Box component="form" autoComplete='off' noValidate onSubmit={handleLogin}>
          <div id="input" className="space-y-6">
            <h1 className="text-2xl font-bold text-white text-center">Welcome</h1>
            <div className="space-y-4">
              <TextField
                variant='filled'
                label='Email'
                fullWidth
                InputLabelProps={{
                  style: { color: 'white' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutline style={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  input: { color: 'white' },
                  '& .MuiFilledInput-root': {
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid white',
                  },
                  '& .MuiFilledInput-root::before': {
                    borderBottom: '1px solid white',
                  },
                  '& .MuiFilledInput-root::after': {
                    borderBottom: '1px solid white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                    transform: 'translate(40px, 25px) scale(1)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'white',
                    transform: 'translate(13px, 4px) scale(0.75)',
                  },
                  '& .MuiInputLabel-root.MuiFormLabel-filled': {
                    color: 'white',
                    transform: 'translate(13px, 4px) scale(0.75)',
                  },
                }}
                value={data.email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
              />

              <TextField
                variant='filled'
                type={showPassword ? 'text' : 'password'}
                label='Password'
                InputLabelProps={{
                  style: { color: 'white' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined style={{ color: 'white' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                        style={{ color: "white" }}
                      >
                        {showPassword ? <VisibilityOff style={{ color: 'white' }} /> : <Visibility style={{ color: 'white' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
                sx={{
                  input: { color: 'white' },
                  '& .MuiFilledInput-root': {
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid white',
                  },
                  '& .MuiFilledInput-root::before': {
                    borderBottom: '1px solid white',
                  },
                  '& .MuiFilledInput-root::after': {
                    borderBottom: '1px solid white',
                  },
                  '& .MuiInputLabel-root': {
                    color: 'white',
                    transform: 'translate(40px, 25px) scale(1)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'white',
                    transform: 'translate(15px, 4px) scale(0.75)',
                  },
                  '& .MuiInputLabel-root.MuiFormLabel-filled': {
                    color: 'white',
                    transform: 'translate(15px, 4px) scale(0.75)',
                  },
                }}
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </div>
            <div className="flex justify-between mt-4">
              <label className="text-white flex items-center"></label>
              <a href="/forgotPass" className="text-yellow-500">Forgot password?</a>
            </div>
            <button type='submit' className="bg-[#5cb85c] text-white rounded-md cursor-pointer block py-2 px-8 mx-auto mt-6 hover:bg-[#449D44]">LOG IN</button>
            <p className="mt-6 text-white text-center">
              Don't have an account?
              <a href="/signup" className="text-yellow-500 ml-1">Sign up here</a>
            </p>
          </div>
        </Box>
      </div>
    </div>
  );
}

export default Login;
