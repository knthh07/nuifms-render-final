import React from 'react';
import { Box, Modal, Typography, IconButton, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FilterModal = ({ open, onClose, status, setStatus, lastName, setLastName, dateRange, setDateRange, filterBy, setFilterBy, onApply }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="filter-modal-title"
            aria-describedby="filter-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%',
                    maxWidth: 500,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography id="filter-modal-title" variant="h6" component="h2" gutterBottom>
                    Filters
                </Typography>

                <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    label="Last Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Filter By</InputLabel>
                    <Select value={filterBy} onChange={(e) => setFilterBy(e.target.value)}>
                        <MenuItem value="day">Day</MenuItem>
                        <MenuItem value="month">Month</MenuItem>
                        <MenuItem value="year">Year</MenuItem>
                    </Select>
                </FormControl>

                {filterBy && (
                    <Box>
                        <TextField
                            label={`Start Date (${filterBy})`}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            margin="normal"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                        <TextField
                            label={`End Date (${filterBy})`}
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            margin="normal"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </Box>
                )}

                <Button onClick={onApply} variant="contained" color="primary">
                    Apply Filters
                </Button>
            </Box>
        </Modal>
    );
};

export default FilterModal;
