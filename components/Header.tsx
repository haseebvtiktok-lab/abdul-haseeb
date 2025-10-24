
import React from 'react';
import { useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
    const location = useLocation();

    const getTitle = () => {
        switch (location.pathname) {
            case '/':
                return 'Dashboard';
            case '/view-ads':
                return 'View Ads';
            case '/withdraw':
                return 'Withdraw Funds';
            case '/profile':
                return 'Profile Settings';
            default:
                return 'Dashboard';
        }
    };
    
    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    };

    return (
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-secondary shadow-md sm:px-6 lg:px-8">
            <div className="flex items-center">
                <button
                    className="text-text-secondary lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
                <h1 className="ml-4 text-xl font-semibold text-text-primary">{getTitle()}</h1>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium transition-colors duration-150 rounded-lg bg-accent hover:bg-sky-500 text-primary"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
            </button>
        </header>
    );
};

export default Header;
