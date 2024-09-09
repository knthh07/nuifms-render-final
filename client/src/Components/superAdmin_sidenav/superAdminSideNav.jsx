import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { PiSignOutBold } from "react-icons/pi";
import { AiOutlineDashboard, AiOutlineFileText, AiOutlineProfile } from "react-icons/ai";
import logo from "../../assets/img/nu_logo.png";
import "./superAdminSideNav.css";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';

const SuperAdminSideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);

  useEffect(() => {
    const fetchApplicationCount = async () => {
      try {
        const response = await axios.get('/api/jobOrders/count', { params: { status: 'pending' } });
        setApplicationCount(response.data.count);
      } catch (error) {
        console.error('Error fetching application count:', error);
      }
    };

    fetchApplicationCount();
  }, []);

  const handleButtonClick = () => {
    setOpen(true);
  };

  const handleClose = (confirmed) => {
    setOpen(false);
    if (confirmed) {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="superSideNav h-full w-[20%] fixed z-10 top-0 left-0 bg-[#35408e] transition-all duration-500 overflow-x-hidden pt-20 flex flex-col items-center">
      <div className="imgLogo mt-20 mb-30">
        <img src={logo} alt="NU LOGO" className="max-w-full h-auto -mt-16 -mb-7 ml-auto mr-auto" />
      </div>
      <nav className="navlinks w-[70%] mt-12">
        <NavLink to="/SuperAdminDashboard" location={location} icon={<AiOutlineDashboard />}>Dashboard</NavLink>
        <NavLink to="/SuperAdminRequests" location={location} icon={<AiOutlineFileText />}>
          Applications {applicationCount > 0 && <span className="badge">{applicationCount}</span>}
        </NavLink> {/* requests dati, dito mapupunta lahat ng applications ng mga user*/}
        <NavLink to="/SuperAdminJobOrder" location={location} icon={<AiOutlineFileText />}>Job Orders</NavLink>    {/* tickets pangalan dati, sa super admin (director tsaka vp mike) pwede mag assign ng job order sa mga employee, yung sa admin lang pwede mag claim ng job order */}
        <NavLink to="/SuperAdminTracking" location={location} icon={<AiOutlineFileText />}>Track Job Orders</NavLink>    {/* admin or super admin magsesend ng current progress nung application or job order ng mga user / thread daw sabi ni sir guads */}
        <NavLink to="/SuperAdminArchive" location={location} icon={<AiOutlineFileText />}>Archive</NavLink>
        <NavLink to="/SuperAdminFeedback" location={location} icon={<AiOutlineFileText />}>Feedback</NavLink>
        <NavLink to="/SuperAdminManagementPage" location={location} icon={<AiOutlineFileText />}>Manage Accounts</NavLink>
        <NavLink to="/SuperAdminProfile" location={location} icon={<AiOutlineProfile />}>Profile</NavLink>
        <NavLink to="/SuperAdminReport" location={location} icon={<AiOutlineFileText />}>Report</NavLink>
      </nav>

      <button className="button signoutButton flex items-center justify-center space-x-2 -mt-7" onClick={handleButtonClick}>
        <PiSignOutBold />
        <span>Sign Out</span>
      </button>

      <Dialog open={open} onClose={() => handleClose(false)}>
        <DialogTitle>Confirm Sign Out</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to sign out?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} color="primary">Cancel</Button>
          <Button onClick={() => handleClose(true)} color="primary" autoFocus>Sign Out</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// Custom NavLink component to handle active link styling
const NavLink = ({ to, children, location, icon }) => {
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link flex items-center mb-1 py-3 px-7 text-white uppercase text-left block rounded-md transition duration-300 ${isActive ? 'bg-yellow-500 text-[#403993]' : 'hover:bg-yellow-500 hover:text-[#403993]'}`}>
      {icon && <span className="mr-2">{icon}</span>}
      <span className="flex-1 flex-shrink-0">{children}</span>
    </Link>
  );
}

export default SuperAdminSideNav;
