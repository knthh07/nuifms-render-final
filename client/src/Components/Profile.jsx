import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Avatar, IconButton, TextField, Button, CircularProgress, Skeleton, Modal, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { PhotoCamera, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from 'react-hot-toast';
import Loader from "../hooks/Loader";
import LayoutComponent from './LayoutComponent'; // Import the new layout component

const Profile = () => {
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
    const [error, setError] = useState('');

    // Change Password State
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/profile', { withCredentials: true });
                if (response.status === 200) {
                    setProfileData(response.data);
                    setFormData(response.data);
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

    const handleChangeDept = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear error on change
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (profilePicture) {
                await handleUpload();
            }
            if (!formData.dept) {
                setError('Department is required.'); // Set error message
                return; // Prevent further execution
            }
            await axios.put("/api/updateProfile", formData, { withCredentials: true });
            setProfileData(formData);
            setEditMode(false);
            setProfilePicturePreview(null);
            toast.success('Profile updated!');
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        setProfilePicturePreview(URL.createObjectURL(file));
    };

    const handleUpload = async () => {
        if (!profilePicture) {
            console.error("No profile picture selected.");
            return;
        }

        const uploadFormData = new FormData();
        uploadFormData.append('profilePicture', profilePicture);

        try {
            setLoading(true);
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
                setProfilePicture(null);
                setProfilePicturePreview(null);
            } else {
                console.error("Unexpected response status:", response.status);
            }
        } catch (error) {
            console.error("Error uploading profile picture:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setProfilePicture(null);
        setProfilePicturePreview(null);
    };

    // Handle change password
    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.put('/api/changePassword', {
                currentPassword,
                newPassword,
            });

            // Check if there is an error in the response
            if (response.data.error) {
                toast.error(response.data.error);
            } else {
                toast.success(response.data.message);
                // Clear the password fields after a successful change
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setModalOpen(false); // Close the modal
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LayoutComponent>

            <div className="flex flex-col w-full p-6">
                <div className="bg-[#35408e] text-white rounded-lg shadow-lg p-4 mb-4 mt-4">
                    {/* Profile Avatar and Info Section */}
                    <div className="flex items-center">
                        <div className="relative">
                            {loading ? (
                                <Skeleton variant="circular" width={80} height={80} />
                            ) : (
                                <Avatar
                                    src={profilePicturePreview || profileData.profilePicture || ""}
                                    alt="Profile"
                                    sx={{ width: 50, height: 50 }}
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
                            <h2 className="text-lg font-semibold">
                                {loading ? <Skeleton width={100} /> : `${profileData.firstName} ${profileData.lastName}`}
                            </h2>
                            <p className="text-gray-300">
                                {loading ? <Skeleton width={60} /> : profileData.position}
                            </p>
                        </div>
                    </div>
                    {/* Yellow Strip Below the Banner */}
                    <div className="w-full h-1 bg-[#FFC72C] mt-2 rounded-md" />
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
                        <FormControl fullWidth size="small" error={!!error} disabled={!editMode || loading}>
                            <InputLabel id="department-label" sx={{ background: 'white', paddingX: 0.5 }}>
                                Department
                            </InputLabel>
                            <Select
                                labelId="department-label"
                                name="dept"
                                value={formData.dept || ''}
                                onChange={handleChangeDept}
                                displayEmpty
                            >
                                <MenuItem sx={{ color: 'black' }} value="Admissions">Admissions</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Alumni/marketing and communications office - manila">Alumni/marketing and communications office - manila</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Athletics office">Athletics office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Athlete academic development office">Athlete academic development office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Asset management office">Asset management office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="AVP-academic services">Avp-academic services</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="AVP-administration">Avp-administration</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Business development and linkages">Business development and linkages</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Bulldogs exchange">Bulldogs exchange</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Center for innovative and sustainable development">Center for innovative and sustainable development</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="CFO">Cfo</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="College of allied health">College of allied health</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="College of computing and information technologies">College of computing and information technologies</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="College of engineering">College of engineering</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="College of tourism and hospitality management">College of tourism and hospitality management</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="COMEX/NSTP">Comex/nstp</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Construction and facilities management office">Construction and facilities management office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Data privacy office">Data privacy office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Education technology">Education technology</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Faculty and administration office">Faculty and administration office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Finance shared">Finance shared</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="General accounting and budgeting - manila">General accounting and budgeting - manila</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Guidance services office">Guidance services office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Health services">Health services</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Human resources - manila">Human resources - manila</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="International student services office">International student services office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="IT systems office">IT systems office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Learning resource center">Learning resource center</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Legacy office">Legacy office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Motorpool">Motorpool</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="National university alumni foundation inc">National university alumni foundation inc</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="NUCSG office">Nucsg office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Payroll office">Payroll office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Physical facilities management office">Physical facilities management office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Quality management office">Quality management office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="QMO manila">Qmo manila</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Registrar">Registrar</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Research and development">Research and development</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Safety and security">Safety and security</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Safety office">Safety office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Student development and activities office">Student development and activities office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Technology services office">Technology services office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="Treasury office">Treasury office</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-administrative services">Vp-administrative services</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-corporate affairs">Vp-corporate affairs</MenuItem>
                                <MenuItem sx={{ color: 'black' }} value="VP-operations">Vp-operations</MenuItem>
                            </Select>
                            {error && <FormHelperText>{error}</FormHelperText>}
                        </FormControl>
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
                        <div className="flex items-center">
                            <Lock
                                sx={{ color: editMode ? 'black' : 'gray', cursor: editMode ? 'pointer' : 'default' }}
                                onClick={() => editMode && setModalOpen(true)} // Open modal on lock icon click
                            />
                            <Typography
                                variant="body2" // Adjust the variant as needed
                                sx={{ marginLeft: 1, cursor: editMode ? 'pointer' : 'default' }} // Add margin for spacing
                                onClick={() => editMode && setModalOpen(true)} // Make label clickable to open modal
                            >
                                Change Password
                            </Typography>
                        </div>
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

                {/* Change Password Modal */}
                <Modal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                            <h2 id="modal-title" className="text-center mb-4 text-[#4a90e2] font-semibold text-lg">Change Password</h2>

                            {/* Current Password Field */}
                            <TextField
                                label="Current Password"
                                type={showCurrentPassword ? "text" : "password"}
                                fullWidth
                                size="small"
                                margin="normal"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                variant="outlined"
                                InputLabelProps={{ sx: { color: '#4a90e2' } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#4a90e2' },
                                        '&:hover fieldset': { borderColor: '#4a90e2' },
                                        '&.Mui-focused fieldset': { borderColor: '#4a90e2' },
                                    },
                                    marginBottom: '1rem',
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            edge="end"
                                            aria-label="toggle password visibility"
                                        >
                                            {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    ),
                                }}
                            />

                            {/* New Password Field */}
                            <TextField
                                label="New Password"
                                type={showNewPassword ? "text" : "password"}
                                fullWidth
                                size="small"
                                margin="normal"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                variant="outlined"
                                InputLabelProps={{ sx: { color: '#4a90e2' } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#4a90e2' },
                                        '&:hover fieldset': { borderColor: '#4a90e2' },
                                        '&.Mui-focused fieldset': { borderColor: '#4a90e2' },
                                    },
                                    marginBottom: '1rem',
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            edge="end"
                                            aria-label="toggle password visibility"
                                        >
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    ),
                                }}
                            />

                            {/* Confirm New Password Field */}
                            <TextField
                                label="Confirm New Password"
                                type={showConfirmPassword ? "text" : "password"}
                                fullWidth
                                size="small"
                                margin="normal"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                variant="outlined"
                                InputLabelProps={{ sx: { color: '#4a90e2' } }}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': { borderColor: '#4a90e2' },
                                        '&:hover fieldset': { borderColor: '#4a90e2' },
                                        '&.Mui-focused fieldset': { borderColor: '#4a90e2' },
                                    },
                                    marginBottom: '1rem',
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                            aria-label="toggle password visibility"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    ),
                                }}
                            />

                            <div className="text-center mt-6">

                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setModalOpen(false)}
                                    sx={{ mr: 2, color: '#4a90e2', borderColor: '#4a90e2', '&:hover': { borderColor: '#3e7bc0', color: '#3e7bc0' } }}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleChangePassword}
                                    sx={{
                                        bgcolor: '#4a90e2',
                                        '&:hover': { bgcolor: '#3e7bc0' },
                                    }}
                                >
                                    Change Password
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Loader isLoading={loading} />
            </div>
        </LayoutComponent >
    );
};

export default Profile;


