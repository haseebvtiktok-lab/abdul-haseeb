
import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const NavIcon = ({ path }: { path: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

const navigation = [
    { name: 'Dashboard', href: '/', iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'View Ads', href: '/view-ads', iconPath: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
    { name: 'Withdraw', href: '/withdraw', iconPath: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Profile', href: '/profile', iconPath: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const activeLinkClass = 'bg-accent text-primary';
    const inactiveLinkClass = 'text-text-secondary hover:bg-slate-700 hover:text-text-primary';

  const content = (
      <div className="flex flex-col flex-1">
          <div className="flex items-center justify-center flex-shrink-0 h-16 px-4 bg-primary border-b border-secondary">
              <h1 className="text-2xl font-bold text-accent">EarnSite</h1>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => (
                  <NavLink
                      key={item.name}
                      to={item.href}
                      end
                      className={({ isActive }) => 
                        `flex items-center px-2 py-2 text-sm font-medium rounded-md ${isActive ? activeLinkClass : inactiveLinkClass}`
                      }
                      onClick={() => setSidebarOpen(false)}
                  >
                      <NavIcon path={item.iconPath} />
                      {item.name}
                  </NavLink>
              ))}
          </nav>
      </div>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="relative flex flex-col w-64 max-w-xs bg-secondary">{content}</div>
        <div className="flex-shrink-0 w-14"></div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
              {content}
          </div>
      </div>
    </>
  );
};

export default Sidebar;
