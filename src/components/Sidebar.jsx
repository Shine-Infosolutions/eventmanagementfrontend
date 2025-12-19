import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { MdDashboard, MdConfirmationNumber, MdList, MdLogin, MdExitToApp, MdPeople } from 'react-icons/md';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAppContext();

  const menuItems = {
    Admin: [
      { id: 'dashboard', label: 'Dashboard', icon: MdDashboard, path: '/dashboard' },
      { id: 'users', label: 'User Management', icon: MdPeople, path: '/users' },
      { id: 'sell', label: 'Sell Pass', icon: MdConfirmationNumber, path: '/sell-pass' },
      { id: 'manage-pass-types', label: 'Manage Pass Types', icon: () => <span className="text-lg">🎫</span>, path: '/manage-pass-types' },
      { id: 'bookings', label: 'All Bookings', icon: MdList, path: '/bookings' },
      { id: 'gate', label: 'Gate Entry', icon: MdLogin, path: '/gate-entry' },
    ],
    'Sales Staff': [
      { id: 'sell', label: 'Sell Pass', icon: MdConfirmationNumber, path: '/sell-pass' },
      { id: 'bookings', label: 'Bookings List', icon: MdList, path: '/bookings' },
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
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold truncate">Event Pass System</h2>
          <p className="text-sm text-gray-300 mt-1 truncate">{user?.name}</p>
          <span className="inline-block px-2 py-1 text-xs bg-blue-600 rounded-full mt-2 capitalize">
            {user?.role}
          </span>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 text-sm text-left hover:bg-gray-800 transition-colors ${
                location.pathname === item.path ? 'bg-blue-600 border-r-4 border-blue-400' : ''
              }`}
            >
              <item.icon className="mr-3 text-lg flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-400 hover:bg-red-900 hover:text-red-300 rounded-md transition-colors"
          >
            <MdExitToApp className="mr-3 flex-shrink-0" />
            <span className="truncate">Logout</span>
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