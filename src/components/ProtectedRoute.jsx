import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, setUser } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser && !user) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [user, setUser]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const token = localStorage.getItem('token');
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;