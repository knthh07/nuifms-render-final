import { React, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Skeleton, Menu, MenuItem } from '@mui/material';
import axios from "axios";
import logo from "../../assets/img/nu_webp.webp";
import Loader from '../../hooks/Loader';
import { AuthContext } from '../../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';

const UserHomePage = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { profile } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: "Loading...",
    lastName: "Loading...",
    dept: "Loading...",
    idNum: "Loading...",
    email: "Loading...",
    profilePicture: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/profile', { withCredentials: true });
        if (response.status === 200) {
          setProfileData(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profile]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await axios.post('/api/logout', {}, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="relative bg-[#35408e] text-white p-1">
        <div className="flex items-center justify-between">
          <img src={logo} alt="NU LOGO" className="max-w-[145px] ml-4" />
          <div
            className="flex items-center mr-2 cursor-pointer hover:bg-[rgba(255,255,255,0.17)] rounded-md p-1 transition-all duration-300 ease-in-out"
            onClick={handleMenuOpen}
          >
            <div className="mr-2 flex flex-col">
              <h2 className="text-base">
                Hi, {loading ? <Skeleton width={100} /> : `${profileData.firstName}`}
              </h2>
            </div>
            <Avatar
              src={profileData.profilePicture || ""}
              alt="Profile"
              sx={{ width: 30, height: 30 }}
            />
          </div>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            disableAutoFocusItem
            PaperProps={{
              sx: {
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.2)',
                width: '115px',
                '& .MuiMenuItem-root': {
                  fontSize: '14px',
                  color: '#35408e',
                  '&:hover': {
                    backgroundColor: '#e0e0e0',
                    color: '#000',
                    transition: 'all 0.3s ease',
                  },
                },
              },
            }}
          >
            <MenuItem onClick={() => navigate('/AllProfile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-[#FFD700]"></div>
      </header>

      {/* Main Heading */}
      <h1 className="text-2xl font-bold mb-5 text-[#35408e] mt-4 ml-6" aria-label="Main Navigation">
        Welcome to NUIFMS!
      </h1>

      <main className="flex-grow flex flex-col items-center p-5">
        {/* Title Section */}
        <div className="flex items-center mb-2 w-full max-w-5xl">
          <HomeIcon className="mr-2 text-[#35408e]" style={{ fontSize: '42px' }} />
          <h1 className="text-2xl font-bold">Home</h1>
        </div>

        {/* Divider */}
        <div className="w-full max-w-5xl">
          <hr className="border-t border-gray-300 mb-5" />
        </div>

        {/* Container Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          <div
            className="flex flex-col p-4 bg-[#35408e] text-white rounded-lg shadow-md cursor-pointer hover:bg-[#4559a8] transition duration-300 h-32 w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/UserDashboardComponent')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/UserDashboard')}
            aria-label="Go to Dashboard"
          >
            <div className="flex items-center mb-2">
              <DashboardIcon className="text-4xl mr-2" />
              <span className="text-md font-medium">Dashboard</span>
            </div>
            <span className="text-sm mt-1">View your dashboard</span>
          </div>

          {/* <div
            className="flex flex-col p-4 bg-[#35408e] text-white rounded-lg shadow-md cursor-pointer hover:bg-[#4559a8] transition duration-300 h-32 w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/UserApplication')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/UserApplication')}
            aria-label="Create a new application"
          >
            <div className="flex items-center mb-2">
              <NoteAddIcon className="text-4xl mr-2" />
              <span className="text-md font-medium">Create Application</span>
            </div>
            <span className="text-sm mt-1">Submit a new application</span>
          </div> */}

          <div
            className="flex flex-col p-4 bg-[#35408e] text-white rounded-lg shadow-md cursor-pointer hover:bg-[#4559a8] transition duration-300 h-32 w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/UserTrackOrder')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/UserTrackOrder')}
            aria-label="Track job orders"
          >
            <div className="flex items-center mb-2">
              <AssignmentTurnedInIcon className="text-4xl mr-2" />
              <span className="text-md font-medium">Track Job Orders</span>
            </div>
            <span className="text-sm mt-1">Check the status of orders</span>
          </div>

          {/* <div
            className="flex flex-col p-4 bg-[#35408e] text-white rounded-lg shadow-md cursor-pointer hover:bg-[#4559a8] transition duration-300 h-32 w-60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/UserHistory')}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/UserHistory')}
            aria-label="View history of past activities"
          >
            <div className="flex items-center mb-2">
              <HistoryIcon className="text-4xl mr-2" />
              <span className="text-md font-medium">History</span>
            </div>
            <span className="text-sm mt-1">View your past activities</span>
          </div> */}
          
        </div>
      </main>

      <footer className="flex justify-start items-center text-white p-1 w-full max-w-full border-t border-gray-300 bg-transparent">
        <a href="https://national-u.edu.ph/" target="_blank" rel="noopener noreferrer" className="text-blue-700 text-sm mr-1">
          National University
        </a>
        <span className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
};

export default UserHomePage;
