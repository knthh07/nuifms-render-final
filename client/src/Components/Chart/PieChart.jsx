import * as React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';

export default function PieChartGraph() {
  return (
    <Box
      sx={{
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
      }}
    >
      <Typography variant="h6" align="center" sx={{ marginBottom: '10px' }}>
        Reported Problems
      </Typography>
      <PieChart
        series={[
          {
            data: [
              { id: 0, value: 10, label: 'Problem A' },
              { id: 1, value: 15, label: 'Problem B' },
              { id: 2, value: 20, label: 'Problem C' },
            ],
          },
        ]}
        width={400}
        height={200}
        sx={{
          '& .MuiChart-root': {
            padding: '20px',
          },
          '& .MuiChart-sector': {
            stroke: '#fff',
            strokeWidth: 1,
          },
          '& .MuiChart-label': {
            fontSize: '0.875rem',
            fontWeight: '500',
            fill: '#333',
          },
        }}
      />
    </Box>
  );
}
