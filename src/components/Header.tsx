import React from 'react';
import { useNavigate } from 'react-router-dom';
import type{ User } from '../types';

interface HeaderProps {
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-2xl font-bold">RMT</div>
          <div className="ml-4 text-sm">Revive Medical Technologies</div>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user.username} ({user.role})</span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
