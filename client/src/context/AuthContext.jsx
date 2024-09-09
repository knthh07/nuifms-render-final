import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext({});

export function AuthContextProvider({ children }) {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (token) {
            const fetchProfile = async () => {
                try {
                    const response = await axios.get('/api/profile');
                    if (response.status === 200) {
                        setProfile(response.data);
                    }
                } catch (error) {
                    console.error('Error fetching profile data:', error);
                }
            };

            fetchProfile();
        }
    }, []);

    return (
        <AuthContext.Provider value={{ profile, setProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
