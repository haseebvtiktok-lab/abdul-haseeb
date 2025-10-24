import React from 'react';
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
    { name: 'Dashboard', href: '/admin/dashboard', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'Manage Users', href: '/admin/users', iconPath: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2' },
    { name: 'Withdrawals', href: '/admin/withdrawals', iconPath: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'Manage Ads', href: '/admin/ads', iconPath: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h2m-4 3V5a2 2 0 012-2h2a2 2 0 012 2v3m-4 7h2' },
];

const AdminSidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const activeLinkClass = 'bg-accent text-primary';
    const inactiveLinkClass = 'text-text-secondary hover:bg-slate-700 hover:text-text-primary';

  const content = (
      <div className="flex flex-col flex-1">
          <div className="flex items-center justify-center flex-shrink-0 h-16 px-4 bg-primary border-b border-secondary">
              <h1 className="text-2xl font-bold text-accent">Admin Panel</h1>
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

export default AdminSidebar;
