import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { PiSignOutBold } from "react-icons/pi";
import { AiOutlineDashboard, AiOutlineFileText, AiOutlineProfile } from "react-icons/ai";
import logo from "../../assets/img/nu_webp.webp";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import './user_sidenav.css';

const SideNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(true);

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
      <div className={`user-sidenav ${isNavOpen ? 'active' : 'collapsed'}`}>
        <button className="user-burger-menu" onClick={toggleNav}>
          ☰
        </button>
        <div className="user-imgLogo mt-4 mb-6">
          <img src={logo} alt="NU LOGO" className="max-w-full h-auto" loading='lazy'/>
        </div>
        <nav className="user-navlinks">
          <NavLink to="/UserDashboard" location={location} icon={<AiOutlineDashboard />}>Dashboard</NavLink>
          <NavLink to="/UserApplication" location={location} icon={<AiOutlineFileText />}>Create Application</NavLink>
          <NavLink to="/UserTrackOrder" location={location} icon={<AiOutlineFileText />}>Track Job Orders</NavLink>
          <NavLink to="/UserHistory" location={location} icon={<AiOutlineFileText />}>History</NavLink>
          <NavLink to="/UserProfile" location={location} icon={<AiOutlineFileText />}>Profile</NavLink>
        </nav>
        <div className="user-signout-container">
          <button className="user-button signoutButton" onClick={handleButtonClick}>
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
          <Button onClick={() => handleClose(true)} color="primary" aria-label="Signout" autoFocus>Sign Out</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const NavLink = ({ to, children, location, icon }) => {
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`user-nav-link ${isActive ? 'active' : ''}`}>
      {icon && <span className="user-nav-icon">{icon}</span>}
      <span className="user-nav-text">{children}</span>
    </Link>
  );
}

export default SideNav;
