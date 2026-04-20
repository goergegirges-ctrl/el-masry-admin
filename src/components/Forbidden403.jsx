import React from 'react';
import { useNavigate } from 'react-router-dom';

const Forbidden403 = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800 p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-9xl font-extrabold text-red-500 animate-pulse">403</h1>
        <h2 className="text-3xl font-bold">Access Denied</h2>
        <p className="text-lg text-gray-600">
          Your account doesn't have admin access. Log in with an admin account to continue.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
          >
            Log in as admin
          </button>
          <button 
            onClick={() => window.location.href = 'http://localhost:5173'} // Redirect to frontend root
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Forbidden403;
