import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme/theme';
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
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </Box>
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
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={isHR ? "/hr/dashboard" : "/dashboard"} replace />;
  }

  return children;
};

// 404 Page Component
const NotFoundPage = () => (
  <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
    bgcolor="background.default"
    px={3}
  >
    <Paper
      elevation={3}
      sx={{
        p: 6,
        textAlign: 'center',
        maxWidth: 500,
        width: '100%',
      }}
    >
      <Typography variant="h1" color="primary" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        href="/login"
        sx={{ px: 4 }}
      >
        Go to Login
      </Button>
    </Paper>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
