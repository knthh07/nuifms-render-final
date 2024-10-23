import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';

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

const CreateReport = () => {
    const [specificTicket, setSpecificTicket] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [department, setDepartment] = useState('');
    const [building, setBuilding] = useState('');
    const [campus, setCampus] = useState('');
    const [jobOrders, setJobOrders] = useState([]);
    const [userName, setUserName] = useState('');
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [floor, setFloor] = useState('');
    const [reqOffice, setReqOffice] = useState('');
    const [tickets, setTickets] = useState([]); // State for tickets

    useEffect(() => {
        const fetchUserProfile = async () => {
            // Fetch user profile
        };
        fetchUserProfile();
    }, []);

    useEffect(() => {
        const fetchJobOrders = async () => {
            // Fetch job orders
        };
        fetchJobOrders();
    }, []);

    // Fetch tickets when the component mounts
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await axios.get('/api/tickets'); // Adjust API endpoint as necessary
                setTickets(response.data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
                toast.error('Failed to fetch tickets.');
            }
        };
        fetchTickets();
    }, []);

    const handleCampusChange = useCallback((e) => {
        // Handle campus change
    }, []);

    const handleBuildingChange = useCallback((e) => {
        // Handle building change
    }, [campus]);

    const handleFloorChange = useCallback((e) => {
        // Handle floor change
    }, [campus, building]);

    const handleReqOfficeChange = useCallback((e) => {
        // Handle reqOffice change
    }, []);

    const handleGenerateReport = async () => {
        try {
            const response = await axios.get('/api/report', {
                params: {
                    specificTicket,
                    status,
                    dateRange: `${startDate.toISOString().split('T')[0]}:${endDate.toISOString().split('T')[0]}`,
                    department,
                    building,
                    campus,
                    reqOffice,
                },
            });

            const requests = response.data.requests;

            if (requests.length === 0) {
                toast('No results found for the specified filters.', {
                    icon: '⚠️',
                    style: {
                        border: '1px solid #FFA500',
                        color: '#FFA500',
                    },
                });
                return;
            }

            const doc = new jsPDF('landscape');

            const logo = await import('../assets/img/nu_logo_new.png');

            // Add logo
            doc.addImage(logo.default, 'PNG', 10, 10, 50, 20);

            // Report Title
            doc.setFontSize(24);
            doc.setFont('Helvetica', 'bold');
            doc.text('Job Order Report', 70, 30);

            // User Information
            doc.setFontSize(12);
            doc.setFont('Helvetica', 'normal');
            doc.text(`Generated by: ${userName || 'N/A'}`, 10, 50);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 60);

            // Table header
            doc.autoTable({
                startY: 140,
                head: [['First Name', 'Last Name', 'Job Description', 'Request Office', 'Date', 'Status']],
                body: requests.map(req => [
                    req.firstName,
                    req.lastName,
                    req.jobDesc,
                    req.reqOffice,
                    req.dateOfRequest,
                    req.status,
                ]),
            });

            doc.save('job_order_report.pdf');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Failed to generate report.');
        }
    };

    const handleResetFilters = () => {
        setSpecificTicket('');
        setStatus('');
        setStartDate(new Date());
        setEndDate(new Date());
        setDepartment('');
        setBuilding('');
        setCampus('');
        setReqOffice('');
        setFloor('');
    };

    return (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', flex: '1', marginLeft: '21vw' }}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Campus</InputLabel>
                    <Select value={campus} onChange={handleCampusChange}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {Object.keys(data).map((campusName) => (
                            <MenuItem key={campusName} value={campusName}>
                                {campusName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" disabled={!campus}>
                    <InputLabel>Building</InputLabel>
                    <Select value={building} onChange={handleBuildingChange}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {buildings.map((buildingName) => (
                            <MenuItem key={buildingName} value={buildingName}>
                                {buildingName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" disabled={!building}>
                    <InputLabel>Floor</InputLabel>
                    <Select value={floor} onChange={handleFloorChange}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {floors.map((floorName) => (
                            <MenuItem key={floorName} value={floorName}>
                                {floorName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" disabled={!floor}>
                    <InputLabel>Requesting Office</InputLabel>
                    <Select value={reqOffice} onChange={handleReqOfficeChange}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {(data[campus]?.[building]?.[floor] || []).map((officeName) => (
                            <MenuItem key={officeName} value={officeName}>
                                {officeName}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Specific Ticket</InputLabel>
                    <Select value={specificTicket} onChange={(e) => setSpecificTicket(e.target.value)}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        {tickets.map((ticket) => (
                            <MenuItem key={ticket.id} value={ticket.id}>
                                {ticket.title} {/* Assuming ticket object has id and title */}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                </FormControl>

                <Box display="flex" justifyContent="space-between" marginTop="1rem">
                    <DesktopDatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />

                    <DesktopDatePicker
                        label="End Date"
                        value={endDate}
                        onChange={(date) => setEndDate(date)}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />
                </Box>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                    <Button variant="contained" onClick={handleGenerateReport}>
                        Generate Report
                    </Button>

                    <Button variant="outlined" onClick={handleResetFilters}>
                        Reset Filters
                    </Button>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default CreateReport;