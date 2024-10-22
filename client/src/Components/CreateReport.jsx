import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, Tooltip } from '@mui/material';
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
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [department, setDepartment] = useState('');
    const [building, setBuilding] = useState('');
    const [campus, setCampus] = useState('');
    const [jobOrders, setJobOrders] = useState([]);
    const [userName, setUserName] = useState('');
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [reqOffice, setReqOffice] = useState([]); // Changed from rooms to reqOffice

    // Fetch user profile to get the user's name
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/profile', { withCredentials: true });
                const userData = response.data;
                setUserName(`${userData.firstName} ${userData.lastName}`); // Set user's name
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };
        fetchUserProfile();
    }, []);

    // Fetch job orders dynamically
    useEffect(() => {
        const fetchJobOrders = async () => {
            try {
                const response = await axios.get('/api/jobOrders', { params: { status: 'approved' }, withCredentials: true });
                setJobOrders(response.data.requests);  // Assuming response contains job orders in `requests`
            } catch (error) {
                console.error('Error fetching job orders:', error);
            }
        };

        fetchJobOrders();
    }, []);

    const handleCampusChange = useCallback((e) => {
        const selectedCampus = e.target.value;
        setCampus(selectedCampus);
        setBuilding('');
        setFloors([]);
        setReqOffice([]); // Changed from setRooms to setReqOffice
        setBuildings(Object.keys(data[selectedCampus] || {}));
    }, []);

    const handleBuildingChange = useCallback((e) => {
        const selectedBuilding = e.target.value;
        setBuilding(selectedBuilding);
        setFloors(Object.keys(data[campus][selectedBuilding] || {}));
        setReqOffice([]); // Changed from setRooms to setReqOffice
    }, [campus]);

    const handleFloorChange = useCallback((e) => {
        const selectedFloor = e.target.value;
        setFloors(selectedFloor);
        setReqOffice(data[campus][building][selectedFloor] || []); // Changed from setRooms to setReqOffice
    }, [campus, building]);

    const handleReqOfficeChange = useCallback((e) => {
        setReqOffice(e.target.value); // Changed from setRooms to setReqOffice
    }, []);

    const handleGenerateReport = async () => {
        try {
            const dateRange = startDate && endDate
                ? `${startDate.toISODate()}:${endDate.toISODate()}`
                : '';

            const response = await axios.get('/api/report', {
                params: {
                    specificTicket,
                    status,
                    dateRange,
                    department,
                    building,
                    campus,
                }
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

            const doc = new jsPDF();
            const logo = await import(/* webpackIgnore: true */ '../assets/img/nu_logo.png'); // Update the path to your logo

            // Add logo
            doc.addImage(logo.default, 'PNG', 10, 10, 50, 20); // Adjust the position and size as needed

            // Report Title
            doc.setFontSize(24);
            doc.setFont('Helvetica', 'bold');
            doc.text('Job Order Report', 70, 30);

            // User Information
            doc.setFontSize(12);
            doc.setFont('Helvetica', 'normal');
            doc.text(`Generated by: ${userName || 'N/A'}`, 10, 50); // Use fetched user name
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 60);

            doc.text(`Status: ${status || 'All'}`, 10, 80);
            doc.text(`Date Range: ${dateRange || 'N/A'}`, 10, 90);
            doc.text(`Department: ${department || 'N/A'}`, 10, 110);
            doc.text(`Building: ${building || 'N/A'}`, 10, 120);
            doc.text(`Campus: ${campus || 'N/A'}`, 10, 130);

            // Table header
            doc.autoTable({
                startY: 220,
                head: [['ID', 'Name', 'Status', 'Date']],
                body: requests.map(req => [
                    req._id,
                    `${req.firstName} ${req.lastName}`,
                    req.status,
                    new Date(req.createdAt).toLocaleDateString()
                ]),
                theme: 'grid', // You can change the table theme here
            });

            // Add signature section
            const signatureY = doc.autoTable.previous.finalY + 20;
            doc.text('________________________', 180, signatureY, { align: 'right' });
            doc.text('Signature', 180, signatureY + 10, { align: 'right' });

            // Additional placeholders for signatures
            doc.text('________________________', 30, signatureY, { align: 'left' });
            doc.text('Authorized Signature', 30, signatureY + 10, { align: 'left' });

            doc.save('Job_Order_Report.pdf');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error generating report. Please try again.'); // Show error toast
        }
    };

    const handleResetFilters = () => {
        setSpecificTicket('');
        setStatus('');
        setStartDate(null);
        setEndDate(null);
        setDepartment('');
        setBuilding('');
        setCampus('');
        setFloors([]);
        setReqOffice([]); // Changed from setRooms to setReqOffice
    };

    return (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
            <div className="flex">
                <div className="w-full">
                    <div className="w-[80%] ml-[20%] p-6">
                        <h2 className="text-2xl mb-4">Report</h2>
                        <div className="mb-6">
                            <FormControl fullWidth>
                                <InputLabel>Specific Ticket</InputLabel>
                                <Select
                                    value={specificTicket}
                                    onChange={(e) => setSpecificTicket(e.target.value)}
                                >
                                    {jobOrders.map(order => (
                                        <MenuItem key={order._id} value={order._id}>
                                            {`${order.firstName} ${order.lastName} - ${order.jobDesc}`} {/* Customize as needed */}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="status" className="block text-gray-700 font-semibold mb-2">Status:</label>
                            <select
                                id="status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="">All</option>
                                <option value="completed">Completed</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="dateRange" className="block text-gray-700 font-semibold mb-2">Date Range:</label>
                            <div className="flex space-x-4">
                                <DesktopDatePicker
                                    label="Start Date"
                                    inputFormat="yyyy-MM-dd"
                                    value={startDate}
                                    onChange={(newDate) => setStartDate(newDate)}
                                    slots={{ textField: (params) => <TextField {...params} fullWidth /> }}
                                />
                                <DesktopDatePicker
                                    label="End Date"
                                    inputFormat="yyyy-MM-dd"
                                    value={endDate}
                                    onChange={(newDate) => setEndDate(newDate)}
                                    slots={{ textField: (params) => <TextField {...params} fullWidth /> }}
                                />
                            </div>
                        </div>

                        {/* Campus Field */}
                        <TextField
                            id="campus"
                            name="campus"
                            select
                            label="Campus"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            value={campus}
                            onChange={handleCampusChange}
                            autoComplete="campus"
                            sx={{ backgroundColor: '#f8f8f8', mb: 2 }}
                        >
                            {Object.keys(data).map((campusName) => (
                                <MenuItem key={campusName} value={campusName}>
                                    {campusName}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Building Field */}
                        <TextField
                            id="building"
                            name="building"
                            select
                            label="Building"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            value={building}
                            onChange={handleBuildingChange}
                            autoComplete="building"
                            sx={{ backgroundColor: '#f8f8f8', mb: 2 }}
                        >
                            {buildings.map((buildingName) => (
                                <MenuItem key={buildingName} value={buildingName}>
                                    {buildingName}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Floor Field */}
                        <TextField
                            id="floor"
                            name="floor"
                            select
                            label="Floor"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            value={floors}
                            onChange={handleFloorChange}
                            autoComplete="floor"
                            sx={{ backgroundColor: '#f8f8f8', mb: 2 }}
                        >
                            {floors.map((floorName) => (
                                <MenuItem key={floorName} value={floorName}>
                                    {floorName}
                                </MenuItem>
                            ))}
                        </TextField>

                        {/* Request Office Field */}
                        <TextField
                            id="reqOffice"
                            name="reqOffice"
                            select
                            label="Request Office"
                            variant="outlined"
                            fullWidth
                            required
                            size="small"
                            value={reqOffice}
                            onChange={handleReqOfficeChange}
                            autoComplete="reqOffice"
                            sx={{ backgroundColor: '#f8f8f8', mb: 2 }}
                        >
                            {reqOffice.map((officeName) => (
                                <MenuItem key={officeName} value={officeName}>
                                    {officeName}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button variant="contained" onClick={handleGenerateReport}>
                            Generate Report
                        </Button>
                        <Button variant="outlined" onClick={handleResetFilters} className="ml-4">
                            Reset Filters
                        </Button>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default CreateReport;
