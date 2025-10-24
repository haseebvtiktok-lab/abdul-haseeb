import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set, get, update, increment } from 'firebase/database';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      setIsLogin(false); // Default to sign up if there's a referral code
    }
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        
        const userData: any = {
          uid: user.uid,
          name: name,
          email: user.email,
          walletAddress: '',
          points: 0,
          referrals: 0,
          status: 'active',
          role: 'user'
        };

        // Handle referral
        if (referralCode) {
          const referrerRef = ref(db, `users/${referralCode}`);
          const referrerSnap = await get(referrerRef);
          if (referrerSnap.exists()) {
              userData.referredBy = referralCode;
              await update(referrerRef, {
                  referrals: increment(1)
              });
          }
        }

        // Create user data in Realtime Database
        await set(ref(db, 'users/' + user.uid), userData);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <div className="w-full max-w-md p-8 space-y-8 rounded-lg shadow-lg bg-secondary">
        <div>
          <h2 className="text-3xl font-extrabold text-center text-accent">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </h2>
          {referralCode && !isLogin && (
            <p className="mt-2 text-sm text-center text-text-secondary">You were referred! Sign up to continue.</p>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="sr-only">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="relative block w-full px-3 py-2 text-white border rounded-md appearance-none bg-primary border-slate-600 placeholder-text-secondary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full px-3 py-2 text-white border rounded-md appearance-none bg-primary border-slate-600 placeholder-text-secondary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full px-3 py-2 text-white border rounded-md appearance-none bg-primary border-slate-600 placeholder-text-secondary focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md group bg-accent hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-text-secondary">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-medium text-accent hover:text-sky-500">
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
