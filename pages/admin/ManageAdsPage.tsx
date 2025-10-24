import React, { useState, useEffect } from 'react';
import { ref, onValue, push, update, remove } from 'firebase/database';
import { db } from '../../services/firebase';
import type { Ad } from '../../types';
import LoadingSpinner from '../../components/LoadingSpinner';
import Notification from '../../components/Notification';
import Modal from '../../components/Modal';

const ManageAdsPage: React.FC = () => {
    const [ads, setAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAd, setCurrentAd] = useState<Partial<Ad> | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const adsRef = ref(db, 'ads');
        const unsubscribe = onValue(adsRef, (snapshot) => {
            if (snapshot.exists()) {
                const adsData = snapshot.val();
                const adsList = Object.keys(adsData).map(key => ({
                    id: key,
                    ...adsData[key]
                }));
                setAds(adsList);
            } else {
                setAds([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const openModal = (ad: Partial<Ad> | null = null) => {
        setCurrentAd(ad || { title: '', reward: 10, duration: 15, url: 'https://' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentAd(null);
    };

    const handleSave = async () => {
        if (!currentAd) return;
        
        const adData = {
            title: currentAd.title,
            reward: Number(currentAd.reward),
            duration: Number(currentAd.duration),
            url: currentAd.url
        };

        try {
            if (currentAd.id) {
                // Update existing ad
                const adRef = ref(db, `ads/${currentAd.id}`);
                await update(adRef, adData);
                setNotification({ message: 'Ad updated successfully!', type: 'success' });
            } else {
                // Add new ad
                const adsRef = ref(db, 'ads');
                await push(adsRef, adData);
                setNotification({ message: 'Ad added successfully!', type: 'success' });
            }
        } catch (error) {
            setNotification({ message: 'Failed to save ad.', type: 'error' });
        } finally {
            closeModal();
        }
    };
    
    const handleDelete = async (adId: string) => {
        if (window.confirm('Are you sure you want to delete this ad?')) {
            try {
                await remove(ref(db, `ads/${adId}`));
                setNotification({ message: 'Ad deleted successfully.', type: 'success' });
            } catch (error) {
                setNotification({ message: 'Failed to delete ad.', type: 'error' });
            }
        }
    };


    if (loading) {
        return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-6">
            {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-text-primary">Manage Ads</h2>
                <button onClick={() => openModal()} className="px-4 py-2 font-medium text-white rounded-md bg-accent hover:bg-sky-500">
                    Add New Ad
                </button>
            </div>
            
            <div className="overflow-x-auto rounded-lg shadow-lg bg-secondary">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-primary">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Title</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Reward</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Duration</th>
                            <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {ads.map((ad) => (
                            <tr key={ad.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-text-primary">{ad.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-primary">{ad.reward}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-text-primary">{ad.duration}s</td>
                                <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                    <button onClick={() => openModal(ad)} className="text-indigo-400 hover:text-indigo-300">Edit</button>
                                    <button onClick={() => handleDelete(ad.id)} className="text-red-400 hover:text-red-300">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentAd && (
                <Modal title={currentAd.id ? 'Edit Ad' : 'Add New Ad'} onClose={closeModal}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Title</label>
                            <input type="text" value={currentAd.title} onChange={(e) => setCurrentAd({...currentAd, title: e.target.value})} className="w-full px-3 py-2 mt-1 text-white border rounded-md bg-primary border-slate-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Reward (Points)</label>
                            <input type="number" value={currentAd.reward} onChange={(e) => setCurrentAd({...currentAd, reward: Number(e.target.value)})} className="w-full px-3 py-2 mt-1 text-white border rounded-md bg-primary border-slate-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Duration (Seconds)</label>
                            <input type="number" value={currentAd.duration} onChange={(e) => setCurrentAd({...currentAd, duration: Number(e.target.value)})} className="w-full px-3 py-2 mt-1 text-white border rounded-md bg-primary border-slate-600" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary">URL</label>
                            <input type="text" value={currentAd.url} onChange={(e) => setCurrentAd({...currentAd, url: e.target.value})} className="w-full px-3 py-2 mt-1 text-white border rounded-md bg-primary border-slate-600" />
                        </div>
                        <div className="flex justify-end pt-4 space-x-2">
                            <button onClick={closeModal} className="px-4 py-2 font-medium text-gray-300 bg-transparent border border-gray-500 rounded-md hover:bg-slate-700">Cancel</button>
                            <button onClick={handleSave} className="px-4 py-2 font-medium text-white rounded-md bg-accent hover:bg-sky-500">Save</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ManageAdsPage;
