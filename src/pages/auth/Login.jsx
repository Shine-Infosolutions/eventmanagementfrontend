import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Session management utility
const SessionManager = {
  isLoggedIn() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const loginTime = sessionStorage.getItem('loginTime');
    
    if (!token) return false;
    
    if (loginTime) {
      const now = Date.now();
      const sessionAge = now - parseInt(loginTime);
      const maxAge = 24 * 60 * 60 * 1000;
      
      if (sessionAge > maxAge) {
        this.clearSession();
        return false;
      }
    }
    
    return true;
  },

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('loginTime');
  }
};

const API_URL = import.meta.env.VITE_API_URL || 'https://eventbackend-pi.vercel.app';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                   day === 2 || day === 22 ? 'nd' :
                   day === 3 || day === 23 ? 'rd' : 'th';
    return { day: `${day}${suffix}`, month, year };
  };

  const { day, month, year } = formatDate(currentDate);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    try {
      const loginData = formData.identifier.includes('@') 
        ? { email: formData.identifier, password: formData.password }
        : { mobile: formData.identifier, password: formData.password };
      
      console.log('Attempting login to:', `${API_URL}/api/auth/login`);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
        signal: AbortSignal.timeout(15000)
      });
      
      if (response.status === 429) {
        return;
      }
      
      const result = await response.json();
      console.log('Login response:', result);
      
      const token = result.token || result.accessToken || result.authToken;
      if (token) {
        // Store in both localStorage and sessionStorage for persistence
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(result.user || { name: 'Super Admin', role: 'Admin' }));
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(result.user || { name: 'Super Admin', role: 'Admin' }));
        sessionStorage.setItem('loginTime', Date.now().toString());
        navigate('/dashboard');
      } else {
        alert('Login successful but no token received: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Fallback login for development
      if (formData.identifier === 'admin' && formData.password === 'admin') {
        const devToken = 'dev-token-123';
        const devUser = JSON.stringify({ name: 'Admin User', role: 'admin' });
        localStorage.setItem('token', devToken);
        localStorage.setItem('user', devUser);
        sessionStorage.setItem('token', devToken);
        sessionStorage.setItem('user', devUser);
        sessionStorage.setItem('loginTime', Date.now().toString());
        navigate('/dashboard');
        return;
      }
      
      if (error.name === 'TimeoutError') {
        alert('Login timeout. Please try again.');
      } else {
        alert('Cannot connect to server. Using demo login: admin/admin');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo and Brand */}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-lg flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-orange-600 mb-2">EVENT</h1>
            <h2 className="text-2xl font-light text-gray-700 mb-6">MASTER</h2>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Login</h3>
            <p className="text-gray-600">Please use your email and password to login</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full px-4 py-4 bg-white border-b-2 border-gray-200 focus:border-orange-400 outline-none text-gray-700 placeholder-gray-400 transition-colors duration-200"
                  placeholder="Email or Mobile"
                  value={formData.identifier}
                  onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                />
                <div className="absolute right-3 top-4">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                </div>
              </div>
              
              <div className="relative">
                <input
                  type="password"
                  required
                  className="w-full px-4 py-4 bg-white border-b-2 border-gray-200 focus:border-orange-400 outline-none text-gray-700 placeholder-gray-400 transition-colors duration-200"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <div className="absolute right-3 top-4">
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <label className="text-gray-600 text-sm">Keep me logged in</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-amber-600 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'LOGIN'}
            </button>

            <div className="text-center">
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">Trouble Logging in?</a>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Date Display with Event Theme */}
      <div className="flex-1 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-purple-500 rounded-full opacity-80"></div>
        <div className="absolute top-32 left-32 w-16 h-16 bg-indigo-600 rounded-full opacity-70"></div>
        <div className="absolute bottom-32 right-20 w-32 h-32 bg-purple-400 rounded-full opacity-60"></div>
        <div className="absolute top-1/2 left-10 w-2 h-2 bg-black rounded-full"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-black rounded-full"></div>
        <div className="absolute bottom-1/3 right-10 w-2 h-2 bg-black rounded-full"></div>
        
        <div className="text-center text-white z-10">
          <div className="text-8xl font-light mb-4">{day} 🎉</div>
          <div className="text-6xl font-light mb-8">{month}, 🎊</div>
          <div className="text-6xl font-light">{year} ✨</div>
        </div>
        
        {/* Top right circle indicator */}
        <div className="absolute top-8 right-8 w-12 h-12 border-4 border-cyan-300 rounded-full flex items-center justify-center">
          <div className="w-3 h-3 bg-cyan-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}