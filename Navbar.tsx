import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold">🗳️ Voting System</h1>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {user?.role === 'admin' ? (
                  <>
                    <Link
                      to="/admin"
                      className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/admin/elections"
                      className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Elections
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/elections"
                      className="hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Elections
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-sm mr-4">
                Welcome, <span className="font-medium">{user?.name}</span>
                <span className="ml-2 px-2 py-1 bg-blue-500 rounded-full text-xs">
                  {user?.role}
                </span>
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;