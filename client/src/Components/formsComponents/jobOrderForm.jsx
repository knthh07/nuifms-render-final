import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Divider, TextField, MenuItem, Button, Tooltip, FormHelperText } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Loader from '../../hooks/Loader';
import LayoutComponent from '../LayoutComponent';

const jobOrderTypes = ['Maintenance', 'Borrowing', 'Repair', 'Installation']; // Dropdown for Job Order Types

const scenarioToObjects = {
    Broken: { severity: 'Critical', objects: ['Computer', 'Projector', 'Air conditioner', 'Light switch', 'Desk', 'Elevator', 'Whiteboard', 'Printer'] },
    Busted: { severity: 'Moderate', objects: ['Fuse', 'Light bulb', 'Monitor', 'Electric outlet', 'Security camera', 'Speaker system', 'Router', 'Refrigerator'] },
    Slippery: { severity: 'Minor', objects: ['Floor', 'Stairs', 'Entrance', 'Bathroom tiles', 'Balcony'] },
    Leaking: { severity: 'Critical', objects: ['Faucet', 'Pipes', 'Roof', 'Water dispenser', 'Sink', 'Ceiling'] },
    Clogged: { severity: 'Minor', objects: ['Toilet', 'Drain', 'Sink', 'Gutter', 'AC Vent'] },
    Noisy: { severity: 'Minor', objects: ['Fan', 'Door', 'Ventilation system', 'Generator', 'AC unit'] },
    'Not Working': { severity: 'Critical', objects: ['Printer', 'Photocopier', 'Door lock', 'Smartboard', 'Projector', 'Microphone', 'Intercom system'] },
    Cracked: { severity: 'Moderate', objects: ['Window', 'Door', 'Floor tile', 'Wall', 'Whiteboard'] },
    'Burnt Out': { severity: 'Moderate', objects: ['Light bulb', 'Electric wiring', 'Fuse box', 'Outlet', 'Extension cord'] },
    Loose: { severity: 'Moderate', objects: ['Door knob', 'Cabinet handle', 'Table leg', 'Chair screws', 'Window lock'] },
};

// Function to sort scenarios based on severity
const sortedScenarios = Object.entries(scenarioToObjects)
    .sort((a, b) => {
        const severityOrder = { Critical: 3, Moderate: 2, Minor: 1 };
        return severityOrder[b[1].severity] - severityOrder[a[1].severity];
    });


const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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
        dateTo: '',
        dateFrom: '',
        file: null,
        jobType: '', // New State for Job Order Type
        scenario: '', // New State for Scenario
        object: '', // New State for Object
        dateOfRequest: new Date().toISOString().split('T')[0], // Set current date
    });

    const [data, setData] = useState([]); // Initialize as an empty array
    const [isLoading, setIsLoading] = useState(false);
    const [buildings, setBuildings] = useState([]); // Initialize as an empty array
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [fileName, setFileName] = useState('');
    const [objects, setObjects] = useState([]); // Dynamic objects based on scenario
    const [otherScenario, setOtherScenario] = useState('');
    const [otherObject, setOtherObject] = useState('');
    const [dateFrom, setDateFrom] = useState(null);
    const [dateTo, setDateTo] = useState(null);

    const handleCampusChange = useCallback((e) => {
        const selectedCampusName = e.target.value; // Get the campus name
        const selectedCampus = data.find(campus => campus.name === selectedCampusName); // Find the campus object

        setJobOrder(prev => ({
            ...prev,
            campus: selectedCampusName, // Save the name
            building: '',
            floor: '',
            reqOffice: ''
        }));
        setBuildings(selectedCampus ? selectedCampus.buildings : []); // Set buildings from the selected campus
        setFloors([]); // Reset floors and rooms
        setRooms([]);
    }, [data]);

    const handleBuildingChange = useCallback((e) => {
        const selectedBuildingName = e.target.value; // Get the building name
        setJobOrder((prev) => ({
            ...prev,
            building: selectedBuildingName, // Save the name
            floor: '',
            reqOffice: ''
        }));

        const selectedCampusData = data.find(campus => campus.name === jobOrder.campus); // Find campus by name
        if (selectedCampusData) {
            const selectedBuildingData = selectedCampusData.buildings.find(b => b.name === selectedBuildingName);
            if (selectedBuildingData) {
                setFloors(selectedBuildingData.floors || []); // Set floors from the selected building
            } else {
                setFloors([]); // Reset floors if building is not found
            }
        } else {
            setFloors([]); // Reset floors if campus is not found
        }
    }, [data, jobOrder.campus]);

    const handleFloorChange = useCallback((e) => {
        const selectedFloorName = e.target.value; // Get the floor name
        setJobOrder((prev) => ({
            ...prev,
            floor: selectedFloorName, // Save the name
            reqOffice: ''
        }));

        const selectedCampusData = data.find(campus => campus.name === jobOrder.campus); // Find campus by name
        if (selectedCampusData) {
            const selectedBuildingData = selectedCampusData.buildings.find(b => b.name === jobOrder.building);
            if (selectedBuildingData) {
                const selectedFloorData = selectedBuildingData.floors.find(f => f.number === selectedFloorName);
                setRooms(selectedFloorData?.offices || []); // Update rooms based on the selected floor's offices
            } else {
                setRooms([]); // Reset rooms if building is not found
            }
        } else {
            setRooms([]); // Reset rooms if campus is not found
        }
    }, [data, jobOrder.campus, jobOrder.building]);

    const handleRoomChange = useCallback((e) => {
        const reqOffice = e.target.value; // Get the value of the selected room
        setJobOrder((prev) => ({ ...prev, reqOffice })); // Update the reqOffice in jobOrder state
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        // Check if a file was selected
        if (file) {
            // Check file size
            if (file.size > MAX_FILE_SIZE) {
                // Show an error message if the file exceeds the size limit
                toast.error("File size too large. Maximum size is 10 MB.");
                // Optionally, reset the input field
                e.target.value = '';
                return; // Exit the function if the file is too large
            }

            // If the file is valid, update the jobOrder state and file name
            setJobOrder(prev => ({ ...prev, file }));
            setFileName(file.name);
        } else {
            // Reset the file if no file is selected
            setJobOrder(prev => ({ ...prev, file: null }));
            setFileName('');
        }
    };

    const handleScenarioChange = (e) => {
        const selectedScenario = e.target.value;
        setJobOrder(prev => ({ ...prev, scenario: selectedScenario, object: '' }));
        setObjects(scenarioToObjects[selectedScenario] || []);
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get('/api/profile', { withCredentials: true });
                const userData = response.data;
                setJobOrder((prevJobOrder) => ({ ...prevJobOrder, firstName: userData.firstName, lastName: userData.lastName, position: userData.position }));
            } catch (error) {
                console.error('Error fetching user profile:', error);
                toast.error('Error fetching user profile');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const fetchCampusData = async () => {
            try {
                const response = await axios.get('/api/campuses', { withCredentials: true });
                setData(response.data);
            } catch (error) {
                console.error('Error fetching campus data:', error);
                toast.error('Error loading campus data');
            }
        };
        fetchCampusData();
    }, []);

    const submitJobOrder = useCallback(async (e) => {
        e.preventDefault();

        // Determine the requesting office to submit
        const reqOfficeToSubmit = jobOrder.reqOffice === 'Other' ? jobOrder.otherReqOffice : jobOrder.reqOffice;

        // Determine scenario and object to submit
        const scenarioToSubmit = jobOrder.scenario === 'Other' ? otherScenario : jobOrder.scenario;
        const objectToSubmit = jobOrder.object === 'Other' ? otherObject : jobOrder.object;

        const { firstName, lastName, campus, building, floor, position, jobDesc, dateTo, dateFrom, file, jobType, dateOfRequest } = jobOrder;

        // Sanitize job description
        const sanitizedJobDesc = DOMPurify.sanitize(jobDesc);

        // Validate required fields
        if (!firstName || !lastName || !reqOfficeToSubmit || !building || !floor || !campus || !position || !sanitizedJobDesc || !jobType || !dateOfRequest) {
            return toast.error('All required fields must be filled out.');
        }

        try {
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('reqOffice', reqOfficeToSubmit); // Use reqOfficeToSubmit here
            formData.append('campus', campus);
            formData.append('building', building);
            formData.append('floor', floor);
            formData.append('position', position);
            formData.append('dateTo', dateTo);
            formData.append('dateFrom', dateFrom);
            formData.append('jobDesc', sanitizedJobDesc); // Use sanitized job description
            formData.append('jobType', jobType); // Add job type
            formData.append('scenario', scenarioToSubmit); // Add scenario
            formData.append('object', objectToSubmit); // Add object
            formData.append('dateOfRequest', dateOfRequest); // New state for Date of Request

            if (file) {
                formData.append('file', file);
            }

            setIsLoading(true);

            const response = await axios.post('/api/addJobOrder', formData);
            const data = response.data;

            if (data.error) {
                setIsLoading(false);
                toast.error(data.error); // Corrected the reference here
            } else {
                setIsLoading(false);
                // Reset jobOrder state after submission
                setJobOrder(prev => ({
                    ...prev,
                    reqOffice: '',
                    otherReqOffice: '',
                    campus: '',
                    building: '',
                    floor: '',
                    jobDesc: '',
                    dateTo: '',
                    dateFrom: '',
                    file: null,
                    jobType: '',
                    scenario: '',
                    object: '',
                    otherObject: '',
                    otherScenario: '',

                }));
                toast.success('Job Order Submitted');
            }
        } catch (error) {
            setIsLoading(false);
            return toast.error('Server Error');
        }
    }, [jobOrder]); // Add otherScenario and otherObject to the dependency array

    const maxLength = 250;
    const charactersLeft = maxLength - jobOrder.jobDesc.length;

    return (
        <LayoutComponent>
            <div className="flex items-center p-4"> {/* Align buttons horizontally */}
                {/* Back Button */}
                <Link to="/UserDashboardComponent" className="text-decoration-none">
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #3f51b5', // Primary color border
                            color: '#3f51b5',
                            '&:hover': {
                                backgroundColor: '#3f51b5', // Darken on hover
                                color: '#fff', // Change text color on hover
                            },
                            marginRight: '16px', // Space between the back button and the title
                        }}
                    >
                        Back
                    </Button>
                </Link>
            </div>
            <Box autoComplete="off" sx={{ padding: 2, maxWidth: 800, margin: 'auto' }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#35408e', fontWeight: 'bold' }}>
                    Job Order Report Generation
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Use the filters below to specify criteria for your report. You can filter by campus, building, and floor to
                    view job orders specific to a department or office. If no specific criteria are selected, all available records will be shown.
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box
                    component="form"
                    autoComplete="off"
                    noValidate
                    onSubmit={submitJobOrder}
                    encType="multipart/form-data"
                >
                    <div className="flex">
                        <div className="flex-wrap justify-between p-4 y-4 w-full">
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
                                    mb: 2
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
                                value={jobOrder.campus} // This should hold the name
                                onChange={handleCampusChange}
                                autoComplete="campus"
                                sx={{ mb: 2 }}
                            >
                                {data.map((campus) => (
                                    <MenuItem key={campus._id} value={campus.name}> {/* Change value to campus.name */}
                                        {campus.name} {/* Display the campus name */}
                                    </MenuItem>
                                ))}
                            </TextField>

                            {/* Warning for building, floor, and reqOffice */}
                            <Tooltip title="Please select a campus first." arrow disableHoverListener={!!jobOrder.campus}>
                                <Box mb={2}>
                                    {/* Group for Building and Floor */}
                                    <Box display="flex" gap={2} mb={2}>
                                        <TextField
                                            id="building"
                                            name="building"
                                            select
                                            label="Building"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={jobOrder.building} // This should hold the building name
                                            onChange={handleBuildingChange}
                                            disabled={!jobOrder.campus}
                                            autoComplete="building"
                                        >
                                            {data.find(campus => campus.name === jobOrder.campus)?.buildings.map((building) => (
                                                <MenuItem key={building._id} value={building.name}> {/* Change value to building.name */}
                                                    {building.name}
                                                </MenuItem>
                                            )) || (
                                                    <MenuItem disabled>No buildings available</MenuItem>
                                                )}
                                        </TextField>

                                        <TextField
                                            id="floor"
                                            name="floor"
                                            select
                                            label="Floor"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={jobOrder.floor} // This should hold the floor name
                                            onChange={handleFloorChange}
                                            disabled={!jobOrder.building}
                                            autoComplete="floor"
                                        >
                                            {floors.map((floor) => (
                                                <MenuItem key={floor._id} value={floor.number}> {/* Change value to floor.number */}
                                                    {floor.number} {/* Assuming `number` is the floor name */}
                                                </MenuItem>
                                            )) || (
                                                    <MenuItem disabled>No floors available</MenuItem>
                                                )}
                                        </TextField>
                                    </Box>

                                    {/* Requesting Office/College Field Below */}
                                    <TextField
                                        id="reqOffice"
                                        name="reqOffice"
                                        select
                                        label="Requesting Office/College"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={jobOrder.reqOffice} // This should hold the room name
                                        onChange={handleRoomChange}
                                        required
                                        disabled={!jobOrder.floor} // Disable if no floor is selected
                                        autoComplete="req-office"
                                    >
                                        {rooms.length > 0 ? (
                                            rooms.map((room) => (
                                                <MenuItem key={room._id} value={room.name}> {/* Change value to room.name */}
                                                    {room.name} {/* Display the room name */}
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>No rooms available</MenuItem>
                                        )}
                                        <MenuItem key="other" value="Other">
                                            Other
                                        </MenuItem>
                                    </TextField>

                                    {/* Conditional TextField for "Other" */}
                                    {jobOrder.reqOffice === 'Other' && (
                                        <TextField
                                            id="otherReqOffice"
                                            name="otherReqOffice"
                                            label="Please specify"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={jobOrder.otherReqOffice || ''}
                                            onChange={(e) => setJobOrder({ ...jobOrder, otherReqOffice: e.target.value })}
                                            sx={{ mt: 2 }}
                                        />
                                    )}
                                </Box>
                            </Tooltip>

                            {/* <TextField
                            id="position"
                            name="position"
                            label="Position"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            disabled
                            value={jobOrder.position}
                            onChange={(e) => setJobOrder({ ...jobOrder, position: e.target.value })}
                            autoComplete="position"
                            sx={{
                                mb: 2,
                            }}
                        /> */}

                            {/* Additional dropdowns for Scenario and Object */}
                            <Tooltip title="Please select a scenario first." arrow disableHoverListener={!jobOrder.scenario}>
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
                                        onChange={(e) => {
                                            const selectedScenario = e.target.value;
                                            setJobOrder({ ...jobOrder, scenario: selectedScenario, object: '' }); // Clear object if scenario changes
                                            if (selectedScenario !== 'Other') {
                                                setOtherScenario(''); // Clear otherScenario if not 'Other'
                                            }
                                            setObjects(selectedScenario === 'Other' ? [] : scenarioToObjects[selectedScenario]?.objects || []);
                                        }}
                                        autoComplete="scenario"

                                    >
                                        {sortedScenarios.map(([scenario, { severity }]) => (
                                            <MenuItem
                                                key={scenario}
                                                value={scenario}
                                                sx={{
                                                    backgroundColor: severity === "Critical" ? "#ffcccc" : // Light red for Critical
                                                        severity === "Moderate" ? "#ffffcc" : // Light yellow for Moderate
                                                            "#ccffcc", // Light green for Minor
                                                    '&:hover': {
                                                        backgroundColor: severity === "Critical" ? "#ff9999" : // Darker red on hover
                                                            severity === "Moderate" ? "#ffff99" : // Darker yellow on hover
                                                                "#99ff99", // Darker green on hover
                                                    },
                                                }}
                                            >
                                                {scenario} - Severity: {severity}
                                            </MenuItem>
                                        ))}
                                        <MenuItem value="Other">Other</MenuItem> {/* Added 'Other' option */}
                                    </TextField>

                                    {jobOrder.scenario === 'Other' && (
                                        <TextField
                                            id="otherScenario"
                                            name="otherScenario"
                                            label="Please specify other scenario"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={otherScenario}
                                            onChange={(e) => setOtherScenario(e.target.value)}
                                            autoComplete="other-scenario"

                                        />
                                    )}
                                </Box>
                            </Tooltip>

                            <Tooltip title="Please select an object first." arrow disableHoverListener={!jobOrder.object}>
                                <Box display="flex" gap={2} mb={2}>
                                    <TextField
                                        id="object"
                                        name="object"
                                        select
                                        label="Object"
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        value={jobOrder.object}
                                        onChange={(e) => {
                                            const selectedObject = e.target.value;
                                            setJobOrder({ ...jobOrder, object: selectedObject });
                                            if (selectedObject !== 'Other') {
                                                setOtherObject(''); // Clear otherObject if not 'Other'
                                            }
                                        }}
                                        autoComplete="object"
                                        disabled={!jobOrder.scenario}

                                    >
                                        {objects.map((object) => (
                                            <MenuItem key={object} value={object}>
                                                {object}
                                            </MenuItem>
                                        ))}
                                        <MenuItem value="Other">Other</MenuItem> {/* Added 'Other' option */}
                                    </TextField>

                                    {jobOrder.object === 'Other' && (
                                        <TextField
                                            id="otherObject"
                                            name="otherObject"
                                            label="Please specify other object"
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            value={otherObject}
                                            onChange={(e) => setOtherObject(e.target.value)}
                                            autoComplete="other-object"

                                        />
                                    )}
                                </Box>
                            </Tooltip>

                            {/* Experimental Note */}
                            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: -2 }}>
                                Note: This feature is experimental and may be subject to changes.
                            </Typography>

                            {/* Job Description */}
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

                                />
                                {charactersLeft < 0 && (
                                    <FormHelperText error>
                                        You have exceeded the character limit by {-charactersLeft} characters.
                                    </FormHelperText>
                                )}
                            </Box>

                            {/* Date Fields in the Same Row */}
                            <Box display="flex" gap={2} mb={2} mt={1}>
                                {/* Date From Field */}
                                <TextField
                                    id="dateFrom"
                                    name="dateFrom"
                                    label="Date From"
                                    type="date"
                                    variant="outlined"
                                    required
                                    size="small"
                                    value={jobOrder.dateFrom} // Use jobOrder state
                                    onChange={(e) => setJobOrder(prev => ({ ...prev, dateFrom: e.target.value }))}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    inputProps={{
                                        min: new Date().toISOString().split("T")[0], // Restrict to today or future dates
                                    }}
                                    sx={{ flex: 1 }} // Ensure it takes equal space
                                />

                                {/* Date To Field */}
                                <TextField
                                    id="dateTo"
                                    name="dateTo"
                                    label="Date To"
                                    type="date"
                                    variant="outlined"
                                    required
                                    size="small"
                                    value={jobOrder.dateTo} // Use jobOrder state
                                    onChange={(e) => setJobOrder(prev => ({ ...prev, dateTo: e.target.value }))}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    sx={{ flex: 1 }} // Ensure it takes equal space
                                />
                            </Box>

                            {/* File Upload and Submit Button in a Single Row */}
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                {/* Upload Button */}
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="primary"
                                    disabled={isLoading}
                                    aria-label="Upload an image"
                                >
                                    Upload Image
                                    <input
                                        type="file"
                                        hidden
                                        onChange={handleFileChange}
                                        accept="image/jpeg, image/png"
                                    />
                                </Button>

                                {/* Display selected file name */}
                                {fileName && (
                                    <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                                        {fileName}
                                    </Typography>
                                )}

                                {/* Submit Button aligned to the right */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isLoading}
                                    sx={{
                                        maxWidth: '150px', // Adjust width as needed
                                    }}
                                >
                                    {isLoading ? 'Submitting...' : 'Submit'}
                                </Button>
                            </Box>
                            <Loader isLoading={isLoading} />
                        </div>
                    </div>
                </Box>
            </Box>
        </LayoutComponent>
    );
};

export default JobOrderForm;

