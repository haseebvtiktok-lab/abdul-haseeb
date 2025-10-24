import React from 'react';
import { Navigate } from 'react-router-dom';
import type { User } from 'firebase/auth';

interface AdminRouteProps {
    user: User | null;
    role: string | null;
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ user, role, children }) => {
    if (!user) {
        return <Navigate to="/auth" />;
    }

    if (role !== 'admin') {
        return <Navigate to="/" />; // Redirect non-admins to the user dashboard
    }
    
    return <>{children}</>;
};

export default AdminRoute;
