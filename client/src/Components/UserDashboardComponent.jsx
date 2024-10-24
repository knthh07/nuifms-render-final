import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Grid } from '@mui/material';
import BarChart from './Chart/BarChart';
import PieChartUser from './Chart/PieChartUser';

const UserDashboardComponent = () => {  // userId prop is no longer needed

    return (
        <Box>
            <div className="flex-wrap justify-between p-5 bg-gray-100 w-[77%] ml-[21.5%] mt-3">

                <Grid container spacing={3} sx={{ marginTop: 2 }}>
                    <Grid item xs={12} md={6}>
                        <ChartCard>
                            <PieChartUser /> {/* No need to pass userId here */}
                        </ChartCard>
                    </Grid>
                </Grid>

            </div>
        </Box>
    );
};

const ChartCard = ({ children, className }) => {
    return (
        <Card className={`bg-white shadow-md rounded-md ${className}`} sx={{ marginBottom: 2 }}>
            <CardContent>{children}</CardContent>
        </Card>
    );
};

export default UserDashboardComponent;
