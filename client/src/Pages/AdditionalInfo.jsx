import React, { useState, useEffect } from "react";
import { TextField, Box, FormControl, InputLabel, Select, MenuItem, Button } from "@mui/material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import signupLogoSrc from '../assets/img/nu_webp.webp';
import Loader from "../hooks/Loader";

const AdditionalInfo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [offices, setOffices] = useState([]); // State to store offices
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    dept: '',
    position: '',
    idNum1: '',
    idNum2: ''
  });

  // Fetch offices from API when position changes
  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const response = await axios.get('/api/offices', {
          params: { position: data.position }
        });
        setOffices(response.data);
      } catch (error) {
        console.error("Error fetching offices:", error);
        toast.error('Failed to load offices');
      }
    };

    if (data.position) {
      fetchOffices();
    }
  }, [data.position]);

  const handleIdNumChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value) && value.length <= (name === 'idNum1' ? 2 : 4)) {
      setData({ ...data, [name]: value });
    }
  };

  const UserAddInfo = async (e) => {
    e.preventDefault();

    const { firstName, lastName, dept, position, idNum1, idNum2 } = data;

    try {
      setIsLoading(true);

      const response = await axios.post('/api/addInfo', {
        firstName, lastName, dept, position, idNum1, idNum2
      });
      const result = response.data;

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        setData({ firstName: '', lastName: '', dept: '', position: '', idNum1: '', idNum2: '' });
        toast.success('Additional Information Submitted!');
        navigate('/login');
      }
    } catch (error) {
      toast.error('Error submitting form');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-[#35408e] p-8 rounded-2xl shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={signupLogoSrc} alt="NU LOGO" className="w-36 h-auto" />
        </div>
        <Box component="form" autoComplete='off' noValidate onSubmit={UserAddInfo}>
          <div id="input" className="space-y-6">
            <h1 className="text-2xl font-bold underline text-white text-center">Additional Information</h1>
            <div className="space-y-4">

              <TextField
                variant='filled'
                label='First Name'
                fullWidth
                aria-label="First Name"
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
                onChange={(e) => setData({ ...data, firstName: e.target.value })}
              />

              <TextField
                variant='filled'
                label='Last Name'
                fullWidth
                aria-label="Last Name"
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
                onChange={(e) => setData({ ...data, lastName: e.target.value })}
              />

              <FormControl variant="filled" fullWidth>
                <InputLabel id="position-label" style={{ color: 'white' }}>Position</InputLabel>
                <Select
                  labelId="position-label"
                  aria-labelledby="position-label"
                  aria-label="Position"
                  sx={{
                    '.MuiSelect-filled': {
                      color: 'white',
                    },
                    '.MuiSelect-icon': {
                      color: 'white',
                    },
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid white',
                    '& .Mui-focused .MuiSelect-filled': {
                      backgroundColor: 'transparent',
                    },
                    '& .Mui-focused': {
                      borderColor: 'white',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    }
                  }}
                  value={data.position}
                  required
                  onChange={(e) => setData({ ...data, position: e.target.value })}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="ASP">ASP</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="Faculty">Faculty</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="Facilities Employee">Facilities Employee</MenuItem>
                </Select>
              </FormControl>

              <FormControl variant="filled" fullWidth>
                <InputLabel id="dept-label" style={{ color: 'white' }}>Department</InputLabel>
                <Select
                  labelId="dept-label"
                  aria-labelledby="dept-label"
                  aria-label="Department"
                  sx={{
                    '.MuiSelect-filled': {
                      color: 'white',
                    },
                    '.MuiSelect-icon': {
                      color: 'white',
                    },
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid white',
                    '& .Mui-focused .MuiSelect-filled': {
                      backgroundColor: 'transparent',
                    },
                    '& .Mui-focused': {
                      borderColor: 'white',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'white',
                    }
                  }}
                  value={data.dept}
                  required
                  onChange={(e) => setData({ ...data, dept: e.target.value })}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {offices.map((office) => (
                    <MenuItem key={office._id} sx={{ color: 'black' }} value={office.name}>
                      {office.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <div className="flex items-center space-x-2">
                <TextField
                  variant='filled'
                  label='ID Number 1'
                  fullWidth
                  aria-label="ID Number 1"
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
                    },
                  }}
                  name="idNum1"
                  value={data.idNum1}
                  required
                  onChange={handleIdNumChange}
                />

                <span
                  style={{
                    color: 'white',
                    fontSize: '24px',
                    lineHeight: '30px',
                  }}
                >
                  -
                </span>

                <TextField
                  variant='filled'
                  label='ID Number 2'
                  fullWidth
                  aria-label="ID Number 2"
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
                    },
                  }}
                  name="idNum2"
                  value={data.idNum2}
                  required
                  onChange={handleIdNumChange}
                />
              </div>

            </div>
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
                cursor: 'pointer',
                marginTop: 2,
                '&:hover': {
                  backgroundColor: '#e0e0e0',
                },
              }}
            >
              Submit
            </Button>
            <Loader isLoading={isLoading} />
          </div>
        </Box>
      </div>
    </div>
  );
};

export default AdditionalInfo;