import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { ref, onValue } from 'firebase/database';
import StatCard from '../components/StatCard';
import type { UserData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const DollarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
    </svg>
);

const UsersIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const DashboardPage: React.FC = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const user = auth.currentUser;
    const referralLink = user ? `${window.location.origin}${window.location.pathname}#/auth?ref=${user.uid}` : '';

    useEffect(() => {
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            const unsubscribe = onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    setUserData(snapshot.val());
                }
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, [user]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            setNotification({ message: 'Referral link copied!', type: 'success' });
        }, () => {
            setNotification({ message: 'Failed to copy link.', type: 'error' });
        });
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
    }

    if (!userData) {
        return <div className="text-center text-text-secondary">Could not load user data.</div>;
    }

    return (
        <div className="space-y-8">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            <h2 className="text-2xl font-semibold text-text-primary">Welcome, {userData.name}!</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <StatCard title="Total Points" value={userData.points} icon={<DollarIcon />} />
                <StatCard title="Referrals" value={userData.referrals} icon={<UsersIcon />} />
            </div>

            <div className="p-6 rounded-lg shadow-lg bg-secondary">
                <h3 className="text-lg font-semibold text-text-primary">Your Referral Link</h3>
                <p className="mt-2 text-sm text-text-secondary">Share this link with your friends to earn referral bonuses!</p>
                <div className="flex items-center mt-4 space-x-2">
                    <input type="text" readOnly value={referralLink} className="w-full px-3 py-2 text-sm rounded-md bg-primary text-text-secondary border-slate-600" />
                    <button onClick={copyToClipboard} className="px-4 py-2 text-sm font-medium text-white transition-colors duration-150 rounded-md bg-accent hover:bg-sky-500 whitespace-nowrap">
                        Copy Link
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Link to="/view-ads" className="block p-6 text-center transition duration-300 ease-in-out transform rounded-lg shadow-lg bg-accent text-primary hover:scale-105">
                    <h3 className="text-xl font-bold">View Ads</h3>
                    <p className="mt-2">Earn points by watching ads.</p>
                </Link>
                <Link to="/withdraw" className="block p-6 text-center transition duration-300 ease-in-out transform rounded-lg shadow-lg bg-secondary text-text-primary hover:bg-slate-600 hover:scale-105">
                    <h3 className="text-xl font-bold">Withdraw</h3>
                    <p className="mt-2">Request a withdrawal of your points.</p>
                </Link>
            </div>
        </div>
    );
};

export default DashboardPage;
