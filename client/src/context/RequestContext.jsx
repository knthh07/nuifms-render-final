// RequestsContext.js
import React, { createContext, useContext, useState } from 'react';

const RequestsContext = createContext();

export const useRequests = () => useContext(RequestsContext);

export const RequestsProvider = ({ children }) => {
    const [requests, setRequests] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    return (
        <RequestsContext.Provider value={{ requests, setRequests, totalPages, setTotalPages }}>
            {children}
        </RequestsContext.Provider>
    );
};
