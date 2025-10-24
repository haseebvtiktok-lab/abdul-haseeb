
import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { ref, push, get } from 'firebase/database';
import type { UserData, WithdrawalRequest } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const WithdrawPage: React.FC = () => {
    const [amount, setAmount] = useState('');
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [userLoading, setUserLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [history, setHistory] = useState<WithdrawalRequest[]>([]);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;
        const userRef = ref(db, `users/${user.uid}`);
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                setUserData(snapshot.val());
            }
            setUserLoading(false);
        });
        // You could also fetch withdrawal history here if needed
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const withdrawalAmount = parseInt(amount, 10);

        if (!user || !userData) {
            setNotification({ message: 'User not found.', type: 'error' });
            return;
        }
        if (isNaN(withdrawalAmount) || withdrawalAmount <= 0) {
            setNotification({ message: 'Please enter a valid amount.', type: 'error' });
            return;
        }
        if (withdrawalAmount > userData.points) {
            setNotification({ message: 'Insufficient points.', type: 'error' });
            return;
        }
        if (!userData.walletAddress) {
            setNotification({ message: 'Please set your wallet address in profile settings first.', type: 'error' });
            return;
        }

        setLoading(true);

        try {
            const withdrawalsRef = ref(db, 'withdrawals');
            const newRequest: Omit<WithdrawalRequest, 'id'> = {
                userId: user.uid,
                amount: withdrawalAmount,
                walletAddress: userData.walletAddress,
                date: new Date().toISOString(),
                status: 'pending'
            };
            await push(withdrawalsRef, newRequest);
            setNotification({ message: 'Withdrawal request submitted successfully!', type: 'success' });
            setAmount('');
        } catch (error) {
            setNotification({ message: 'Failed to submit request.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (userLoading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
    }

    return (
        <div className="max-w-xl mx-auto">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            <div className="p-8 rounded-lg shadow-lg bg-secondary">
                <h2 className="text-2xl font-bold text-center text-accent">Request Withdrawal</h2>
                <p className="mt-2 text-center text-text-secondary">Your current balance: <span className="font-bold text-white">{userData?.points || 0} points</span></p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">Amount</label>
                        <div className="relative mt-1 rounded-md shadow-sm">
                            <input
                                type="number"
                                name="amount"
                                id="amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="block w-full px-3 py-2 pr-12 text-white border rounded-md bg-primary border-slate-600 placeholder-text-secondary focus:ring-accent focus:border-accent sm:text-sm"
                                placeholder="0"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-text-secondary sm:text-sm">points</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-accent hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-slate-500"
                        >
                            {loading ? <LoadingSpinner /> : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawPage;
