import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout, isHR } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Employee Management System
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {user?.username} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Personal Information Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete your profile information and upload required documents.
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* HR Only Cards */}
            {isHR() && (
              <>
                {/* User Management Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      User Management
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Manage employee accounts and registration tokens.
                    </p>
                    <Link
                      to="/users"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      Manage Users
                    </Link>
                  </div>
                </div>

                {/* Profile Reviews Card */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Profile Reviews
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Review and approve employee profile submissions.
                    </p>
                    <Link
                      to="/reviews"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      Review Profiles
                    </Link>
                  </div>
                </div>
              </>
            )}

            {/* Employee Only Cards */}
            {!isHR() && (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Onboarding
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Complete your onboarding process and submit required documents.
                  </p>
                  <Link
                    to="/onboarding"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Onboarding
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 