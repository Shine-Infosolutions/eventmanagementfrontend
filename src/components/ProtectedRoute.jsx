import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children }) => {
  const { user, setUser } = useAppContext();

  useEffect(() => {
    if (!user) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [user, setUser]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;