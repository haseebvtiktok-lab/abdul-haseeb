import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { get, ref } from 'firebase/database';

import { app, db } from './services/firebase';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ViewAdsPage from './pages/ViewAdsPage';
import WithdrawPage from './pages/WithdrawPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageWithdrawalsPage from './pages/admin/ManageWithdrawalsPage';
import ManageAdsPage from './pages/admin/ManageAdsPage';
import AdminRoute from './components/admin/AdminRoute';

const auth = getAuth(app);

export const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userRef = ref(db, `users/${currentUser.uid}`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    setUserRole(userData.role || 'user');
                    setIsBlocked(userData.status === 'blocked');
                } else {
                    setUserRole('user');
                    setIsBlocked(false);
                }
            } else {
                setUser(null);
                setUserRole(null);
                setIsBlocked(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-primary">
                <LoadingSpinner />
            </div>
        );
    }

    const UserRoutes = () => (
        <Layout>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/view-ads" element={<ViewAdsPage />} />
                <Route path="/withdraw" element={<WithdrawPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Layout>
    );
    
    const AdminRoutes = () => (
        <AdminLayout>
            <Routes>
                <Route path="/dashboard" element={<AdminDashboardPage />} />
                <Route path="/users" element={<ManageUsersPage />} />
                <Route path="/withdrawals" element={<ManageWithdrawalsPage />} />
                <Route path="/ads" element={<ManageAdsPage />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
            </Routes>
        </AdminLayout>
    );

    return (
        <HashRouter>
            <Routes>
                <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/" />} />
                <Route
                    path="/admin/*"
                    element={
                        <AdminRoute user={user} role={userRole}>
                           <AdminRoutes />
                        </AdminRoute>
                    }
                />
                <Route
                    path="/*"
                    element={
                        user ? (
                            isBlocked ? (
                                <Navigate to="/auth" /> // Or a dedicated 'blocked' page
                            ) : userRole === 'admin' ? (
                                <Navigate to="/admin/dashboard" />
                            ) : (
                                <UserRoutes />
                            )
                        ) : (
                            <Navigate to="/auth" />
                        )
                    }
                />
            </Routes>
        </HashRouter>
    );
};


export default App;
