import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Divider, TextField, MenuItem, Button, Tooltip, FormHelperText } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import Loader from '../../hooks/Loader';
import WarningIcon from '@mui/icons-material/Warning';
import { toast } from "react-hot-toast";
const jobOrderTypes = ['Maintenance', 'Borrowing', 'Repair', 'Installation'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

const sortedScenarios = Object.entries(scenarioToObjects).sort((a, b) => {
  const severityOrder = { Critical: 3, Moderate: 2, Minor: 1 };
  return severityOrder[b[1].severity] - severityOrder[a[1].severity];
});

const JobOrderForm = () => {
  const [jobOrder, setJobOrder] = useState({
    firstName: '', lastName: '', reqOffice: '', campus: '', building: '', floor: '', position: '',
    jobDesc: '', dateTo: '', dateFrom: '', file: null, jobType: '', scenario: '', object: '',
    dateOfRequest: new Date().toISOString().split('T')[0]
  });
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [fileName, setFileName] = useState('');
  const [objects, setObjects] = useState([]);
  const [otherScenario, setOtherScenario] = useState('');
  const [otherObject, setOtherObject] = useState('');
  const [pendingJobOrder, setPendingJobOrder] = useState(false);

  const handleCampusChange = useCallback((e) => {
    const selectedCampusName = e.target.value;
    const selectedCampus = data.find(campus => campus.name === selectedCampusName);
    setJobOrder(prev => ({ ...prev, campus: selectedCampusName, building: '', floor: '', reqOffice: '' }));
    setBuildings(selectedCampus ? selectedCampus.buildings : []);
    setFloors([]);
    setRooms([]);
  }, [data]);

  const handleBuildingChange = useCallback((e) => {
    const selectedBuildingName = e.target.value;
    setJobOrder(prev => ({ ...prev, building: selectedBuildingName, floor: '', reqOffice: '' }));
    const selectedCampusData = data.find(campus => campus.name === jobOrder.campus);
    if (selectedCampusData) {
      const selectedBuildingData = selectedCampusData.buildings.find(b => b.name === selectedBuildingName);
      setFloors(selectedBuildingData?.floors || []);
      setRooms([]);
    }
  }, [data, jobOrder.campus]);

  const handleFloorChange = useCallback((e) => {
    const selectedFloorName = e.target.value;
    setJobOrder(prev => ({ ...prev, floor: selectedFloorName, reqOffice: '' }));
    const selectedCampusData = data.find(campus => campus.name === jobOrder.campus);
    if (selectedCampusData) {
      const selectedBuildingData = selectedCampusData.buildings.find(b => b.name === jobOrder.building);
      setRooms(selectedBuildingData?.floors.find(f => f.number === selectedFloorName)?.offices || []);
    }
  }, [data, jobOrder.campus, jobOrder.building]);

  const handleOfficeChange = useCallback((e) => {
    setJobOrder(prev => ({ ...prev, reqOffice: e.target.value }));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size too large. Maximum size is 10 MB.");
        e.target.value = '';
        return;
      }
      setJobOrder(prev => ({ ...prev, file }));
      setFileName(file.name);
    } else {
      setJobOrder(prev => ({ ...prev, file: null }));
      setFileName('');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, ordersRes, campusesRes] = await Promise.all([
          axios.get('/api/profile', { withCredentials: true }),
          axios.get('/api/history', { withCredentials: true }),
          axios.get('/api/campuses', { withCredentials: true })
        ]);

        const { firstName, lastName, position, dept } = profileRes.data;
        const campusData = campusesRes.data;

        // Attempt to find office hierarchy based on dept
        let selectedCampus = null;
        let selectedBuilding = null;
        let selectedFloor = null;
        let selectedRoom = null;

        for (const campus of campusData) {
          for (const building of campus.buildings) {
            for (const floor of building.floors) {
              const matchedRoom = floor.offices.find(office => office.name === dept);
              if (matchedRoom) {
                selectedCampus = campus.name;
                selectedBuilding = building.name;
                selectedFloor = floor.number;
                selectedRoom = matchedRoom.name;
                break;
              }
            }
            if (selectedRoom) break;
          }
          if (selectedRoom) break;
        }

        // Update job order state with found values
        setJobOrder(prev => ({
          ...prev,
          firstName,
          lastName,
          position,
          dept,
          campus: selectedCampus || '',
          building: selectedBuilding || '',
          floor: selectedFloor || '',
          reqOffice: selectedRoom || ''
        }));

        // Preload dropdowns
        if (selectedCampus) {
          const campusObj = campusData.find(c => c.name === selectedCampus);
          const buildingObj = campusObj?.buildings.find(b => b.name === selectedBuilding);
          const floorObj = buildingObj?.floors.find(f => f.number === selectedFloor);
          setBuildings(campusObj?.buildings || []);
          setFloors(buildingObj?.floors || []);
          setRooms(floorObj?.offices || []);
        }

        setPendingJobOrder(ordersRes.data.requests.some(order => order.status === 'pending' || order.status === 'ongoing'));
        setData(campusData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error loading data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const submitJobOrder = useCallback(async (e) => {
    e.preventDefault();
    if (pendingJobOrder) return;

    const scenarioToSubmit = jobOrder.scenario === 'Other' ? otherScenario : jobOrder.scenario;
    const objectToSubmit = jobOrder.object === 'Other' ? otherObject : jobOrder.object;
    const { firstName, lastName, position, jobDesc, dateTo, dateFrom, file, jobType, dateOfRequest } = jobOrder;
    const reqOfficeToSubmit = jobOrder.reqOffice || jobOrder.dept;

    if (!firstName || !lastName || !reqOfficeToSubmit || !position || !jobDesc || !jobType || !dateOfRequest || !dateTo || !dateFrom) {
      return toast.error('All required fields must be filled out.');
    }

    try {
      const formData = new FormData();
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('reqOffice', reqOfficeToSubmit);
      formData.append('position', position);
      formData.append('dateTo', dateTo);
      formData.append('dateFrom', dateFrom);
      formData.append('jobDesc', DOMPurify.sanitize(jobDesc));
      formData.append('jobType', jobType);
      formData.append('scenario', scenarioToSubmit);
      formData.append('object', objectToSubmit);
      formData.append('dateOfRequest', dateOfRequest);
      if (file) formData.append('file', file);

      setIsLoading(true);
      const response = await axios.post('/api/addJobOrder', formData);
      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        setPendingJobOrder(true);
        setJobOrder(prev => ({
          ...prev,
          reqOffice: '', campus: '', building: '', floor: '', jobDesc: '', dateTo: '', dateFrom: '',
          file: null, jobType: '', scenario: '', object: '', fileName: ''
        }));
        setFileName('');
        toast.success('Job Order Submitted');
      }
    } catch (error) {
      toast.error('Server Error');
    } finally {
      setIsLoading(false);
    }
  }, [jobOrder, otherScenario, otherObject, pendingJobOrder]);

  const maxLength = 250;
  const charactersLeft = maxLength - jobOrder.jobDesc.length;

  return (
    <Box autoComplete="off" sx={{ padding: 2, maxWidth: 800, margin: 'auto' }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#35408e', fontWeight: 'bold' }}>Create Job Order</Typography>
      <Divider sx={{ mb: 3 }} />

      <Box component="form" autoComplete="off" noValidate onSubmit={submitJobOrder} encType="multipart/form-data">
        <div className="flex">
          <div className="flex-wrap justify-between p-4 y-4 w-full">
            <input type="hidden" value={jobOrder.firstName + " " + jobOrder.lastName} />
            <input type="hidden" value={jobOrder.dept || ""} />
            <input type="hidden" value={jobOrder.position} />

            <TextField label="Date of Request" type="date" fullWidth required disabled size="small"
              InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} value={jobOrder.dateOfRequest}
              onChange={(e) => setJobOrder({ ...jobOrder, dateOfRequest: e.target.value })} />

            <TextField id="jobOrderType" name="jobOrderType" select label="Job Order Type" variant="outlined"
              fullWidth required size="small" value={jobOrder.jobType} sx={{ mb: 2 }}
              onChange={(e) => setJobOrder({ ...jobOrder, jobType: e.target.value })}>
              {jobOrderTypes.map((type) => <MenuItem key={type} value={type}>{type}</MenuItem>)}
            </TextField>

            {/* Location Fields */}
            <Box display="flex" gap={2} mb={2}>
              <TextField id="campus" name="campus" select label="Campus" disabled variant="outlined" fullWidth
                size="small" value={jobOrder.campus} onChange={handleCampusChange}>
                {data.map((campus) => (
                  <MenuItem key={campus.name} value={campus.name}>{campus.name}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField id="building" name="building" select label="Building" disabled variant="outlined" fullWidth
                size="small" value={jobOrder.building} onChange={handleBuildingChange}>
                {buildings.map((building) => (
                  <MenuItem key={building.name} value={building.name}>{building.name}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField id="floor" name="floor" select label="Floor" disabled variant="outlined" fullWidth
                size="small" value={jobOrder.floor} onChange={handleFloorChange}>
                {floors.map((floor) => (
                  <MenuItem key={floor.number} value={floor.number}>{floor.number}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField id="reqOffice" name="reqOffice" select label="Office" disabled variant="outlined" fullWidth
                size="small" value={jobOrder.reqOffice} onChange={handleOfficeChange}>
                {rooms.map((room) => (
                  <MenuItem key={room.name} value={room.name}>{room.name}</MenuItem>
                ))}
              </TextField>
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField id="scenario" name="scenario" select label="Scenario" variant="outlined" fullWidth
                size="small" value={jobOrder.scenario} onChange={(e) => {
                  const selectedScenario = e.target.value;
                  setJobOrder({ ...jobOrder, scenario: selectedScenario, object: '' });
                  if (selectedScenario !== 'Other') setOtherScenario('');
                  setObjects(selectedScenario === 'Other' ? [] : scenarioToObjects[selectedScenario]?.objects || []);
                }}>
                {sortedScenarios.map(([scenario]) => <MenuItem key={scenario} value={scenario}>{scenario}</MenuItem>)}
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              {jobOrder.scenario === 'Other' && (
                <TextField id="otherScenario" name="otherScenario" label="Please specify other scenario"
                  variant="outlined" fullWidth size="small" value={otherScenario}
                  onChange={(e) => setOtherScenario(e.target.value)} />
              )}
            </Box>

            <Box display="flex" gap={2} mb={2}>
              <TextField id="object" name="object" select label="Object" variant="outlined" fullWidth
                size="small" value={jobOrder.object} disabled={!jobOrder.scenario} onChange={(e) => {
                  const selectedObject = e.target.value;
                  setJobOrder({ ...jobOrder, object: selectedObject });
                  if (selectedObject !== 'Other') setOtherObject('');
                }}>
                {objects.map((object) => <MenuItem key={object} value={object}>{object}</MenuItem>)}
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
              {jobOrder.object === 'Other' && (
                <TextField id="otherObject" name="otherObject" label="Please specify other object"
                  variant="outlined" fullWidth size="small" value={otherObject}
                  onChange={(e) => setOtherObject(e.target.value)} />
              )}
            </Box>

            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: -2 }}>
              Note: This feature is experimental and may be subject to changes.
            </Typography>

            <Box display="flex" gap={2} mb={2} mt={1}>
              <TextField id="dateFrom" name="dateFrom" label="Date From" type="date" variant="outlined"
                required size="small" value={jobOrder.dateFrom} sx={{ flex: 1 }}
                onChange={(e) => setJobOrder({ ...jobOrder, dateFrom: e.target.value })}
                InputLabelProps={{ shrink: true }} inputProps={{ min: new Date().toISOString().split("T")[0] }} />
              <TextField id="dateTo" name="dateTo" label="Date To" type="date" variant="outlined"
                required size="small" value={jobOrder.dateTo} sx={{ flex: 1 }}
                onChange={(e) => setJobOrder({ ...jobOrder, dateTo: e.target.value })}
                InputLabelProps={{ shrink: true }} inputProps={{ min: jobOrder.dateFrom }} />
            </Box>

            <Box>
              <TextField id="jobDescription" name="jobDescription" label="Job Description" variant="outlined"
                fullWidth required size="small" multiline rows={3} value={jobOrder.jobDesc}
                onChange={e => setJobOrder({ ...jobOrder, jobDesc: e.target.value })}
                inputProps={{ maxLength }} helperText={`${charactersLeft} characters left`} />
              {charactersLeft < 0 && <FormHelperText error>You have exceeded the character limit by {-charactersLeft} characters.</FormHelperText>}
            </Box>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Button variant="contained" component="label" color="primary" disabled={isLoading}
                sx={{ padding: '4px 10px', fontSize: '0.75rem', minWidth: '100px', opacity: 0.8 }}>
                Upload Image
                <input type="file" hidden onChange={handleFileChange} accept="image/jpeg, image/png" />
              </Button>
              <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
                {fileName ? fileName : "No file chosen"}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Button type="submit" variant="contained" color="primary"
                  disabled={isLoading || pendingJobOrder} sx={{ maxWidth: '150px' }}>
                  {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
                {pendingJobOrder && (
                  <Tooltip title="You have a pending or ongoing job order. Please wait until it's resolved before submitting another one." arrow>
                    <Box display="flex" alignItems="center" ml={1}>
                      <WarningIcon color="warning" />
                    </Box>
                  </Tooltip>
                )}
              </Box>
            </Box>

            <Typography variant="caption" color="textSecondary" mt={1}>Accepted file types: JPEG, PNG</Typography>
            <Loader isLoading={isLoading} />
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default JobOrderForm;