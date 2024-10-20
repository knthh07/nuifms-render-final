import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Avatar, IconButton, TextField, Button, CircularProgress, Skeleton } from "@mui/material";
import { PhotoCamera, Lock as LockIcon } from "@mui/icons-material"; // Import the Lock icon
import UserSideNav from '../Components/user_sidenav/UserSideNav';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
    const { profile } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({
        firstName: "Loading...", // Placeholder value
        lastName: "Loading...",  // Placeholder value
        dept: "Loading...",      // Placeholder value
        idNum: "Loading...",     // Placeholder value
        email: "Loading...",     // Placeholder value
        profilePicture: ""       // Placeholder for profile picture
    });
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null); // New state for preview
    const [loading, setLoading] = useState(true);

    // Change Password State
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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
            } finally {
                setLoading(false); // Stop loading after data is fetched
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
            await axios.put("/api/updateProfileUser", formData, { withCredentials: true });
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

    // Handle change password
    const handleChangePassword = async () => {
        // Validate all fields are filled
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }

        // Validate that new password matches confirm password
        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            const response = await axios.put('/api/changePassword', {
                currentPassword,
                newPassword,
            });

            // Check if response has an error and show the appropriate message
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                toast.success(response.data.message);
                // Clear password fields after successful change
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setChangePasswordMode(false); // Close change password mode on success
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'An error occurred');
        }
    };

    return (
        <div className="flex">
            <UserSideNav />
            <div className="flex flex-col w-full">
                <div className="w-[77%] ml-[21.5%]">
                    <div className="bg-[#403993] text-white rounded-lg shadow-lg p-6 mb-8 mt-4">
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center">
                                {loading ? (
                                    <Skeleton variant="circular" width={100} height={100} />
                                ) : (
                                    <Avatar
                                        src={profilePicturePreview || profileData.profilePicture || ""}
                                        alt="Profile"
                                        sx={{ width: 100, height: 100 }}
                                    />
                                )}
                                <div className="ml-4 flex flex-col">
                                    <h2 className="text-xl font-semibold">{loading ? <Skeleton width={120} /> : `${profileData.firstName} ${profileData.lastName}`}</h2>
                                    <p className="text-gray-300">{loading ? <Skeleton width={80} /> : profileData.position}</p>
                                </div>
                            </div>
                            {/* Lock Icon on the far right */}
                            <IconButton sx={{ color: 'white' }} onClick={() => setChangePasswordMode(true)}>
                                <LockIcon />
                            </IconButton>
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
                                disabled
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName || ''}
                                onChange={handleChange}
                                disabled
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

                    {/* Change Password Section */}
                    <div className="bg-white rounded-lg shadow-lg p-8 mt-8">
                        <h2 className="text-center mb-8 text-[#4a90e2]">Change Password</h2>

                        {changePasswordMode ? (
                            <>
                                <TextField
                                    label="Current Password"
                                    type="password"
                                    fullWidth
                                    size="small"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <TextField
                                    label="New Password"
                                    type="password"
                                    fullWidth
                                    size="small"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <TextField
                                    label="Confirm New Password"
                                    type="password"
                                    fullWidth
                                    size="small"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                                <div className="text-center mt-4">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleChangePassword}
                                    >
                                        Change Password
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => setChangePasswordMode(false)}
                                        sx={{ ml: 2 }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setChangePasswordMode(true)}
                                >
                                    Change Password
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
