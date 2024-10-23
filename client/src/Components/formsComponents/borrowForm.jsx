import React, { useState, useEffect } from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const BorrowForm = () => {
    const [jobOrder, setJobOrder] = useState({
        name: '',
        reqOffice: '',
        location: '',
        position: '',
        jobDesc: '',
    });

    // Fetch user profile when the component mounts
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/profile');
                const userData = response.data;
                setJobOrder((prevJobOrder) => ({ ...prevJobOrder, name: userData.name }));
            } catch (error) {
                console.error('Error fetching user profile:', error);
                toast.error('Error fetching user profile');
            }
        };

        fetchUserProfile();
    }, []);

    const submitJobOrder = async (e) => {
        e.preventDefault();
        const { name, reqOffice, location, position, jobDesc } = jobOrder;
        try {
            const response = await axios.post('/api/addJobOrder', {
                name, reqOffice, location, position, jobDesc
            });
            const result = response.data;
            if (result.error) {
                toast.error(result.error);
            } else {
                setJobOrder({ name: '', reqOffice: '', location: '', position: '', jobDesc: '' });
                toast.success('Job Order Submitted');
            }
        } catch (error) {
            console.error('Error submitting Job Order', error.response ? error.response.data : error.message);
            toast.error('Error submitting Job Order');
        }
    };

    return (
        <div>
            <Box component="form" autoComplete='off' noValidate onSubmit={submitJobOrder}>
                <div className="flex justify-center items-center">
                    <div className="w-[77%] ml-[20%] mt-3 bg-white rounded-lg shadow-md p-8 space-y-4">
                        <Typography variant="h6">Borrow Form</Typography>

                        <TextField
                            label="Name of Personnel"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            value={jobOrder.name}
                            onChange={(e) => setJobOrder({ ...jobOrder, name: e.target.value })}
                        />

                        <TextField
                            select
                            label="Requesting Office/College"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            value={jobOrder.reqOffice}
                            onChange={(e) => setJobOrder({ ...jobOrder, reqOffice: e.target.value })}
                        >
                            <MenuItem value="College of Engineering">College of Engineering</MenuItem>
                            <MenuItem value="College of Computing and Information Technology">College of Computing and Information Technology</MenuItem>
                            <MenuItem value="College of Accounting and Business Management">College of Accounting and Business Management</MenuItem>
                        </TextField>

                        <TextField
                            label="Location"
                            placeholder='Building/Floor/Room Number'
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            value={jobOrder.location}
                            onChange={(e) => setJobOrder({ ...jobOrder, location: e.target.value })}
                        />

                        <TextField
                            label="Description of Job/Work Request"
                            multiline
                            rows={4}
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            value={jobOrder.jobDesc}
                            onChange={(e) => setJobOrder({ ...jobOrder, jobDesc: e.target.value })}
                        />
                        <Button
                            variant="contained"
                            component="label"
                        >
                            Choose File
                            <input type="file" hidden />
                        </Button>

                        <Typography variant="body2">Please upload square image, size less than 100KB</Typography>

                        <Button variant="contained" type="submit">
                            Submit
                        </Button>
                    </div>
                </div>
            </Box>
        </div>
    );
};

export default BorrowForm;
