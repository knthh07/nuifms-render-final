import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export function AuthContextProvider({ children }) {
    const [profile, setProfile] = useState();
    const [role, setRole] = useState();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: profileData } = await axios.get('/api/profile');
                const { data: roleData } = await axios.get('/api/getRole');

                setProfile(profileData);
                setRole(roleData);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            }
        };
        fetchProfile();
    }, []);

    return (
        <AuthContext.Provider value={{ profile, setProfile, role, setRole }}>
            {children}
        </AuthContext.Provider>
    );
}
