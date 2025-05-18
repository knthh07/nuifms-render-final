import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Avatar, IconButton, TextField, Button, CircularProgress, Skeleton, Modal, Typography, FormControl, InputLabel, Select, MenuItem, FormHelperText } from "@mui/material";
import { PhotoCamera, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from 'react-hot-toast';
import Loader from "../hooks/Loader";
import LayoutComponent from './LayoutComponent';

const Profile = () => {
    const { profile } = useContext(AuthContext);
    const [profileData, setProfileData] = useState({ firstName: "Loading...", lastName: "Loading...", dept: "Loading...", idNum: "Loading...", email: "Loading...", profilePicture: "" });
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [offices, setOffices] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, officesRes] = await Promise.all([
                    axios.get('/api/profile', { withCredentials: true }),
                    axios.get('/api/offices')
                ]);
                setProfileData(profileRes.data);
                setFormData(profileRes.data);
                setOffices(officesRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [profile]);

    const handleEditClick = () => setEditMode(true);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleChangeDept = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (profilePicture) await handleUpload();
            if (!formData.dept) {
                setError('Department is required.');
                return;
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
        if (!profilePicture) return;
        const uploadFormData = new FormData();
        uploadFormData.append('profilePicture', profilePicture);
        try {
            setLoading(true);
            const response = await axios.post('/api/uploadProfilePictureUser', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            if (response.status === 200) {
                setProfileData(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
                setProfilePicture(null);
                setProfilePicturePreview(null);
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
            const response = await axios.put('/api/changePassword', { currentPassword, newPassword });
            response.data.error ? toast.error(response.data.error) : (toast.success(response.data.message), setCurrentPassword(''), setNewPassword(''), setConfirmPassword(''), setModalOpen(false));
        } catch (error) {
            toast.error(error.response?.data?.error || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const passwordFieldStyles = {
        '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#4a90e2' },
            '&:hover fieldset': { borderColor: '#4a90e2' },
            '&.Mui-focused fieldset': { borderColor: '#4a90e2' },
        },
        marginBottom: '1rem',
    };

    return (
        <LayoutComponent>
            <div className="flex flex-col w-full p-6">
                <div className="bg-[#35408e] text-white rounded-lg shadow-lg p-4 mb-4 mt-4">
                    <div className="flex items-center">
                        <div className="relative">
                            {loading ? <Skeleton variant="circular" width={80} height={80} /> : 
                                <Avatar src={profilePicturePreview || profileData.profilePicture || ""} alt="Profile" sx={{ width: 50, height: 50 }} />}
                            {editMode && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                    <input accept="image/*" style={{ display: 'none' }} id="icon-button-file" type="file" onChange={handleFileChange} />
                                    <label htmlFor="icon-button-file">
                                        <IconButton aria-label="upload picture" component="span" sx={{ color: 'white' }}><PhotoCamera /></IconButton>
                                    </label>
                                </div>
                            )}
                        </div>
                        <div className="ml-4 flex flex-col justify-center">
                            <h2 className="text-lg font-semibold">{loading ? <Skeleton width={100} /> : `${profileData.firstName} ${profileData.lastName}`}</h2>
                            <p className="text-gray-300">{loading ? <Skeleton width={60} /> : profileData.position}</p>
                        </div>
                    </div>
                    <div className="w-full h-1 bg-[#FFC72C] mt-2 rounded-md" />
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-center mb-8 text-[#4a90e2]">Profile</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <TextField label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleChange} disabled fullWidth size="small" />
                        <TextField label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleChange} disabled fullWidth size="small" />
                        <FormControl fullWidth size="small" error={!!error} disabled={!editMode || loading}>
                            <InputLabel id="department-label" sx={{ background: 'white', paddingX: 0.5 }}>Department</InputLabel>
                            <Select labelId="department-label" name="dept" value={formData.dept || ''} onChange={handleChangeDept} displayEmpty>
                                <MenuItem sx={{ color: 'black' }} value=""><em>None</em></MenuItem>
                                {offices.map((office) => <MenuItem key={office._id} sx={{ color: 'black' }} value={office.name}>{office.name}</MenuItem>)}
                            </Select>
                            {error && <FormHelperText>{error}</FormHelperText>}
                        </FormControl>
                        <TextField label="ID Number" name="idNum" value={formData.idNum || ''} disabled fullWidth size="small" />
                        <TextField label="Email" name="email" value={formData.email || ''} disabled fullWidth size="small" />
                        <div className="flex items-center">
                            <Lock sx={{ color: editMode ? 'black' : 'gray', cursor: editMode ? 'pointer' : 'default' }} onClick={() => editMode && setModalOpen(true)} />
                            <Typography variant="body2" sx={{ marginLeft: 1, cursor: editMode ? 'pointer' : 'default' }} onClick={() => editMode && setModalOpen(true)}>Change Password</Typography>
                        </div>
                    </div>

                    <div className="text-center mt-8">
                        {loading ? <CircularProgress /> : editMode ? (
                            <>
                                <Button variant="contained" color="primary" onClick={handleSave} sx={{ mr: 2 }}>Save</Button>
                                <Button variant="outlined" color="secondary" onClick={handleCancel}>Cancel</Button>
                            </>
                        ) : <Button variant="contained" color="primary" onClick={handleEditClick}>Edit Profile</Button>}
                    </div>
                </div>

                <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                    <div className="flex items-center justify-center h-full">
                        <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                            <h2 className="text-center mb-4 text-[#4a90e2] font-semibold text-lg">Change Password</h2>
                            <TextField label="Current Password" type={showCurrentPassword ? "text" : "password"} fullWidth size="small" margin="normal" value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)} variant="outlined" InputLabelProps={{ sx: { color: '#4a90e2' } }} sx={passwordFieldStyles}
                                InputProps={{ endAdornment: <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton> }} />
                            <TextField label="New Password" type={showNewPassword ? "text" : "password"} fullWidth size="small" margin="normal" value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)} variant="outlined" InputLabelProps={{ sx: { color: '#4a90e2' } }} sx={passwordFieldStyles}
                                InputProps={{ endAdornment: <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton> }} />
                            <TextField label="Confirm New Password" type={showConfirmPassword ? "text" : "password"} fullWidth size="small" margin="normal" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)} variant="outlined" InputLabelProps={{ sx: { color: '#4a90e2' } }} sx={passwordFieldStyles}
                                InputProps={{ endAdornment: <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton> }} />
                            <div className="text-center mt-6">
                                <Button variant="outlined" color="secondary" onClick={() => setModalOpen(false)} sx={{ mr: 2, color: '#4a90e2', borderColor: '#4a90e2', '&:hover': { borderColor: '#3e7bc0', color: '#3e7bc0' } }}>Cancel</Button>
                                <Button variant="contained" color="primary" onClick={handleChangePassword} sx={{ bgcolor: '#4a90e2', '&:hover': { bgcolor: '#3e7bc0' } }}>Change Password</Button>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Loader isLoading={loading} />
            </div>
        </LayoutComponent>
    );
};

export default Profile;