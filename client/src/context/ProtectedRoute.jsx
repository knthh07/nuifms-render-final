import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoutes = ({ allowedRoles }) => {
    const { profile, role } = useContext(AuthContext);

    if (profile === undefined) {
        // Optionally show a loading spinner or nothing until profile is fetched
        return null;
    }

    if (profile === null) {
        return <Navigate to='/' />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to='/' />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;
