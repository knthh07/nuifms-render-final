import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get('/api/profile')
            .then(({ data }) => {
                setUser(data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    const clearCookie = () => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, clearCookie }}>
            {children}
        </UserContext.Provider>
    );
}
