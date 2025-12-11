import { useAppContext } from '../context/AppContext';

const Header = ({ toggleSidebar }) => {
  const { user } = useAppContext();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center min-w-0 flex-1">
          <button 
            onClick={toggleSidebar}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            title="Toggle Sidebar"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-2 lg:ml-0 min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Event Pass System</h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">New Year 2025</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;