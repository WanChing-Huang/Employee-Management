import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout, isHR } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = isHR ? [
    { path: '/hr/dashboard', label: 'Dashboard' },
    { path: '/hr/employees', label: 'Employee Profiles' },
    { path: '/hr/visa-management', label: 'Visa Management' },
    { path: '/hr/hiring', label: 'Hiring Management' },
  ] : [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/personal-info', label: 'Personal Information' },
    { path: '/onboarding', label: 'Onboarding' },
    { path: '/visa-status', label: 'Visa Status' },
  ];

  return (
    <div>
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="navbar-brand">
          Employee Management
        </div>
        <ul className="navbar-nav">
          <li>
            <span className="nav-link">
              Welcome, {user?.username || 'User'} ({user?.role || 'Role'})
            </span>
          </li>
          <li>
            <button className="nav-link" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <ul className="sidebar-nav">
          {menuItems.map((item) => (
            <li key={item.path}>
              <a
                href="#"
                className={location.pathname === item.path ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {children}
      </div>

      {/* Mobile sidebar toggle */}
      <button 
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: window.innerWidth <= 768 ? 'block' : 'none',
          position: 'fixed',
          top: '70px',
          left: '10px',
          zIndex: 1001,
          background: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          cursor: 'pointer'
        }}
      >
        ☰
      </button>
    </div>
  );
};

export default Layout; 