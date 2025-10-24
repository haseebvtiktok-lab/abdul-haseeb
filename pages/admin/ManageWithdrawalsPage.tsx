import React, { useState, useEffect, useMemo } from 'react';
import { ref, onValue, update, runTransaction } from 'firebase/database';
import { db } from '../../services/firebase';
import type { WithdrawalRequest, UserData } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Notification from '../../components/Notification';

const ManageWithdrawalsPage: React.FC = () => {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [users, setUsers] = useState<{[key: string]: UserData}>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'completed' | 'rejected'>('pending');
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const requestsRef = ref(db, 'withdrawals');
        const usersRef = ref(db, 'users');
        
        const requestsUnsubscribe = onValue(requestsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setRequests(list.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } else {
                setRequests([]);
            }
            setLoading(false);
        });
        
        const usersUnsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                setUsers(snapshot.val());
            }
        });

        return () => {
            requestsUnsubscribe();
            usersUnsubscribe();
        };
    }, []);
    
    const handleUpdateRequest = async (req: WithdrawalRequest, newStatus: 'completed' | 'rejected') => {
        try {
            if (newStatus === 'completed') {
                // Use a transaction to ensure atomicity
                const userPointsRef = ref(db, `users/${req.userId}/points`);
                await runTransaction(userPointsRef, (currentPoints) => {
                    if (currentPoints === null) {
                         // This case might happen if points node doesn't exist. Abort.
                        return;
                    }
                    if (currentPoints < req.amount) {
                        // Abort transaction if insufficient points
                        console.error('User has insufficient points. Transaction aborted.');
                        // Throwing an error here is a good way to signal failure.
                        throw new Error('Insufficient points.');
                    }
                    return currentPoints - req.amount;
                });
            }
            // If transaction succeeds (or status is rejected), update the request status
            await update(ref(db, `withdrawals/${req.id}`), { status: newStatus });
            setNotification({ message: `Request updated to ${newStatus}.`, type: 'success' });
        } catch (error: any) {
             setNotification({ message: `Failed to update request: ${error.message}`, type: 'error' });
        }
    };
    
    const filteredRequests = useMemo(() => {
        return requests.map(r => ({
            ...r,
            userName: users[r.userId]?.name || 'Unknown',
            userEmail: users[r.userId]?.email || 'Unknown',
        })).filter(r => r.status === filter);
    }, [requests, users, filter]);

    if (loading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            <h2 className="text-2xl font-semibold text-text-primary">Manage Withdrawals</h2>
            
            <div className="flex space-x-2 border-b border-slate-700">
                {(['pending', 'completed', 'rejected'] as const).map(status => (
                    <button key={status} onClick={() => setFilter(status)} className={`px-4 py-2 text-sm font-medium capitalize -mb-px border-b-2 ${filter === status ? 'border-accent text-accent' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                        {status}
                    </button>
                ))}
            </div>

             <div className="overflow-x-auto rounded-lg shadow-lg bg-secondary">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-primary">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">User</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Amount</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Wallet</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Date</th>
                             {filter === 'pending' && <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredRequests.map((req) => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-text-primary">{req.userName}</div>
                                    <div className="text-sm text-text-secondary">{req.userEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-primary">{req.amount}</td>
                                <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">{req.walletAddress}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{new Date(req.date).toLocaleString()}</td>
                                {filter === 'pending' && (
                                    <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                                        <button onClick={() => handleUpdateRequest(req, 'completed')} className="text-green-400 hover:text-green-300">Approve</button>
                                        <button onClick={() => handleUpdateRequest(req, 'rejected')} className="text-red-400 hover:text-red-300">Reject</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageWithdrawalsPage;