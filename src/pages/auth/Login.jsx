import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    
    try {
      const loginData = formData.identifier.includes('@') 
        ? { email: formData.identifier, password: formData.password }
        : { mobile: formData.identifier, password: formData.password };
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      if (response.status === 429) {
        return;
      }
      
      const result = await response.json();
      console.log('Login response:', result);
      
      const token = result.token || result.accessToken || result.authToken;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(result.user || { name: 'Super Admin', role: 'Admin' }));
        navigate('/dashboard');
      } else {
        alert('Login successful but no token received: ' + JSON.stringify(result));
      }
    } catch (error) {
      alert('Login error occurred');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email or Mobile"
              value={formData.identifier}
              onChange={(e) => setFormData({...formData, identifier: e.target.value})}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-3 sm:py-2 border border-gray-300 placeholder-gray-500 text-gray-900 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password (try: admin@123)"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}