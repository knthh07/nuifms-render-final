import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Chip, Tooltip } from '@mui/material';

// Define action mapping for scenarios and objects
const actionMapping = {
  'Broken': {
    'Computer': 'Consider upgrading or repairing the computer systems',
    'Projector': 'Repair or replace the projectors',
    'Air conditioner': 'Schedule maintenance or replacement of air conditioners',
    'Light switch': 'Inspect and repair the light switches',
    'Desk': 'Replace or fix the desks',
    'Elevator': 'Schedule maintenance for elevators',
    'Whiteboard': 'Replace or fix the whiteboards',
    'Printer': 'Service or replace the printers',
  },
  'Busted': {
    'Fuse': 'Check the wiring and replace fuses as necessary',
    'Light bulb': 'Replace the light bulbs with energy-efficient options',
    'Monitor': 'Repair or replace the monitors',
    'Electric outlet': 'Inspect and fix electrical outlets',
    'Security camera': 'Check and repair the security camera systems',
    'Speaker system': 'Repair or replace speaker systems',
    'Router': 'Upgrade or troubleshoot the routers',
    'Refrigerator': 'Service or replace the refrigerators',
  },
  'Slippery': {
    'Floor': 'Apply anti-slip coatings or mats',
    'Stairs': 'Install anti-slip strips or handrails',
    'Entrance': 'Improve drainage or install mats at entrances',
    'Bathroom tiles': 'Use anti-slip treatments on bathroom tiles',
    'Balcony': 'Install safety measures to prevent slips on balconies',
  },
  'Leaking': {
    'Faucet': 'Fix or replace leaking faucets',
    'Pipes': 'Schedule a full plumbing inspection and repairs',
    'Roof': 'Repair or replace leaking roof sections',
    'Water dispenser': 'Inspect and fix or replace water dispensers',
    'Sink': 'Fix or replace sinks with leakage issues',
    'Ceiling': 'Investigate and repair ceiling leaks',
  },
  'Clogged': {
    'Toilet': 'Unclog toilets and check for drainage issues',
    'Drain': 'Clear the drains and consider routine cleaning',
    'Sink': 'Unclog and maintain the sinks',
    'Gutter': 'Clean and maintain the gutters to prevent clogging',
    'AC Vent': 'Clean or replace air conditioning vents',
  },
  'Noisy': {
    'Fan': 'Lubricate or replace noisy fans',
    'Door': 'Fix door hinges or replace noisy doors',
    'Ventilation system': 'Inspect and repair ventilation systems',
    'Generator': 'Service or replace noisy generators',
    'AC unit': 'Maintain or replace noisy air conditioning units',
  },
  'Not Working': {
    'Printer': 'Service or replace the printers',
    'Photocopier': 'Repair or replace photocopiers',
    'Door lock': 'Fix or replace non-functioning door locks',
    'Smartboard': 'Troubleshoot or replace smartboards',
    'Projector': 'Repair or replace projectors',
    'Microphone': 'Service or replace malfunctioning microphones',
    'Intercom system': 'Check and repair intercom systems',
  },
  'Cracked': {
    'Window': 'Replace or repair cracked windows',
    'Door': 'Fix or replace cracked doors',
    'Floor tile': 'Replace cracked floor tiles',
    'Wall': 'Repair cracks in walls',
    'Whiteboard': 'Fix or replace cracked whiteboards',
  },
  'Burnt Out': {
    'Light bulb': 'Replace burnt-out bulbs with longer-lasting ones',
    'Electric wiring': 'Inspect and replace faulty electrical wiring',
    'Fuse box': 'Service or replace fuse boxes',
    'Outlet': 'Repair or replace burnt-out outlets',
    'Extension cord': 'Replace damaged extension cords',
  },
  'Loose': {
    'Door knob': 'Tighten or replace loose door knobs',
    'Cabinet handle': 'Fix or replace loose cabinet handles',
    'Table leg': 'Repair or replace wobbly table legs',
    'Chair screws': 'Tighten screws or replace parts of chairs',
    'Window lock': 'Fix or replace loose window locks',
  }
};

const AnalyticsDashboard = ({ recommendations }) => {
  const [sortedRecommendations, setSortedRecommendations] = useState([]);

  useEffect(() => {
    const sorted = [...recommendations].sort((a, b) => {
      const severityOrder = { "Critical": 3, "Moderate": 2, "Minor": 1, "Unknown": 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
    setSortedRecommendations(sorted);
  }, [recommendations]);

  return (
    <Card className="bg-white shadow-md rounded-md mb-5">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Recommendations
        </Typography>
        <List>
          {sortedRecommendations.length > 0 ? (
            sortedRecommendations.map((recommendation, index) => {
              const { reqOffice, building, floor, scenario, object, occurrences, priority, severity } = recommendation;
              const action = actionMapping[scenario]?.[object] || "No specific action available";

              // Warnings for missing action mappings
              if (!actionMapping[scenario]) {
                console.warn(`No action mapping found for scenario: "${scenario}"`);
              } else if (!actionMapping[scenario][object]) {
                console.warn(`No action found for object: "${object}" in scenario: "${scenario}"`);
              }

              return (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1">
                        For {reqOffice} in {building}, {floor} - Scenario: "{scenario}" with Object: "{object}"
                      </Typography>
                    }
                    secondary={
                      <Typography component="div" variant="body2" style={{ display: 'flex', alignItems: 'center' }}>
                        <span>Action: {action}</span>
                        <span style={{ marginLeft: '8px' }}>Occurrences: {occurrences}</span>
                        <Tooltip title={`Priority: ${priority}`} arrow>
                          <Chip
                            label={priority}
                            color={priority === 'High' ? 'error' : priority === 'Medium' ? 'warning' : 'default'}
                            size="small"
                            style={{ marginLeft: '8px' }}
                          />
                        </Tooltip>
                        <Tooltip title={`Severity: ${severity}`} arrow>
                          <Chip
                            label={severity}
                            color={severity === 'Critical' ? 'error' : severity === 'Moderate' ? 'warning' : 'default'}
                            size="small"
                            style={{ marginLeft: '8px' }}
                          />
                        </Tooltip>
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })
          ) : (
            <Typography variant="body2" align="center" style={{ padding: '16px' }}>
              No recommendations available.
            </Typography>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDashboard;
