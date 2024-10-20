import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Button, MenuItem, TextField, Typography, FormHelperText } from '@mui/material';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Loader from '../../hooks/Loader';

const data = {
    "National University Manila": {
        "MAIN BUILDING": {
            "GROUND": [
                "HEALTH SERVICES",
                "LOGISTICS/PURCHASING",
                "NATIONAL UNIVERSITY ALUMNI FOUNDATION INC",
                "MOTORPOOL",
                "ASSET MANAGEMENT OFFICE",
                "PHYSICAL FACILITIES MANAGEMENT OFFICE",
                "BULLDOGS EXCHANGE"
            ],
            "SECOND": [
                "TREASURY OFFICE",
                "ADMISSIONS",
                "REGISTRAR"
            ],
            "THIRD": [
                "COLLEGE OF ALLIED HEALTH",
            ],
            "FOURTH": [
                "RESEARCH AND DEVELOPMENT",
                "IT SYSTEMS OFFICE",
                "FACULTY AND ADMINISTRATION OFFICE",
                "QMO MANILA",
                "SAFETY OFFICE",
                "AVP-ACADEMIC SERVICES",
                "AVP-ADMINISTRATION",
                "VP-OPERATIONS"
            ],
            "FIFTH": [
                "ACADEME INTERNSHIP AND PLACEMENT OFFICE",
                "DATA PRIVACY OFFICE",
                "EDUCATION TECHNOLOGY",
                "CCIT",
            ],
            "SIXTH": ["ROOMS"],
            "SEVENTH": ["COLLEGE OF TOURISM AND HOSPITALITY MANAGEMENT"],
            "EIGHTH": ["ATHLETICS OFFICE"],
        },
        "ANNEX": {
            "GROUND": [
                "ALUMNI/MARKETING AND COMMUNICATIONS OFFICE - MANILA"
            ],
            "SECOND": [
                "LEARNING RESOURCE CENTER"
            ],
            "THIRD": [
                "COMEX/NSTP",
                "NUCSG OFFICE",
                "STUDENT DEVELOPMENT AND ACTIVITIES OFFICE",
                "ATHLETE ACADEMIC DEVELOPMENT OFFICE",
                "COLLEGE OF ENGINEERING",
            ],
            "FOURTH": [
                "GENERAL ACCOUNTING AND BUDGETING - MANILA",
                "HUMAN RESOURCES - MANILA",
                "GUIDANCE SERVICES OFFICE",
                "CENTER FOR INNOVATIVE AND SUSTAINABLE DEVELOPMENT",
                "INTERNATIONAL STUDENT SERVICES OFFICE",
            ],
            "FIFTH": [
                "ROOMS"
            ],
            "SIXTH": ["ROOMS"],
            "SEVENTH": ["CEAS"],
        },
        "ANNEX II": {
            "GROUND": [
                "FACULTY OFFICE",
                "HEALTH SERVICES",
                "GYM",
                "STUDENT SERVICES",
                "CANTEEN",

            ],
            "SECOND": [
                "ROOMS"
            ],
            "THIRD": [
                "ROOMS",
            ],
            "FOURTH": [
                "LEARNING RESOURCE CENTER",
            ],
        },
        "OSIAS": {
            "GROUND": [
                "CORPORATE MARKETING AND COMMUNICATION OFFICE",
                "ALUMNI OFFICE",
                "LEGACY OFFICE",
                "SAFETY AND SECURITY",
            ],
            "SECOND": [
                "QUALITY MANAGEMENT OFFICE",
                "CONSTRUCTION AND FACILITIES MANAGEMENT OFFICE",
                "OFFICE OF THE PRESIDENT",
                "BUSINESS DEVELOPMENT AND LINKAGES",
                "VP-CORPORATE AFFAIRS",
                "CFO",
                "AVP-ADMINISTRATIVE SERVICES",
                "VP-ADMINISTRATIVE SERVICES",
            ],
            "THIRD": [
                "PAYROLL OFFICE",
                "HUMAN RESOURCES - SHARED SERVICES",
                "FINANCE SHARED",
                "TECHNOLOGY SERVICES OFFICE",
                "GAO/CIO",
                "ACADEMIC TECHNOLOGY OFFICE",
            ],
        },
    },
};

const jobOrderTypes = ['Maintenance', 'Borrowing', 'Repair', 'Installation']; // Dropdown for Job Order Types
const scenarios = ['Broken', 'Busted', 'Slippery', 'Leaking']; // Dropdown for Scenario
const objects = ['Computer', 'Floor', 'Door', 'Chair', 'Window']; // Dropdown for Object

const JobOrderForm = () => {
    const [jobOrder, setJobOrder] = useState({
        firstName: '',
        lastName: '',
        reqOffice: '',
        campus: '',
        building: '',
        floor: '',
        position: '',
        jobDesc: '',
        file: null,
        jobType: '', // New State for Job Order Type
        scenario: '', // New State for Scenario
        object: '', // New State for Object
        dateOfRequest: '', // New state for Date of Request
    });

    const [isLoading, setIsLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [fileName, setFileName] = useState('');

    const handleCampusChange = useCallback((e) => {
        const campus = e.target.value;
        setJobOrder((prev) => ({ ...prev, campus, building: '', floor: '', reqOffice: '' }));
        setBuildings(Object.keys(data[campus] || {}));
        setFloors([]);
        setRooms([]);
    }, []);

    const handleBuildingChange = useCallback((e) => {
        const building = e.target.value;
        setJobOrder((prev) => ({ ...prev, building, floor: '', reqOffice: '' }));
        const selectedCampusData = data[jobOrder.campus];
        setFloors(Object.keys(selectedCampusData[building] || {}));
        setRooms([]);
    }, [jobOrder.campus]);

    const handleFloorChange = useCallback((e) => {
        const floor = e.target.value;
        setJobOrder((prev) => ({ ...prev, floor, reqOffice: '' }));
        const selectedCampusData = data[jobOrder.campus];
        setRooms(selectedCampusData[jobOrder.building][floor] || []);
    }, [jobOrder.campus, jobOrder.building]);

    const handleRoomChange = useCallback((e) => {
        setJobOrder((prev) => ({ ...prev, reqOffice: e.target.value }));
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setJobOrder(prev => ({ ...prev, file }));
        setFileName(file ? file.name : '');
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/profile', { withCredentials: true });
                const userData = response.data;
                setJobOrder((prevJobOrder) => ({ ...prevJobOrder, firstName: userData.firstName, lastName: userData.lastName, position: userData.position }));
            } catch (error) {
                console.error('Error fetching user profile:', error);
                toast.error('Error fetching user profile');
            }
        };
        fetchUserProfile();
    }, []);

    const submitJobOrder = useCallback(async (e) => {
        e.preventDefault();

        const { firstName, lastName, reqOffice, campus, building, floor, position, jobDesc, file, jobType, scenario, object, dateOfRequest } = jobOrder;

        // Sanitize job description
        const sanitizedJobDesc = DOMPurify.sanitize(jobDesc);

        if (!firstName || !lastName || !reqOffice || !building || !floor || !campus || !position || !sanitizedJobDesc || !jobType || !dateOfRequest) {
            return toast.error('All required fields must be filled out.');
        }

        try {
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('reqOffice', reqOffice);
            formData.append('campus', campus);
            formData.append('building', building);
            formData.append('floor', floor);
            formData.append('position', position);
            formData.append('jobDesc', sanitizedJobDesc); // Use sanitized job description
            formData.append('jobType', jobType); // Add job type
            formData.append('scenario', scenario); // Add scenario
            formData.append('object', object); // Add object
            formData.append('dateOfRequest', dateOfRequest); // New state for Date of Request

            if (file) {
                formData.append('file', file);
            }

            setIsLoading(true);

            const response = await axios.post('/api/addJobOrder', formData);

            const data = response.data;

            if (data.error) {
                setIsLoading(false);
                toast.error(data.error);
            } else {
                setIsLoading(false);
                setJobOrder(prev => ({ ...prev, reqOffice: '', campus: '', building: '', floor: '', jobDesc: '', file: null, jobType: '', scenario: '', object: '' }));
                toast.success('Job Order Submitted');
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            return toast.error('Server Error');

        }
    }, [jobOrder]);

    return (
        <Box sx={{ backgroundColor: '#f0f0f0', padding: 3, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Job Order Form</Typography>
            <form onSubmit={submitJobOrder}>
                <TextField
                    required
                    label="First Name"
                    value={jobOrder.firstName}
                    onChange={(e) => setJobOrder(prev => ({ ...prev, firstName: e.target.value }))}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    required
                    label="Last Name"
                    value={jobOrder.lastName}
                    onChange={(e) => setJobOrder(prev => ({ ...prev, lastName: e.target.value }))}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    required
                    label="Campus"
                    select
                    value={jobOrder.campus}
                    onChange={handleCampusChange}
                    fullWidth
                    margin="normal"
                >
                    {Object.keys(data).map((campus) => (
                        <MenuItem key={campus} value={campus}>{campus}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    required
                    label="Building"
                    select
                    value={jobOrder.building}
                    onChange={handleBuildingChange}
                    fullWidth
                    margin="normal"
                >
                    {buildings.map((building) => (
                        <MenuItem key={building} value={building}>{building}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    required
                    label="Floor"
                    select
                    value={jobOrder.floor}
                    onChange={handleFloorChange}
                    fullWidth
                    margin="normal"
                >
                    {floors.map((floor) => (
                        <MenuItem key={floor} value={floor}>{floor}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    required
                    label="Room"
                    select
                    value={jobOrder.reqOffice}
                    onChange={handleRoomChange}
                    fullWidth
                    margin="normal"
                >
                    {rooms.map((room) => (
                        <MenuItem key={room} value={room}>{room}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    required
                    label="Position"
                    value={jobOrder.position}
                    onChange={(e) => setJobOrder(prev => ({ ...prev, position: e.target.value }))}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    required
                    label="Job Description"
                    value={jobOrder.jobDesc}
                    onChange={(e) => setJobOrder(prev => ({ ...prev, jobDesc: e.target.value }))}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={4}
                />
                <TextField
                    required
                    label="Date of Request"
                    type="date"
                    value={jobOrder.dateOfRequest}
                    onChange={(e) => setJobOrder(prev => ({ ...prev, dateOfRequest: e.target.value }))}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
                <TextField
                    required
                    label="Job Type"
                    select
                    value={jobOrder.jobType}
                    onChange={(e) => setJobOrder(prev => ({ ...prev, jobType: e.target.value }))}
                    fullWidth
                    margin="normal"
                >
                    {jobOrderTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    required
                    label="Scenario"
                    select
                    value={jobOrder.scenario}
                    onChange={(e) => setJobOrder(prev => ({ ...prev, scenario: e.target.value }))}
                    fullWidth
                    margin="normal"
                >
                    {scenarios.map((scenario) => (
                        <MenuItem key={scenario} value={scenario}>{scenario}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    required
                    label="Object"
                    select
                    value={jobOrder.object}
                    onChange={(e) => setJobOrder(prev => ({ ...prev, object: e.target.value }))}
                    fullWidth
                    margin="normal"
                >
                    {objects.map((object) => (
                        <MenuItem key={object} value={object}>{object}</MenuItem>
                    ))}
                </TextField>
                <Button variant="contained" component="label" fullWidth>
                    Upload File
                    <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                    />
                </Button>
                <FormHelperText>{fileName}</FormHelperText>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Submit
                </Button>
            </form>
            <Loader isLoading={isLoading} />
        </Box>
    );
};

export default JobOrderForm;
