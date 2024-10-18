import React from 'react';
import UserSideNav from '../Components/user_sidenav/UserSideNav'
import { Box, Typography, Card, CardContent } from '@mui/material';
import BarChart from '../Components/Chart/BarChart';
import PieChart from '../Components/Chart/PieChart';
import LineChart from '../Components/Chart/LineChart';

const UserDashboard = () => {
  return (
    <div className="flex">
      <UserSideNav />
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
          </div>

          <div className="flex space-x-5 mt-5">
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

export default UserDashboard;
