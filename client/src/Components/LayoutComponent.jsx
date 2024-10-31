// src/components/LayoutComponent.jsx
import { React, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Skeleton, Menu, MenuItem } from '@mui/material';
import logo from '../assets/img/nu_webp.webp';
import { AuthContext } from '../context/AuthContext';
import axios from "axios";

const LayoutComponent = ({ children }) => {
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

    // Handle opening the dropdown menu
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle closing the dropdown menu
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Handle logout logic
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

    useEffect(() => {
        const fetchProfile = async () => {
            try {
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

    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header Section */}
            <header className="relative bg-[#35408e] text-white p-1"> {/* Reduced padding */}
                <div className="flex items-center justify-between">
                    <img src={logo} alt="NU LOGO" className="max-w-[145px] ml-4" />

                    {/* Profile Info Section */}
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
                        <MenuItem onClick={() => navigate('/AllProfile')}>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            Logout
                        </MenuItem>
                    </Menu>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[5px] bg-[#FFD700]"></div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow justify-center">
                {children}
            </main>

            {/* Footer Section */}
            <footer className="flex justify-start items-center text-white p-1 border-t border-gray-300 bg-transparent">
                <a href="https://national-u.edu.ph/" target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm mr-2">
                    National University
                </a>
                <span className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()}
                </span>
            </footer>
        </div>
    );
};

export default LayoutComponent;
