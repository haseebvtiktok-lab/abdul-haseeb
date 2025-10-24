
import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, get, update } from 'firebase/database';
import type { UserData } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const ProfilePage: React.FC = () => {
    const [name, setName] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const user = auth.currentUser;

    useEffect(() => {
        if (user) {
            const userRef = ref(db, `users/${user.uid}`);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setUserData(data);
                    setName(data.name || '');
                    setWalletAddress(data.walletAddress || '');
                }
                setUserLoading(false);
            });
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const userRef = ref(db, `users/${user.uid}`);
            await update(userRef, { name, walletAddress });
            if (user.displayName !== name) {
                await updateProfile(user, { displayName: name });
            }
            setNotification({ message: 'Profile updated successfully!', type: 'success' });
        } catch (error: any) {
            setNotification({ message: `Update failed: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.email) return;
        if (!currentPassword || !newPassword) {
            setNotification({ message: 'Please fill out all password fields.', type: 'error' });
            return;
        }
        setLoading(true);

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setNotification({ message: 'Password updated successfully!', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
        } catch (error: any) {
            setNotification({ message: `Password update failed: ${error.message}`, type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    
    if (userLoading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>
    }

    return (
        <div className="space-y-12">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            
            {/* Profile Information Form */}
            <div className="p-8 rounded-lg shadow-lg bg-secondary">
                <h2 className="text-xl font-bold text-accent">Profile Information</h2>
                <p className="mt-1 text-sm text-text-secondary">Update your account's profile information and email address.</p>
                <form onSubmit={handleProfileUpdate} className="mt-6 space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Name</label>
                        <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="block w-full px-3 py-2 mt-1 text-white border rounded-md shadow-sm bg-primary border-slate-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="walletAddress" className="block text-sm font-medium text-text-secondary">Wallet Address</label>
                        <input type="text" id="walletAddress" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="block w-full px-3 py-2 mt-1 text-white border rounded-md shadow-sm bg-primary border-slate-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-accent hover:bg-sky-500 focus:outline-none disabled:bg-slate-500">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Password Update Form */}
            <div className="p-8 rounded-lg shadow-lg bg-secondary">
                <h2 className="text-xl font-bold text-accent">Update Password</h2>
                <p className="mt-1 text-sm text-text-secondary">Ensure your account is using a long, random password to stay secure.</p>
                <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-6">
                    <div>
                        <label htmlFor="current_password" className="block text-sm font-medium text-text-secondary">Current Password</label>
                        <input type="password" id="current_password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="block w-full px-3 py-2 mt-1 text-white border rounded-md shadow-sm bg-primary border-slate-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="new_password" className="block text-sm font-medium text-text-secondary">New Password</label>
                        <input type="password" id="new_password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full px-3 py-2 mt-1 text-white border rounded-md shadow-sm bg-primary border-slate-600 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm" />
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white rounded-md bg-accent hover:bg-sky-500 focus:outline-none disabled:bg-slate-500">
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
