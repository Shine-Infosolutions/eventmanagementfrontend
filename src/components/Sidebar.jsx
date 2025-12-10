import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MdDashboard, MdConfirmationNumber, MdList, MdLogin, MdExitToApp } from 'react-icons/md';
import { FiUsers } from 'react-icons/fi';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAppContext();

  const menuItems = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: MdDashboard, path: '/dashboard' },
      { id: 'sell', label: 'Sell Pass', icon: MdConfirmationNumber, path: '/sell-pass' },
      { id: 'bookings', label: 'All Bookings', icon: MdList, path: '/bookings' },
      { id: 'gate', label: 'Gate Entry', icon: MdLogin, path: '/gate-entry' },
    ],
    sales: [
      { id: 'sell', label: 'Sell Pass', icon: MdConfirmationNumber, path: '/sell-pass' },
      { id: 'bookings', label: 'My Sales', icon: MdList, path: '/bookings' },
    ],
    gate: [
      { id: 'gate', label: 'Gate Entry', icon: MdLogin, path: '/gate-entry' },
      { id: 'bookings', label: 'Entry Log', icon: MdList, path: '/bookings' },
    ]
  };

  const items = menuItems[user?.role] || [];

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Event Pass System</h2>
          <p className="text-sm text-gray-300 mt-1">{user?.name}</p>
          <span className="inline-block px-2 py-1 text-xs bg-blue-600 rounded-full mt-2 capitalize">
            {user?.role}
          </span>
        </div>

        <nav className="mt-6">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                location.pathname === item.path ? 'bg-blue-600 border-r-4 border-blue-400' : ''
              }`}
            >
              <item.icon className="mr-3 text-lg" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-900 hover:text-red-300 rounded-md transition-colors"
          >
            <MdExitToApp className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;