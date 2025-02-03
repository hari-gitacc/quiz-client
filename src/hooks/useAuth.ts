// frontend/src/hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { login, logout } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = async (username: string, password: string) => {
    try {
      await dispatch(login({ username, password }));
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return {
    user,
    token,
    loading,
    error,
    login: handleLogin,
    logout: handleLogout,
    isAuthenticated: !!token,
  };
};