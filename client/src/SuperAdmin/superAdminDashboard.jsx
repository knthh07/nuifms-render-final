import React from 'react';
import SuperAdminSideNav from '../Components/superAdmin_sidenav/superAdminSideNav';
import { Box, Typography, Card, CardContent } from '@mui/material';
import BarChart from '../Components/Chart/BarChart';
import PieChart from '../Components/Chart/PieChart';
import LineChart from '../Components/Chart/LineChart';

const SuperAdminDashboard = () => {
  return (
    <div className="flex">
      <SuperAdminSideNav />
      <div className="flex flex-col w-full">
        <div className="flex-wrap justify-between p-5 bg-gray-100 w-[77%] ml-[21.5%] mt-3">
          <div className="flex space-x-5">
            <StatCard title="COA" value="0" />
            <StatCard title="CCIT" value="0" />
            <StatCard title="COE" value="0" />
            <StatCard title="COM" value="0" />
          </div>
          <div className="flex space-x-5 mt-5">
            <ChartCard>
              <BarChart />
            </ChartCard>
            <ChartCard>
              <PieChart />
            </ChartCard>
          </div>
          {/* <ChartCard className="mt-5">
            <LineChart />
          </ChartCard> */}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }) => {
  return (
    <Card className="w-1/4 bg-white shadow-md rounded-md">
      <CardContent>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
      </CardContent>
    </Card>
  );
};

const ChartCard = ({ children, className }) => {
  return (
    <Card className={`flex-1 bg-white shadow-md rounded-md ${className}`}>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default SuperAdminDashboard;


// NOTE UULITIN TALAGA LAHAT NG LAMAN NG SIDENAV KINGINA HAHAHAHAHAH NAG REREDIRECT SA IBA EH OR ALISIN NA LANG YON PARA ISA LANG NAKIKITA SINCE SAME LANG NAMAN SILA NG FUNCTIONS
