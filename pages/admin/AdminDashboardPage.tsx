import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../../services/firebase';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { UserData, WithdrawalRequest } from '../../types';

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
    </svg>
);
const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
    </svg>
);
const ClockIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPoints: 0,
        pendingWithdrawals: 0,
        completedWithdrawals: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersRef = ref(db, 'users');
        const withdrawalsRef = ref(db, 'withdrawals');

        const usersUnsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                const users: UserData[] = Object.values(usersData);
                setStats(prev => ({
                    ...prev,
                    totalUsers: users.length,
                    totalPoints: users.reduce((acc, user) => acc + (user.points || 0), 0),
                }));
            }
             setLoading(false);
        });

        const withdrawalsUnsubscribe = onValue(withdrawalsRef, (snapshot) => {
            if (snapshot.exists()) {
                const requests: WithdrawalRequest[] = Object.values(snapshot.val());
                setStats(prev => ({
                    ...prev,
                    pendingWithdrawals: requests.filter(r => r.status === 'pending').length,
                    completedWithdrawals: requests.filter(r => r.status === 'completed').length,
                }));
            }
             setLoading(false);
        });

        return () => {
            usersUnsubscribe();
            withdrawalsUnsubscribe();
        };
    }, []);
    
    if (loading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>
    }

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-text-primary">Admin Overview</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<UsersIcon />} />
                <StatCard title="Total Points in Circulation" value={stats.totalPoints} icon={<DollarIcon />} />
                <StatCard title="Pending Withdrawals" value={stats.pendingWithdrawals} icon={<ClockIcon />} />
                <StatCard title="Completed Withdrawals" value={stats.completedWithdrawals} icon={<CheckCircleIcon />} />
            </div>
        </div>
    );
};

export default AdminDashboardPage;
