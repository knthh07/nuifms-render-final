import React, { useState } from "react";
import { TextField, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import signupLogoSrc from '../assets/img/nu_logo.webp';
import Loader from "../hooks/Loader";

const AdditionalInfo = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    dept: '',
    position: '',
    idNum1: '',
    idNum2: ''
  });

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
                aria-label="First Name" // Adding aria-label
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
                aria-label="Last Name" // Adding aria-label
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

                  {/* National University Manila - Main */}
                  <MenuItem sx={{ color: 'black' }} value="HEALTH SERVICES">HEALTH SERVICES</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="LOGISTICS/PURCHASING">LOGISTICS/PURCHASING</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="NATIONAL UNIVERSITY ALUMNI FOUNDATION INC">NATIONAL UNIVERSITY ALUMNI FOUNDATION INC</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="MOTORPOOL">MOTORPOOL</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="ASSET MANAGEMENT OFFICE">ASSET MANAGEMENT OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="PHYSICAL FACILITIES MANAGEMENT OFFICE">PHYSICAL FACILITIES MANAGEMENT OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="BULLDOGS EXCHANGE">BULLDOGS EXCHANGE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="TREASURY OFFICE">TREASURY OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="ADMISSIONS">ADMISSIONS</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="REGISTRAR">REGISTRAR</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="COLLEGE OF ALLIED HEALTH">COLLEGE OF ALLIED HEALTH</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="RESEARCH AND DEVELOPMENT">RESEARCH AND DEVELOPMENT</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="IT SYSTEMS OFFICE">IT SYSTEMS OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="FACULTY AND ADMINISTRATION OFFICE">FACULTY AND ADMINISTRATION OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="QMO MANILA">QMO MANILA</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="SAFETY OFFICE">SAFETY OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="AVP-ACADEMIC SERVICES">AVP-ACADEMIC SERVICES</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="AVP-ADMINISTRATION">AVP-ADMINISTRATION</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="VP-OPERATIONS">VP-OPERATIONS</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="ACADEME INTERNSHIP AND PLACEMENT OFFICE">ACADEME INTERNSHIP AND PLACEMENT OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="DATA PRIVACY OFFICE">DATA PRIVACY OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="EDUCATION TECHNOLOGY">EDUCATION TECHNOLOGY</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="CCIT">COLLEGE OF COMPUTING AND INFORMATION TECHNOLOGIES</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT">COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="ATHLETICS OFFICE">ATHLETICS OFFICE</MenuItem>

                  {/* National University Annex */}
                  <MenuItem sx={{ color: 'black' }} value="ALUMNI/MARKETING AND COMMUNICATIONS OFFICE - MANILA">ALUMNI/MARKETING AND COMMUNICATIONS OFFICE - MANILA</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="LEARNING RESOURCE CENTER">LEARNING RESOURCE CENTER</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="COMEX/NSTP">COMEX/NSTP</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="NUCSG OFFICE">NUCSG OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="STUDENT DEVELOPMENT AND ACTIVITIES OFFICE">STUDENT DEVELOPMENT AND ACTIVITIES OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="ATHLETE ACADEMIC DEVELOPMENT OFFICE">ATHLETE ACADEMIC DEVELOPMENT OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="COLLEGE OF ENGINEERING">COLLEGE OF ENGINEERING</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="GENERAL ACCOUNTING AND BUDGETING - MANILA">GENERAL ACCOUNTING AND BUDGETING - MANILA</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="HUMAN RESOURCES - MANILA">HUMAN RESOURCES - MANILA</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="GUIDANCE SERVICES OFFICE">GUIDANCE SERVICES OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="CENTER FOR INNOVATIVE AND SUSTAINABLE DEVELOPMENT">CENTER FOR INNOVATIVE AND SUSTAINABLE DEVELOPMENT</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="INTERNATIONAL STUDENT SERVICES OFFICE">INTERNATIONAL STUDENT SERVICES OFFICE</MenuItem>

                  {/* National University OSIAS */}
                  <MenuItem sx={{ color: 'black' }} value="CORPORATE MARKETING AND COMMUNICATION OFFICE">CORPORATE MARKETING AND COMMUNICATION OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="ALUMNI OFFICE">ALUMNI OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="LEGACY OFFICE">LEGACY OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="SAFETY AND SECURITY">SAFETY AND SECURITY</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="QUALITY MANAGEMENT OFFICE">QUALITY MANAGEMENT OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="CONSTRUCTION AND FACILITIES MANAGEMENT OFFICE">CONSTRUCTION AND FACILITIES MANAGEMENT OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="OFFICE OF THE PRESIDENT">OFFICE OF THE PRESIDENT</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="BUSINESS DEVELOPMENT AND LINKAGES">BUSINESS DEVELOPMENT AND LINKAGES</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="VP-CORPORATE AFFAIRS">VP-CORPORATE AFFAIRS</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="CFO">CFO</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="AVP-ADMINISTRATIVE SERVICES">AVP-ADMINISTRATIVE SERVICES</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="VP-ADMINISTRATIVE SERVICES">VP-ADMINISTRATIVE SERVICES</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="PAYROLL OFFICE">PAYROLL OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="HUMAN RESOURCES - SHARED SERVICES">HUMAN RESOURCES - SHARED SERVICES</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="FINANCE SHARED">FINANCE SHARED</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="TECHNOLOGY SERVICES OFFICE">TECHNOLOGY SERVICES OFFICE</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="GAO/CIO">GAO/CIO</MenuItem>
                  <MenuItem sx={{ color: 'black' }} value="ACADEMIC TECHNOLOGY OFFICE">ACADEMIC TECHNOLOGY OFFICE</MenuItem>
                </Select>
              </FormControl>

              <FormControl variant="filled" fullWidth>
                <InputLabel id="position-label" style={{ color: 'white' }}>Position</InputLabel>
                <Select
                  labelId="position-label"
                  aria-labelledby="position-label" // Associate label with the Select component
                  aria-label="Position" // Adding aria-label
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

              <div className="flex space-x-2">
                <TextField
                  variant='filled'
                  label='ID Number 1'
                  fullWidth
                  aria-label="ID Number 1" // Adding aria-label
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
                  name="idNum1"
                  value={data.idNum1}
                  required
                  onChange={handleIdNumChange}
                />

                <TextField
                  variant='filled'
                  label='ID Number 2'
                  fullWidth
                  aria-label="ID Number 2" // Adding aria-label
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
                  name="idNum2"
                  value={data.idNum2}
                  required
                  onChange={handleIdNumChange}
                />
              </div>
            </div>
            <button type='submit' className="bg-white text-[#35408e] rounded-md cursor-pointer block py-2 px-8 mx-auto mt-6 hover:bg-[#e0e0e0] border border-white">
              Submit
            </button>
            <Loader isLoading={isLoading} />
          </div>
        </Box>
      </div>
    </div>
  );
};

export default AdditionalInfo;
