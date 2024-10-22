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
        "JMB": {
            "GROUND": ["SECURITY OFFICE"],
            "SECOND": ["ROOMS"],
            "THIRD": ["DISCIPLINE OFFICE"],
            "FOURTH": ["ROOMS"],
            "FIFTH": ["LEARNING RESOURCE CENTER"],
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
            "EIGHTH": ["ROOMS"],
            "NINTH": ["ROOMS"],
            "TENTH": ["ROOMS"],
            "ELEVENTH": ["ROOMS"],
            "TWELFTH": ["GYM"],
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

const scenarioToObjects = {
    Broken: ['Computer', 'Projector', 'Air conditioner', 'Light switch', 'Desk', 'Elevator', 'Whiteboard', 'Printer'],
    Busted: ['Fuse', 'Light bulb', 'Monitor', 'Electric outlet', 'Security camera', 'Speaker system', 'Router', 'Refrigerator'],
    Slippery: ['Floor', 'Stairs', 'Entrance', 'Bathroom tiles', 'Balcony'],
    Leaking: ['Faucet', 'Pipes', 'Roof', 'Water dispenser', 'Sink', 'Ceiling'],
    Clogged: ['Toilet', 'Drain', 'Sink', 'Gutter', 'AC Vent'],
    Noisy: ['Fan', 'Door', 'Ventilation system', 'Generator', 'AC unit'],
    'Not Working': ['Printer', 'Photocopier', 'Door lock', 'Smartboard', 'Projector', 'Microphone', 'Intercom system'],
    Cracked: ['Window', 'Door', 'Floor tile', 'Wall', 'Whiteboard'],
    'Burnt Out': ['Light bulb', 'Electric wiring', 'Fuse box', 'Outlet', 'Extension cord'],
    Loose: ['Door knob', 'Cabinet handle', 'Table leg', 'Chair screws', 'Window lock'],
};

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
        dateOfRequest: new Date().toISOString().split('T')[0], // Set current date
    });

    const [isLoading, setIsLoading] = useState(false);
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [fileName, setFileName] = useState('');
    const [objects, setObjects] = useState([]); // Dynamic objects based on scenario

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

    const handleScenarioChange = (e) => {
        const selectedScenario = e.target.value;
        setJobOrder(prev => ({ ...prev, scenario: selectedScenario, object: '' }));
        setObjects(scenarioToObjects[selectedScenario] || []);
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
                toast.error(result.error);
            } else {
                setIsLoading(false);
                setJobOrder(prev => ({ ...prev, reqOffice: '', campus: '', building: '', floor: '', jobDesc: '', file: null, jobType: '', scenario: '', object: '' }));
                toast.success('Job Order Submitted');
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error)
            return toast.error('Server Error');

        }
    }, [jobOrder]);

    const maxLength = 250;
    const charactersLeft = maxLength - jobOrder.jobDesc.length;

    return (
        <Box
            component="form"
            autoComplete="off"
            noValidate
            onSubmit={submitJobOrder}
            encType="multipart/form-data"
            sx={{ padding: 4, backgroundColor: '#f1f1f1', borderRadius: 2 }} // Removed boxShadow
        >
            <div className="flex">
                <div className="w-[80%] ml-[20%] p-6 space-y-4">
                    <Typography variant="h5" gutterBottom>Job Order</Typography>

                    {/* Job Order Type Dropdown */}
                    <TextField
                        id="jobOrderType"
                        name="jobOrderType"
                        select
                        label="Job Order Type"
                        variant="outlined"
                        fullWidth
                        required
                        size="small"
                        value={jobOrder.jobType}
                        onChange={(e) => setJobOrder({ ...jobOrder, jobType: e.target.value })}
                        autoComplete="job-order-type"
                        sx={{
                            backgroundColor: '#f8f8f8',
                            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                        }}
                    >
                        {jobOrderTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        id="campus"
                        name="campus"
                        select
                        label="Campus"
                        variant="outlined"
                        fullWidth
                        required
                        size="small"
                        value={jobOrder.campus}
                        onChange={handleCampusChange}
                        autoComplete="campus"
                        sx={{
                            backgroundColor: '#f8f8f8',
                            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                        }}
                    >
                        {Object.keys(data).map((campus) => (
                            <MenuItem key={campus} value={campus}>
                                {campus}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        id="personnelName"
                        name="personnelName"
                        label="Name of Personnel"
                        variant="outlined"
                        fullWidth
                        required
                        size="small"
                        disabled
                        value={jobOrder.firstName + " " + jobOrder.lastName}
                        onChange={(e) => {
                            const [firstName, lastName] = e.target.value.split(' ');
                            setJobOrder({ ...jobOrder, firstName, lastName });
                        }}
                        autoComplete="name"
                        sx={{
                            backgroundColor: '#f8f8f8',
                            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                        }}
                    />

                    <TextField
                        id="dateOfRequest"
                        name="dateOfRequest"
                        label="Date of Request"
                        type="date"
                        fullWidth
                        required
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        value={jobOrder.dateOfRequest}
                        disabled // Disable the field
                        sx={{
                            backgroundColor: '#f8f8f8',
                            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                        }}
                    />

                    <Box display="flex" gap={2} mb={2}>
                        <TextField
                            id="building"
                            name="building"
                            select
                            label="Building"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={jobOrder.building}
                            onChange={handleBuildingChange}
                            disabled={!jobOrder.campus}
                            autoComplete="building"
                            sx={{
                                backgroundColor: '#f8f8f8',
                                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                            }}
                        >
                            {buildings.map((building) => (
                                <MenuItem key={building} value={building}>
                                    {building}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            id="floor"
                            name="floor"
                            select
                            label="Floor"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={jobOrder.floor}
                            onChange={handleFloorChange}
                            disabled={!jobOrder.building}
                            autoComplete="floor"
                            sx={{
                                backgroundColor: '#f8f8f8',
                                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                            }}
                        >
                            {floors.map((floor) => (
                                <MenuItem key={floor} value={floor}>
                                    {floor}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            id="reqOffice"
                            name="reqOffice"
                            select
                            label="Requesting Office/College"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={jobOrder.reqOffice}
                            onChange={handleRoomChange}
                            required
                            disabled={!jobOrder.floor}
                            autoComplete="req-office"
                            sx={{
                                backgroundColor: '#f8f8f8',
                                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                            }}
                        >
                            {rooms.map((room) => (
                                <MenuItem key={room} value={room}>
                                    {room}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <TextField
                        id="position"
                        name="position"
                        label="Position"
                        variant="outlined"
                        fullWidth
                        required
                        size="small"
                        disabled
                        value={jobOrder.position}
                        onChange={(e) => {
                            const [position] = e.target.value;
                            setJobOrder({ ...jobOrder, position });
                        }}
                        autoComplete="position"
                        sx={{
                            backgroundColor: '#f8f8f8',
                            boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                        }}
                    />

                    {/* Additional dropdowns for Scenario and Object */}
                    <Box display="flex" gap={2} mb={2}>
                        <TextField
                            id="scenario"
                            name="scenario"
                            select
                            label="Scenario"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={jobOrder.scenario}
                            onChange={handleScenarioChange}
                            autoComplete="scenario"
                            sx={{
                                backgroundColor: '#f8f8f8',
                                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                            }}
                        >
                            {Object.keys(scenarioToObjects).map((scenario) => (
                                <MenuItem key={scenario} value={scenario}>
                                    {scenario}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            id="object"
                            name="object"
                            select
                            label="Object"
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={jobOrder.object}
                            onChange={(e) => setJobOrder({ ...jobOrder, object: e.target.value })}
                            autoComplete="object"
                            disabled={!jobOrder.scenario}
                            sx={{
                                backgroundColor: '#f8f8f8',
                                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                            }}
                        >
                            {objects.map((object) => (
                                <MenuItem key={object} value={object}>
                                    {object}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Box>
                        <TextField
                            id="jobDescription"
                            name="jobDescription"
                            label="Job Description"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            multiline
                            rows={3}
                            value={jobOrder.jobDesc}
                            onChange={e => setJobOrder({ ...jobOrder, jobDesc: e.target.value })}
                            inputProps={{ maxLength: maxLength }}
                            helperText={`${charactersLeft} characters left`}
                            autoComplete="job-description"
                            sx={{
                                backgroundColor: '#f8f8f8',
                                boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.7)'
                            }}
                        />
                        {charactersLeft < 0 && (
                            <FormHelperText error>
                                You have exceeded the character limit by {-charactersLeft} characters.
                            </FormHelperText>
                        )}
                    </Box>

                    <Box display="flex" gap={2} alignItems="center" mt={2}>
                        <Button
                            variant="contained"
                            component="label"
                            color="primary"
                            disabled={isLoading}
                        >
                            Upload Image
                            <input
                                type="file"
                                hidden
                                onChange={handleFileChange}
                                accept="image/jpeg, image/png"
                            />
                        </Button>
                        {fileName && (
                            <Typography variant="body2" color="textSecondary">
                                {fileName}
                            </Typography>
                        )}
                    </Box>

                    <Box mt={4}>
                        <Button type="submit" variant="contained" color="primary" fullWidth disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                    <Loader isLoading={isLoading} />
                </div>
            </div>
        </Box>
    );
};

export default JobOrderForm;

