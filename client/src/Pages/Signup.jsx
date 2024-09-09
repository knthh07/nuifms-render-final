import React, { useState } from "react";
import { IconButton, InputAdornment, TextField, Box } from "@mui/material";
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import signupLogoSrc from '../assets/img/nu_banner2.png';
import backgroundImage from '../assets/img/jhocsonPic.jpg';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleEmailChange = (e) => {
    const email = DOMPurify.sanitize(e.target.value).trim(); // Ensure trimmed input
    setData({ ...data, email });

    // Regex to check if email matches the specified domain
    const emailDomainRegex = /^[a-zA-Z0-9._%+-]+@(students|faculty|admin)\.national-u\.edu\.ph$/;
    if (!emailDomainRegex.test(email)) {
      setEmailError('Please provide a valid email.');
    } else {
      setEmailError('');
    }
  };

  const registerUser = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = data;

    const sanitizedData = {
      firstName: DOMPurify.sanitize(firstName),
      lastName: DOMPurify.sanitize(lastName),
      email: DOMPurify.sanitize(email),
      password: DOMPurify.sanitize(password),
      confirmPassword: DOMPurify.sanitize(confirmPassword),
    };

    if (firstName.length > 16 || lastName.length > 16) {
      toast.error('First Name and Last Name must be 16 characters or fewer');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('/api/signup', sanitizedData);

      const result = response.data;
      if (result.error) {
        toast.error(result.error);
      } else {
        setData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
        toast.success('Register Successful. Welcome!');
        navigate('/addInfo');
      }
    } catch (error) {
      console.error('Error submitting form', error.response ? error.response.data : error.message);
      toast.error('Error submitting form');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-[#35408e] p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={signupLogoSrc} alt="NU LOGO" className="w-36 h-auto" />
        </div>
        <Box component="form" autoComplete='off' noValidate onSubmit={registerUser}>
          <div id="input" className="space-y-6">
            <h1 className="text-2xl font-bold text-white text-center">Register</h1>
            <div className="space-y-4">
              <TextField
                variant='filled'
                label='First Name'
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
                value={data.firstName}
                required
                onChange={(e) => setData({ ...data, firstName: DOMPurify.sanitize(e.target.value) })}
              />

              <TextField
                variant='filled'
                label='Last Name'
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
                value={data.lastName}
                required
                onChange={(e) => setData({ ...data, lastName: DOMPurify.sanitize(e.target.value) })}
              />

              <TextField
                variant='filled'
                label='Email'
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
                value={data.email}
                required
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
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowPassword}
                        edge="end"
                        style={{ color: "white" }} // Change the icon color to white
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
                value={data.password}
                required
                onChange={(e) => setData({ ...data, password: DOMPurify.sanitize(e.target.value) })}
              />

              <TextField
                variant='filled'
                label='Confirm Password'
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                InputLabelProps={{
                  style: { color: 'white' },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={toggleShowConfirmPassword}
                        edge="end"
                        style={{ color: "white" }} // Change the icon color to white
                      >
                        {showConfirmPassword ? <VisibilityOff style={{ color: 'white' }} /> : <Visibility style={{ color: 'white' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
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
                value={data.confirmPassword}
                required
                onChange={(e) => setData({ ...data, confirmPassword: DOMPurify.sanitize(e.target.value) })}
              />

            </div>

            <button type='submit' className="bg-[#5cb85c] text-white border-none rounded-md cursor-pointer block py-2 px-8 mx-auto hover:bg-[#449D44]">Sign Up</button>

            <p className="mt-6 text-white font-Arial text-center text-sm">Already have an account?
              <a href="/login" className="ml-2 text-white text-bold hover:text-gray-500 font-semi-bold underline">Login</a>
            </p>
          </div>
        </Box>
      </div>
    </div>
  );
};

export default Signup;
