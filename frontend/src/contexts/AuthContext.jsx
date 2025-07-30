import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (token) {
        try {
          const response = await axios.get('/api/users/check-auth', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data.isAuthenticated) {
            setUser(response.data.user);
          } else {
            // Token is invalid, clear it
            logout();
          }
        } catch {
          // Token is invalid, clear it
          logout();
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [token]);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/users/login', {
        email,
        password
      });

      const { token: newToken, user: userData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  // Register function
  const register = async (registrationData) => {
    try {
      const response = await axios.post('/api/users/register', registrationData);
      
      const { token: newToken, user: userData } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  // Check if user is HR
  const isHR = () => {
    return user?.role === 'hr';
  };

  // Check if user is Employee
  const isEmployee = () => {
    return user?.role === 'employee';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    isHR,
    isEmployee
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 