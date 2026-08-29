import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import session from '../session';

// Validates active JWT sessions and enforces role-based access control, redirecting unauthorized users to secure endpoints.
function ProtectedRoute({ children, allowedRoles }) {
    const token = session.get('access'); 

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {

        jwtDecode(token); // only checks if token is valid

        const userRole = session.get('user_role');

        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/unauthorized" replace />;
        }

        return children;

    } catch (error) {

        session.remove('access');
        session.remove('refresh');
        session.remove('user_role');

        return <Navigate to="/login" replace />;
    }
}

export default ProtectedRoute;