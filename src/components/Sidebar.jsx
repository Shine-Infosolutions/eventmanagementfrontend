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
    Admin: [
      { id: 'dashboard', label: 'Dashboard', icon: MdDashboard, path: '/dashboard' },
      { id: 'sell', label: 'Sell Pass', icon: MdConfirmationNumber, path: '/sell-pass' },
      { id: 'bookings', label: 'All Bookings', icon: MdList, path: '/bookings' },
      { id: 'gate', label: 'Gate Entry', icon: MdLogin, path: '/gate-entry' },
    ],
    'Sales Staff': [
      { id: 'sell', label: 'Sell Pass', icon: MdConfirmationNumber, path: '/sell-pass' },
      { id: 'bookings', label: 'My Sales', icon: MdList, path: '/bookings' },
    ],
    'Gate Staff': [
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
      <div className={`fixed inset-y-0 left-0 z-40 w-64 sm:w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold truncate">Event Pass System</h2>
          <p className="text-sm text-gray-300 mt-1 truncate">{user?.name}</p>
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
              className={`w-full flex items-center px-4 sm:px-6 py-3 text-sm sm:text-base text-left hover:bg-gray-800 transition-colors ${
                location.pathname === item.path ? 'bg-blue-600 border-r-4 border-blue-400' : ''
              }`}
            >
              <item.icon className="mr-2 sm:mr-3 text-lg flex-shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 sm:p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 sm:px-4 py-2 text-sm sm:text-base text-red-400 hover:bg-red-900 hover:text-red-300 rounded-md transition-colors"
          >
            <MdExitToApp className="mr-2 sm:mr-3 flex-shrink-0" />
            Logout
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;