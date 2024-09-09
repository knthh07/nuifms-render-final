import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const AdminContext = createContext({});

export function AdminContextProvider({ children }) {
    const [admin, setAdmin] = useState(null);

    useEffect(() => {
        axios.get('/api/profileAdmin')
            .then(({ data }) => {
                setAdmin(data);
            })
            .catch(error => {
                console.error('Error fetching admin data:', error);
            });
    }, []);

    const clearCookie = () => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setAdmin(null);
    };

    return (
        <AdminContext.Provider value={{ admin, setAdmin, clearCookie }}>
            {children}
        </AdminContext.Provider>
    );
}
