import { useState, useEffect } from 'react';

const Sidebar = ({ user, currentView, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthToken(token);
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  });

  const menuItems = {
    Admin: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'sell', label: 'Sell Pass', icon: '🎫' },
      { id: 'bookings', label: 'All Bookings', icon: '📋' },
      { id: 'gate', label: 'Gate Entry', icon: '🚪' },
    ],
    'Sales Staff': [
      { id: 'sell', label: 'Sell Pass', icon: '🎫' },
      { id: 'bookings', label: 'My Sales', icon: '📋' },
    ],
    'Gate Staff': [
      { id: 'gate', label: 'Gate Entry', icon: '🚪' },
      { id: 'bookings', label: 'Entry Log', icon: '📋' },
    ]
  };

  const items = menuItems[user?.role] || [];

  console.log('Sidebar Debug:', { user, authToken, userRole: user?.role, items });

  // Always show sidebar for debugging
  // if (!user || !authToken) {
  //   return null;
  // }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Event Pass System</h2>
          <p className="text-sm text-gray-300 mt-1">{user.name}</p>
          <span className="inline-block px-2 py-1 text-xs bg-blue-600 rounded-full mt-2 capitalize">
            {user.role}
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1">
          <div className="space-y-2 px-4">
            <button className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 rounded-md transition-colors">
              <span className="mr-3 text-lg">📊</span>
              <span>Dashboard</span>
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 rounded-md transition-colors">
              <span className="mr-3 text-lg">🎫</span>
              <span>Sell Pass</span>
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 rounded-md transition-colors">
              <span className="mr-3 text-lg">📋</span>
              <span>All Bookings</span>
            </button>
            <button className="w-full flex items-center px-4 py-3 text-left text-white hover:bg-gray-800 rounded-md transition-colors">
              <span className="mr-3 text-lg">🚪</span>
              <span>Gate Entry</span>
            </button>
          </div>
        </nav>

        {/* User Info with Auth Status */}
        <div className="px-6 py-2 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Auth: {authToken ? '✅ Authenticated' : '❌ Not Authenticated'}
          </div>
        </div>

        {/* Logout */}
        <div className="absolute bottom-0 w-full p-6 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-red-900 hover:text-red-300 rounded-md transition-colors"
          >
            <span className="mr-3">🚪</span>
            Logout
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
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