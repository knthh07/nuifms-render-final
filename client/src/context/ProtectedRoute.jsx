import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const ProtectedRoute = () => {
    const { profile } = useContext(AuthContext);

    const PageRouteProtection = ({providedRole}) => {
        if (profile != undefined){
            return profile === null ? <Navigate to='/' /> : <>{profile === providedRole ?  <Outlet /> : <>{profile != providedRole && <Navigator to='/login' />}</>}</>
        }
    }

    const AuthPageProtection = () => {
        return profile === null ? <Outlet /> : <>{profile === 'admin' ? <Navigate to='/AdminDashboard' /> : <>{role === 'superAdmin' && <Navigate to='/SuperAdminDashboard' />}</> }</>
    }

    return {PageRouteProtection, AuthPageProtection};
};

export default ProtectedRoute;
