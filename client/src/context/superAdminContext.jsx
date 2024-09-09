import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const SuperAdminContext = createContext({});

export function SuperAdminContextProvider({ children }) {
    const [superAdmin, setSuperAdmin] = useState(null);

    useEffect(() => {
        axios.get('/api/profileSuperAdmin')
            .then(({ data }) => {
                setSuperAdmin(data);
            })
            .catch(error => {
                console.error('Error fetching admin data:', error);
            });
    }, []);

    const clearCookie = () => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setSuperAdmin(null);
    };

    return (
        <SuperAdminContext.Provider value={{ superAdmin, setSuperAdmin, clearCookie }}>
            {children}
        </SuperAdminContext.Provider>
    );
}
