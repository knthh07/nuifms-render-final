import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
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
    const [campus, setCampus] = useState('');
    const [building, setBuilding] = useState('');
    const [floor, setFloor] = useState('');
    const [reqOffice, setReqOffice] = useState('');
    const [jobOrders, setJobOrders] = useState([]);
    const [userName, setUserName] = useState('');
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [rooms, setRooms] = useState([]);

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get('/api/profile', { withCredentials: true });
                const userData = response.data;
                setUserName(`${userData.firstName} ${userData.lastName}`);
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
                setJobOrders(response.data.requests);
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
        setFloor('');
        setReqOffice('');
        setBuildings(Object.keys(data[selectedCampus] || {}));
        setFloors([]);
        setRooms([]);
    }, []);

    const handleBuildingChange = useCallback((e) => {
        const selectedBuilding = e.target.value;
        setBuilding(selectedBuilding);
        setFloor('');
        setReqOffice('');
        const selectedCampusData = data[campus];
        setFloors(Object.keys(selectedCampusData[selectedBuilding] || {}));
        setRooms([]);
    }, [campus]);

    const handleFloorChange = useCallback((e) => {
        const selectedFloor = e.target.value;
        setFloor(selectedFloor);
        setReqOffice('');
        const selectedCampusData = data[campus];
        setRooms(selectedCampusData[building][selectedFloor] || []);
    }, [campus, building]);

    const handleRoomChange = useCallback((e) => {
        setReqOffice(e.target.value);
    }, []);

    const handleGenerateReport = async () => {
        try {
            const dateRange = startDate && endDate ? `${startDate.toISODate()}:${endDate.toISODate()}` : '';
            const { data } = await axios.get('/api/report', {
                params: { specificTicket, status, dateRange, department, building, campus }
            });
            const requests = data.requests;
    
            if (!requests.length) {
                toast.error('No results found for the specified filters.');
                return;
            }
    
            const doc = new jsPDF();
            const logo = await import(/* webpackIgnore: true */ '../assets/img/nu_logo.png');
    
            // Add logo
            doc.addImage(logo.default, 'PNG', 10, 10, 50, 20);
            
            // Report Title
            doc.setFontSize(24).setFont('Helvetica', 'bold').text('Job Order Report', 70, 30);
    
            // User Information
            doc.setFontSize(12).setFont('Helvetica', 'normal')
                .text(`Generated by: ${userName || 'N/A'}`, 10, 50)
                .text(`Generated on: ${new Date().toLocaleString()}`, 10, 60);
    
            // Filters Information
            doc.setFontSize(12).setFont('Helvetica', 'normal');
            doc.text('Filters Applied:', 10, 80);
            const filterData = [
                `Status: ${status || 'All'}`,
                `Date Range: ${dateRange ? `${startDate.toISODate()} to ${endDate.toISODate()}` : 'N/A'}`,
                `Department: ${department || 'N/A'}`,
                `Building: ${building || 'N/A'}`,
                `Campus: ${campus || 'N/A'}`
            ];
            filterData.forEach((line, index) => {
                doc.text(line, 10, 90 + index * 10);
            });
    
            // Table header
            doc.autoTable({
                startY: 140,
                head: [['ID', 'Name', 'Status', 'Date']],
                body: requests.map(req => [
                    req._id,
                    `${req.firstName} ${req.lastName}`,
                    req.status,
                    new Date(req.createdAt).toLocaleDateString()
                ]),
                theme: 'grid',
                styles: { fontSize: 10 },
                headStyles: { fillColor: [22, 160, 133] },
                didParseCell: (data) => {
                    // Apply styles for each cell in the body
                    if (data.row.index === 0) {
                        data.cell.styles.fillColor = [22, 160, 133]; // Greenish color for header
                        data.cell.styles.textColor = [255, 255, 255]; // White text for header
                    }
                },
            });
    
            // Signature section
            const signatureY = doc.autoTable.previous.finalY + 20;
            doc.setFontSize(12).setFont('Helvetica', 'normal')
                .text('________________________', 180, signatureY, { align: 'right' })
                .text('Signature', 180, signatureY + 10, { align: 'right' });
    
            doc.save('Job_Order_Report.pdf');
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error generating report. Please try again.');
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
    };

    return (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
            <div className="flex">
                <div className="w-full">
                    <div className="w-[80%] ml-[20%] p-6">
                        <h2 className="text-2xl mb-4">Report</h2>
                        <div className="mb-6">
                            <FormControl fullWidth>
                                <InputLabel>Campus</InputLabel>
                                <Select
                                    value={campus}
                                    onChange={handleCampusChange}
                                >
                                    {Object.keys(data).map((campusName) => (
                                        <MenuItem key={campusName} value={campusName}>
                                            {campusName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="mb-6">
                            <FormControl fullWidth>
                                <InputLabel>Building</InputLabel>
                                <Select
                                    value={building}
                                    onChange={handleBuildingChange}
                                    disabled={!campus}
                                >
                                    {buildings.map((buildingName) => (
                                        <MenuItem key={buildingName} value={buildingName}>
                                            {buildingName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="mb-6">
                            <FormControl fullWidth>
                                <InputLabel>Floor</InputLabel>
                                <Select
                                    value={floor}
                                    onChange={handleFloorChange}
                                    disabled={!building}
                                >
                                    {floors.map((floorName) => (
                                        <MenuItem key={floorName} value={floorName}>
                                            {floorName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="mb-6">
                            <FormControl fullWidth>
                                <InputLabel>Required Office</InputLabel>
                                <Select
                                    value={reqOffice}
                                    onChange={handleRoomChange}
                                    disabled={!floor}
                                >
                                    {rooms.map((roomName) => (
                                        <MenuItem key={roomName} value={roomName}>
                                            {roomName}
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
                        <div className="flex justify-between">
                            <Button variant="contained" color="primary" onClick={handleGenerateReport}>
                                Generate Report
                            </Button>
                            <Button variant="outlined" onClick={handleResetFilters}>
                                Reset
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default CreateReport;
