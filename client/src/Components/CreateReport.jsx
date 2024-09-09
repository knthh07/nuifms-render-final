import React, { useState } from "react";
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'; // Changed adapter
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { TextField } from '@mui/material';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const CreateReport = () => {
    const [reportType, setReportType] = useState('day');
    const [specificTicket, setSpecificTicket] = useState('');
    const [status, setStatus] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [userId, setUserId] = useState('');

    const handleGenerateReport = async () => {
        try {
            const dateRange = startDate && endDate
                ? `${startDate.toISODate()}:${endDate.toISODate()}`
                : '';

            const response = await axios.get('/api/report', {
                params: { reportType, specificTicket, status, dateRange, userId }
            });
            const requests = response.data.requests;

            const docDefinition = {
                content: [
                    { text: 'Job Order Report', style: 'header' },
                    { text: `Report Type: ${reportType}`, style: 'subheader' },
                    { text: `Status: ${status || 'All'}`, style: 'subheader' },
                    { text: `Date Range: ${dateRange || 'N/A'}`, style: 'subheader' },
                    { text: `User ID: ${userId || 'N/A'}`, style: 'subheader' },
                    { text: `Generated on: ${new Date().toLocaleString()}`, style: 'subheader', margin: [0, 0, 0, 20] },
                    {
                        table: {
                            headerRows: 1,
                            body: [
                                ['ID', 'Name', 'Status', 'Date'],
                                ...requests.map(req => [
                                    req._id,
                                    req.firstName + ' ' + req.lastName,
                                    req.status,
                                    new Date(req.createdAt).toLocaleDateString()
                                ])
                            ]
                        }
                    },
                    { text: ' ', margin: [0, 30, 0, 0] },
                    { text: '________________________', alignment: 'right', margin: [0, 20, 0, 0] },
                    { text: 'Signature', alignment: 'right' }
                ],
                styles: {
                    header: {
                        fontSize: 22,
                        bold: true,
                        margin: [0, 0, 0, 10]
                    },
                    subheader: {
                        fontSize: 14,
                        bold: false,
                        margin: [0, 0, 0, 5]
                    }
                }
            };

            pdfMake.createPdf(docDefinition).download('Job_Order_Report.pdf');
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterLuxon}>
            <div className="flex">
                <div className="w-full">
                    <div className="w-[77%] ml-[21.5%] mt-8 bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl mb-4">Report</h2>
                        <div className="mb-6">
                            <label htmlFor="reportType" className="block text-gray-700 font-semibold mb-2">Report Type:</label>
                            <select
                                id="reportType"
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded"
                            >
                                <option value="day">Day</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                            </select>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="specificTicket" className="block text-gray-700 font-semibold mb-2">Specific Ticket:</label>
                            <input
                                type="text"
                                id="specificTicket"
                                value={specificTicket}
                                onChange={(e) => setSpecificTicket(e.target.value)}
                                placeholder="Enter Ticket ID"
                                className="w-full p-2 border border-gray-300 rounded"
                            />
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
                        <div className="mb-6">
                            <label htmlFor="userId" className="block text-gray-700 font-semibold mb-2">User ID:</label>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Enter User ID"
                                className="w-full p-2 border border-gray-300 rounded"
                            />
                        </div>
                        <div className="text-center">
                            <button
                                onClick={handleGenerateReport}
                                className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150"
                            >
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </LocalizationProvider>
    );
};

export default CreateReport;
