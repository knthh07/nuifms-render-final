import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { PiSignOutBold } from "react-icons/pi";
import { AiOutlineDashboard, AiOutlineFileText, AiOutlineProfile } from "react-icons/ai";
import logo from "../../assets/img/nu_logo.webp";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import './sidenav.css';

const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);
  const [isNavOpen, setIsNavOpen] = useState(true);

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

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <>
      <div className={`sidenav ${isNavOpen ? 'active' : 'collapsed'}`}>
        <button className="burger-menu" onClick={toggleNav}>
          ☰
        </button>
        {/* <div className="imgLogo mt-4 mb-6">
          <img src={logo} alt="NU LOGO" className="max-w-full h-auto" loading='lazy'/>
        </div> */}
        <nav className="navlinks">
          <NavLink to="/AdminDashboard" location={location} icon={<AiOutlineDashboard />}>Dashboard</NavLink>
          <NavLink to="/request" location={location} icon={<AiOutlineFileText />}>
            Applications
            {applicationCount > 0 && <span className="badge">{applicationCount}</span>}
          </NavLink>
          <NavLink to="/jobOrder" location={location} icon={<AiOutlineFileText />}>Job Orders</NavLink>
          <NavLink to="/tracking" location={location} icon={<AiOutlineFileText />}>Track Job Orders</NavLink>
          <NavLink to="/archive" location={location} icon={<AiOutlineFileText />}>Archive</NavLink>
          <NavLink to="/feedback" location={location} icon={<AiOutlineFileText />}>Feedback</NavLink>
          <NavLink to="/manageAcc" location={location} icon={<AiOutlineFileText />}>Manage Accounts</NavLink>
          <NavLink to="/profile" location={location} icon={<AiOutlineProfile />}>Profile</NavLink>
          <NavLink to="/report" location={location} icon={<AiOutlineFileText />}>Report</NavLink>
        </nav>
        <div className="signout-container">
          <button className="button signoutButton" onClick={handleButtonClick}>
            <PiSignOutBold />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

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
    </>
  );
};

const NavLink = ({ to, children, location, icon }) => {
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      {icon && <span className="nav-icon">{icon}</span>}
      <span className="nav-text">{children}</span>
    </Link>
  );
}

export default SideNav;
