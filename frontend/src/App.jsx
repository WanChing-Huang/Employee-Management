import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PersonalInformation from './components/PersonalInformation';
import OnboardingForm from './components/OnboardingForm';
import VisaStatus from './components/VisaStatus';
import HRDashboard from './components/HRDashboard';
import EmployeeProfiles from './components/EmployeeProfiles';
import HRVisaManagement from './components/HRVisaManagement';
import HiringManagement from './components/HiringManagement';

// Protected Route Component
const ProtectedRoute = ({ children, hrOnly = false }) => {
  const { isAuthenticated, isHR, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (hrOnly && !isHR) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Layout>
      {children}
    </Layout>
  );
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isHR, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isHR ? "/hr/dashboard" : "/dashboard"} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />

          {/* Employee Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/personal-info" element={
            <ProtectedRoute>
              <PersonalInformation />
            </ProtectedRoute>
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingForm />
            </ProtectedRoute>
          } />
          <Route path="/visa-status" element={
            <ProtectedRoute>
              <VisaStatus />
            </ProtectedRoute>
          } />

          {/* HR Routes */}
          <Route path="/hr/dashboard" element={
            <ProtectedRoute hrOnly={true}>
              <HRDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hr/employees" element={
            <ProtectedRoute hrOnly={true}>
              <EmployeeProfiles />
            </ProtectedRoute>
          } />
          <Route path="/hr/visa-management" element={
            <ProtectedRoute hrOnly={true}>
              <HRVisaManagement />
            </ProtectedRoute>
          } />
          <Route path="/hr/hiring" element={
            <ProtectedRoute hrOnly={true}>
              <HiringManagement />
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 Not Found */}
          <Route path="*" element={
            <div className="auth-container">
              <div className="auth-card text-center">
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/login" className="auth-link">Go to Login</a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
