import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAppContext();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const mockUsers = {
      'admin@event.com': { role: 'admin', name: 'Admin User' },
      'sales@event.com': { role: 'sales', name: 'Sales Staff' },
      'gate@event.com': { role: 'gate', name: 'Gate Staff' }
    };
    
    setTimeout(() => {
      const user = mockUsers[credentials.email];
      if (user && credentials.password === '123456') {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role === 'admin') {
          navigate('/dashboard');
        } else if (user.role === 'sales') {
          navigate('/sell-pass');
        } else if (user.role === 'gate') {
          navigate('/gate-entry');
        }
      } else {
        alert('Invalid credentials');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Pass System</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600 text-center mb-2">Demo Accounts:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Admin: admin@event.com</div>
            <div>Sales: sales@event.com</div>
            <div>Gate: gate@event.com</div>
            <div className="font-medium">Password: 123456</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;