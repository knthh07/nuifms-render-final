import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { toast } from 'react-hot-toast';
import Loader from '../hooks/Loader';

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
    const [specificJobOrder, setSpecificJobOrder] = useState('');
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
    const [floor, setFloor] = useState('');
    const [reqOffice, setReqOffice] = useState('');
    const [isLoading, setLoading] = useState(true);

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

    useEffect(() => {
        const fetchAllJobOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/api/job-orders', { withCredentials: true });
                setJobOrders(response.data.jobOrders || []);
            } catch (error) {
                console.error('Error fetching job orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllJobOrders();
    }, []);

    const handleCampusChange = useCallback((e) => {
        const selectedCampus = e.target.value;
        setCampus(selectedCampus);
        setBuilding('');
        setFloors([]);
        setReqOffice('');
        setBuildings(Object.keys(data[selectedCampus] || {}));
    }, []);

    const handleBuildingChange = useCallback((e) => {
        const selectedBuilding = e.target.value;
        setBuilding(selectedBuilding);
        const availableFloors = Object.keys(data[campus][selectedBuilding] || {});
        setFloors(availableFloors);
        setReqOffice('');
    }, [campus]);

    const handleFloorChange = useCallback((e) => {
        const selectedFloor = e.target.value;
        setFloor(selectedFloor);
        const offices = data[campus][building][selectedFloor] || [];
        setReqOffice(offices.length > 0 ? offices[0] : '');
    }, [campus, building]);

    const handleReqOfficeChange = useCallback((e) => {
        setReqOffice(e.target.value);
    }, []);

    const handleGenerateReport = async () => {
        try {
            setLoading(true);
            const dateRange = startDate && endDate
                ? `${startDate.toISODate()}:${endDate.toISODate()}`
                : '';

            const response = await axios.get('/api/report', {
                params: {
                    specificJobOrder,
                    status,
                    dateRange,
                    reqOffice,
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

            const doc = new jsPDF('landscape');
            const logo = await import('../assets/img/nu_logo_new.png');

            doc.addImage(logo.default, 'PNG', 10, 10, 50, 20);
            doc.setFontSize(24);
            doc.setFont('Helvetica', 'bold');
            doc.text('Job Order Report', 70, 30);
            doc.setFontSize(12);
            doc.setFont('Helvetica', 'normal');
            doc.text(`Generated by: ${userName || 'N/A'}`, 10, 50);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 60);

            doc.autoTable({
                startY: 140,
                head: [['First Name', 'Last Name', 'Request Office', 'Date']],
                body: requests.map(req => [
                    req.firstName,
                    req.lastName,
                    req.reqOffice,
                    req.dateOfRequest
                ])
            });

            doc.save('job_order_report.pdf');
            toast.success('Report Generated!')
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('An error occurred while generating the report.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSpecificJobOrder('');
        setStatus('');
        setStartDate(null);
        setEndDate(null);
        setDepartment('');
        setBuilding('');
        setCampus('');
        setFloors([]);
        setReqOffice(''); // Reset to an empty string
    };

    return (
        <div className="w-[80%] ml-[20%] p-6">
            <Box sx={{ padding: 2 }}>
                <FormControl fullWidth margin="normal">
                    <InputLabel id="campus-label">Campus</InputLabel>
                    <Select
                        labelId="campus-label"
                        value={campus}
                        onChange={handleCampusChange}
                    >
                        {Object.keys(data).map((campusName) => (
                            <MenuItem key={campusName} value={campusName}>{campusName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="building-label">Building</InputLabel>
                    <Select
                        labelId="building-label"
                        value={building}
                        onChange={handleBuildingChange}
                        disabled={!campus}
                    >
                        {buildings.map((buildingName) => (
                            <MenuItem key={buildingName} value={buildingName}>{buildingName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="floor-label">Floor</InputLabel>
                    <Select
                        labelId="floor-label"
                        value={floor}
                        onChange={handleFloorChange}
                        disabled={!building}
                    >
                        {floors.map((floorName) => (
                            <MenuItem key={floorName} value={floorName}>{floorName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="reqOffice-label">Requesting Office</InputLabel>
                    <Select
                        labelId="reqOffice-label"
                        value={reqOffice}
                        onChange={handleReqOfficeChange}
                        disabled={!floor}
                    >
                        {data[campus]?.[building]?.[floor]?.map((office) => (
                            <MenuItem key={office} value={office}>{office}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="specificJobOrder-label">Specific Job Order</InputLabel>
                    <Select
                        labelId="specificJobOrder-label"
                        value={specificJobOrder}
                        onChange={(e) => setSpecificJobOrder(e.target.value)}
                    >
                        {jobOrders && jobOrders.length > 0 ? (
                            jobOrders.map((jobOrder) => (
                                <MenuItem key={jobOrder._id} value={jobOrder._id}>
                                    {jobOrder.jobDesc}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No Job Orders Available</MenuItem>
                        )}
                    </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterLuxon}>
                    <DesktopDatePicker
                        label="Start Date"
                        inputFormat="MM/dd/yyyy"
                        value={startDate}
                        onChange={setStartDate}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />
                    <DesktopDatePicker
                        label="End Date"
                        inputFormat="MM/dd/yyyy"
                        value={endDate}
                        onChange={setEndDate}
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                    />
                </LocalizationProvider>

                <FormControl fullWidth margin="normal">
                    <InputLabel id="status-label">Status</InputLabel>
                    <Select
                        labelId="status-label"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                </FormControl>

                <Button variant="contained" onClick={handleGenerateReport} fullWidth>
                    Generate Report
                </Button>

                <Button variant="contained" onClick={handleResetFilters}>
                    Reset Filters
                </Button>
            </Box>
            <Loader isLoading={isLoading} />
        </div>
    );
};

export default CreateReport;