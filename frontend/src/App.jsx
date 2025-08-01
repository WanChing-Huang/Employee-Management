import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container } from '@mui/material';
import './App.css';


// Components
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Onboarding from './pages/Onboarding';
import PersonalInfo from './pages/PersonalInfo';
import VisaStatus from './pages/VisaStatus';
import HRDashboard from './pages/HRDashboard';
import EmployeeList from './pages/EmployeeList';
import VisaManagement from './pages/VisaManagement';
import HiringManagement from './pages/HiringManagement';
import ReviewApplications from './pages/ReviewApplications';

function App() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  return (
    <div className="App">
      <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to={user?.role === 'hr' ? '/hr/dashboard' : '/dashboard'} /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/onboarding" /> : <Register />
      } />

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          {/* Employee Routes */}
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/personal-info" element={<PersonalInfo />} />
          <Route path="/visa-status" element={<VisaStatus />} />

          {/* HR Routes */}
          <Route path="/hr/dashboard" element={
            <PrivateRoute requireHR>
              <HRDashboard />
            </PrivateRoute>
          } />
          <Route path="/hr/employees" element={
            <PrivateRoute requireHR>
              <EmployeeList />
            </PrivateRoute>
          } />
          <Route path="/hr/visa-management" element={
            <PrivateRoute requireHR>
              <VisaManagement />
            </PrivateRoute>
          } />
          <Route path="/hr/hiring-management" element={
            <PrivateRoute requireHR>
              <HiringManagement />
            </PrivateRoute>
          } />
          <Route path="/hr/review/:profileId" element={
            <PrivateRoute requireHR>
              <ReviewApplications />
            </PrivateRoute>
          } />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
    </div>
  );
}

export default App;