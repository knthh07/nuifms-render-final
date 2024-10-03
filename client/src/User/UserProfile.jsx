import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Avatar, IconButton, TextField, Button } from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import UserSideNav from '../Components/user_sidenav/UserSideNav';
import CircularProgress from '@mui/material/CircularProgress';

const UserProfile = () => {
    const { profile } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null); // New state for preview
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/profile', { withCredentials: true });
                if (response.status === 200) {
                    setProfileData(response.data);
                    setFormData(response.data); // Initialize formData with profileData
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
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
            setLoading(true);
            if (profilePicture) {
                await handleUpload();
            }
            await axios.put("/api/updateProfileUser", formData, { withCredentials: true }
            );
            setProfileData(formData);
            setEditMode(false);
            setProfilePicturePreview(null); // Clear preview on save
        } catch (error) {
            console.error("Error updating profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        setProfilePicturePreview(URL.createObjectURL(file)); // Set preview URL
    };

    const handleUpload = async () => {
        if (!profilePicture) {
            console.error("No profile picture selected.");
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('profilePicture', profilePicture);

        try {
            const response = await axios.post(
                '/api/uploadProfilePictureUser',
                uploadFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    withCredentials: true
                }
            );

            if (response.status === 200) {
                setProfileData(prevData => ({
                    ...prevData,
                    profilePicture: response.data.profilePicture
                }));
                setProfilePicture(null); // Clear the selected file
                setProfilePicturePreview(null); // Clear preview
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setProfilePicture(null); // Clear selected file
        setProfilePicturePreview(null); // Clear preview
    };

    return (
        <div className="flex">
            <UserSideNav />
            <div className="flex flex-col w-full">
                <div className="w-[77%] ml-[21.5%]">
                    <div className="bg-[#403993] text-white rounded-lg shadow-lg p-6 mb-8 mt-4">
                        {!!profileData && (
                            <div className="flex items-center">
                                <div className="relative">
                                    <Avatar
                                        // src={profilePicturePreview || (profileData?.profilePicture ? `https://nuifms-predep-10ceea2df468.herokuapp.com/${profileData.profilePicture}` : "")}
                                        // src={profilePicturePreview || (profileData?.profilePicture ? `http://localhost:3001/${profileData.profilePicture}` : "")}
                                        src={profilePicturePreview || (profileData?.profilePicture ? `https://nuifms-9d4130efadd1.herokuapp.com/${profileData.profilePicture}` : "")}
                                        alt="Profile"
                                        sx={{ width: 100, height: 100 }}
                                        className="relative"
                                    />
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
                                    <h2 className="text-xl font-semibold">{profileData.firstName} {profileData.lastName}</h2>
                                    <p className="text-gray-300">{profileData.position}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-center mb-8 text-[#4a90e2]">Profile</h2>

                        {profileData && (
                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    label="First Name"
                                    name="firstName"
                                    value={formData.firstName || ''}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName || ''}
                                    onChange={handleChange}
                                    disabled={!editMode}
                                    fullWidth
                                    size="small"
                                />
                                <TextField
                                    label="Department"
                                    name="dept"
                                    value={formData.dept || ''}
                                    onChange={handleChange}
                                    disabled={!editMode}
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
                        )}

                        <div className="text-center mt-8">
                            {loading ? (
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
                                        onClick={handleCancel} // Use handleCancel to revert changes
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
