import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Avatar, IconButton, TextField, Button, CircularProgress, Skeleton } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import UserSideNav from '../Components/user_sidenav/UserSideNav';

const UserProfile = () => {
    const { profile } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        firstName: "Loading...",
        lastName: "Loading...",
        dept: "Loading...",
        idNum: "Loading...",
        email: "Loading...",
        profilePicture: ""
    });
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false); // New state to track saving status

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/profile', { withCredentials: true });
                if (response.status === 200) {
                    setProfileData(response.data);
                    setFormData(response.data);
                    setProfilePicturePreview(response.data.profilePicture);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [profile]);

    const handleEditClick = () => {
        setEditMode(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        try {
            setIsSaving(true); // Set saving status to true
            const updatedProfileData = new FormData();
            updatedProfileData.append('firstName', formData.firstName);
            updatedProfileData.append('lastName', formData.lastName);
            updatedProfileData.append('dept', formData.dept);
            updatedProfileData.append('idNum', formData.idNum);
            updatedProfileData.append('email', formData.email);
            
            if (profilePicture) {
                updatedProfileData.append('profilePicture', profilePicture);
            }

            await axios.put("/api/updateProfileUser", updatedProfileData, { withCredentials: true });

            // Update the profile data state with the new values
            setProfileData(prevData => ({
                ...prevData,
                ...formData,
                profilePicture: profilePicturePreview || prevData.profilePicture
            }));

            setEditMode(false);
            setProfilePicture(null);
            setProfilePicturePreview(null);
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setIsSaving(false); // Reset saving status
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        setProfilePicturePreview(URL.createObjectURL(file));
    };

    const handleCancel = () => {
        setEditMode(false);
        setProfilePicture(null);
        setProfilePicturePreview(profileData.profilePicture);
    };

    return (
        <div className="flex">
            <UserSideNav />
            <div className="flex flex-col w-full">
                <div className="w-[77%] ml-[21.5%]">
                    <div className="bg-[#403993] text-white rounded-lg shadow-lg p-6 mb-8 mt-4">
                        <div className="flex items-center">
                            <div className="relative">
                                {loading ? (
                                    <Skeleton variant="circular" width={100} height={100} />
                                ) : (
                                    <Avatar
                                        src={profilePicturePreview || profileData.profilePicture || ""}
                                        alt="Profile"
                                        sx={{ width: 100, height: 100 }}
                                        className="relative"
                                    />
                                )}
                                {editMode && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                        <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="icon-button-file"
                                            type="file"
                                            onChange={handleFileChange}
                                        />
                                        <label htmlFor="icon-button-file">
                                            <IconButton
                                                aria-label="upload picture"
                                                component="span"
                                                sx={{ color: 'white' }}
                                            >
                                                <PhotoCamera />
                                            </IconButton>
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="ml-4 flex flex-col justify-center">
                                <h2 className="text-xl font-semibold">{loading ? <Skeleton width={120} /> : `${profileData.firstName} ${profileData.lastName}`}</h2>
                                <p className="text-gray-300">{loading ? <Skeleton width={80} /> : profileData.position}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-center mb-8 text-[#4a90e2]">Profile</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <TextField
                                label="First Name"
                                name="firstName"
                                value={formData.firstName || ''}
                                onChange={handleChange}
                                disabled={!editMode || loading}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleChange}
                                disabled={!editMode || loading}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Department"
                                name="dept"
                                value={formData.dept || ''}
                                onChange={handleChange}
                                disabled={!editMode || loading}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="ID Number"
                                name="idNum"
                                value={formData.idNum || ''}
                                disabled
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Email"
                                name="email"
                                value={formData.email || ''}
                                disabled
                                fullWidth
                                size="small"
                            />
                        </div>

                        <div className="text-center mt-8">
                            {isSaving ? ( // Show loading spinner when saving
                                <CircularProgress />
                            ) : editMode ? (
                                <>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleSave}
                                        sx={{ mr: 2 }}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleEditClick}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
