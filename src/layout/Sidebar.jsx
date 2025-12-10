import { useState } from 'react';

const Sidebar = ({ user, currentView, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = {
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊' },
      { id: 'sell', label: 'Sell Pass', icon: '🎫' },
      { id: 'bookings', label: 'All Bookings', icon: '📋' },
      { id: 'gate', label: 'Gate Entry', icon: '🚪' },
    ],
    sales: [
      { id: 'sell', label: 'Sell Pass', icon: '🎫' },
      { id: 'bookings', label: 'My Sales', icon: '📋' },
    ],
    gate: [
      { id: 'gate', label: 'Gate Entry', icon: '🚪' },
      { id: 'bookings', label: 'Entry Log', icon: '📋' },
    ]
  };

  const items = menuItems[user.role] || [];

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
        <nav className="mt-6">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                currentView === item.id ? 'bg-blue-600 border-r-4 border-blue-400' : ''
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

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