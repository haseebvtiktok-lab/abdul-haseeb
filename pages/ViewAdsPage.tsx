
import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { ref, get, update, increment } from 'firebase/database';
import type { Ad } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

const ViewAdsPage: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingAd, setViewingAd] = useState<Ad | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      const adsRef = ref(db, 'ads');
      const snapshot = await get(adsRef);
      if (snapshot.exists()) {
        const adsData = snapshot.val();
        // Seeding some ads if none exist
        if(!adsData) {
            const initialAds = {
                'ad1': { title: 'Modern Web Solutions', reward: 10, duration: 15, url: '#' },
                'ad2': { title: 'Cloud Hosting Pro', reward: 15, duration: 20, url: '#' },
                'ad3': { title: 'Crypto Wallet Secure', reward: 5, duration: 10, url: '#' },
                'ad4': { title: 'Design Studio Creative', reward: 25, duration: 30, url: '#' },
            };
            await update(ref(db), { 'ads': initialAds });
            setAds(Object.entries(initialAds).map(([id, ad]) => ({ id, ...(ad as Omit<Ad, 'id'>) })));
        } else {
            const adsList = Object.entries(adsData).map(([id, ad]) => ({ id, ...(ad as Omit<Ad, 'id'>) }));
            setAds(adsList);
        }
      }
      setLoading(false);
    };

    fetchAds();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (viewingAd) {
      handleAdCompletion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);
  
  const handleAdView = (ad: Ad) => {
    setViewingAd(ad);
    setCountdown(ad.duration);
  };

  const handleAdCompletion = async () => {
    if (!viewingAd) return;

    const user = auth.currentUser;
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      await update(userRef, {
        points: increment(viewingAd.reward)
      });
      setNotification({ message: `You earned ${viewingAd.reward} points!`, type: 'success' });
      setViewingAd(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner /></div>;
  }

  if (viewingAd) {
    const progress = ((viewingAd.duration - countdown) / viewingAd.duration) * 100;
    return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg bg-secondary">
            <h3 className="mb-4 text-2xl font-bold text-accent">{viewingAd.title}</h3>
            <p className="mb-6 text-text-secondary">Please wait for the timer to finish...</p>
            <div className="w-full max-w-md bg-primary rounded-full h-8 dark:bg-gray-700">
                <div className="bg-accent h-8 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="mt-4 text-4xl font-mono font-bold text-text-primary">{countdown}s</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      {ads.length === 0 ? (
        <p className="text-center text-text-secondary">No ads available at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ads.map((ad) => (
            <div key={ad.id} className="p-6 transition duration-300 ease-in-out transform rounded-lg shadow-lg bg-secondary hover:-translate-y-1">
              <h3 className="text-lg font-semibold text-text-primary">{ad.title}</h3>
              <p className="mt-2 text-text-secondary">Reward: <span className="font-bold text-accent">{ad.reward} points</span></p>
              <p className="text-sm text-text-secondary">Duration: {ad.duration} seconds</p>
              <button
                onClick={() => handleAdView(ad)}
                className="w-full px-4 py-2 mt-4 text-sm font-medium text-white transition-colors duration-150 rounded-lg bg-accent hover:bg-sky-500 focus:outline-none"
              >
                View Ad
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAdsPage;
