// frontend/src/components/common/Header.tsx
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { getUserFromToken } from '../../utils/auth';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
      const user = getUserFromToken();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  console.log(user);
  

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Quiz System</h1>
            </div>
          </div>
          
          <div className="flex items-center">
            <span className="text-gray-700 capitalize mr-4">
              Welcome, {user?.username}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;