import React, { useState, useEffect } from 'react';
import { ref, onValue, update, set } from 'firebase/database';
import { db } from '../../services/firebase';
import type { UserData } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Notification from '../../components/Notification';
import Modal from '../../components/Modal';

const ManageUsersPage: React.FC = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [isBonusModalOpen, setBonusModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [bonusAmount, setBonusAmount] = useState(0);

    useEffect(() => {
        const usersRef = ref(db, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const usersData = snapshot.val();
                setUsers(Object.values(usersData));
            } else {
                setUsers([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);
    
    const handleStatusToggle = async (user: UserData) => {
        const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
        try {
            await update(ref(db, `users/${user.uid}`), { status: newStatus });
            setNotification({ message: `User ${newStatus}.`, type: 'success' });
        } catch (error) {
            setNotification({ message: 'Failed to update user status.', type: 'error' });
        }
    };
    
    const handleResetPoints = async (user: UserData) => {
        if (window.confirm(`Are you sure you want to reset points for ${user.name}?`)) {
            try {
                await set(ref(db, `users/${user.uid}/points`), 0);
                setNotification({ message: 'User points reset.', type: 'success' });
            } catch (error) {
                setNotification({ message: 'Failed to reset points.', type: 'error' });
            }
        }
    };
    
    const openBonusModal = (user: UserData) => {
        setSelectedUser(user);
        setBonusAmount(0);
        setBonusModalOpen(true);
    };
    
    const handleAddBonus = async () => {
        if (!selectedUser || bonusAmount <= 0) return;
        try {
            const newPoints = (selectedUser.points || 0) + bonusAmount;
            await set(ref(db, `users/${selectedUser.uid}/points`), newPoints);
            setNotification({ message: `Added ${bonusAmount} points to ${selectedUser.name}.`, type: 'success' });
            setBonusModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            setNotification({ message: 'Failed to add bonus.', type: 'error' });
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            <h2 className="text-2xl font-semibold text-text-primary">Manage Users</h2>
            
            <div className="overflow-x-auto rounded-lg shadow-lg bg-secondary">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-primary">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Name</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Email</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Points</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Status</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map((user) => (
                            <tr key={user.uid}>
                                <td className="px-6 py-4 whitespace-nowrap text-text-primary">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-secondary">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-primary">{user.points}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'blocked' ? 'bg-red-900 text-red-100' : 'bg-green-900 text-green-100'}`}>
                                        {user.status || 'active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2 text-sm font-medium whitespace-nowrap">
                                    <button onClick={() => handleStatusToggle(user)} className={user.status === 'blocked' ? 'text-green-400' : 'text-red-400'}>{user.status === 'blocked' ? 'Unblock' : 'Block'}</button>
                                    <button onClick={() => handleResetPoints(user)} className="text-yellow-400">Reset Points</button>
                                    <button onClick={() => openBonusModal(user)} className="text-sky-400">Add Bonus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isBonusModalOpen && selectedUser && (
                <Modal title={`Add Bonus to ${selectedUser.name}`} onClose={() => setBonusModalOpen(false)}>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Bonus Amount</label>
                        <input type="number" value={bonusAmount} onChange={(e) => setBonusAmount(Number(e.target.value))} className="w-full px-3 py-2 mt-1 text-white border rounded-md bg-primary border-slate-600" />
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button onClick={() => setBonusModalOpen(false)} className="px-4 py-2 font-medium text-gray-300 bg-transparent border border-gray-500 rounded-md hover:bg-slate-700">Cancel</button>
                        <button onClick={handleAddBonus} className="px-4 py-2 font-medium text-white rounded-md bg-accent hover:bg-sky-500">Add Bonus</button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManageUsersPage;
