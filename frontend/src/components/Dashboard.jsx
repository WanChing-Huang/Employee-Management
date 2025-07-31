import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setError(null);
      }
      
      const response = await axios.get(`/api/onboarding/user/${user.id}`);
      setUserProfile(response.data);
      setLastRefresh(new Date());
      
      if (isRefresh) {
        // Show a brief success message for manual refresh
        console.log('Profile refreshed successfully');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // User profile doesn't exist, they need to complete onboarding
        setUserProfile(null);
      } else {
        setError('Failed to load profile data');
        console.error('Profile fetch error:', error);
      }
    } finally {
      setLoading(false);
      if (isRefresh) {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchUserProfile(true);
  };

  const getOnboardingStatus = () => {
    if (!userProfile) {
      return {
        status: 'not_started',
        message: 'Onboarding not started',
        action: 'Start Onboarding',
        path: '/onboarding'
      };
    }

    switch (userProfile.status) {
      case 'Pending':
        return {
          status: 'pending',
          message: 'Onboarding application submitted - awaiting HR review',
          action: 'View Application',
          path: '/onboarding'
        };
      case 'Rejected':
        return {
          status: 'rejected',
          message: 'Onboarding application needs changes',
          action: 'Update Application',
          path: '/onboarding'
        };
      case 'Approved':
        return {
          status: 'approved',
          message: 'Onboarding application approved',
          action: 'View Profile',
          path: '/personal-info'
        };
      default:
        return {
          status: 'unknown',
          message: 'Status unknown',
          action: 'Check Application',
          path: '/onboarding'
        };
    }
  };

  const quickActions = [
    {
      title: 'Personal Information',
      description: 'Update your personal details and contact information',
      icon: '👤',
      path: '/personal-info',
      enabled: userProfile?.status === 'Approved'
    },
    {
      title: 'Visa Status',
      description: 'Manage your work authorization documents',
      icon: '📄',
      path: '/visa-status',
      enabled: userProfile?.status === 'Approved' && userProfile?.workAuthorization?.visaType === 'F1(CPT/OPT)'
    },
    {
      title: 'Documents',
      description: 'View and download your uploaded documents',
      icon: '📁',
      path: '/personal-info#documents',
      enabled: userProfile?.status === 'Approved'
    }
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const onboardingStatus = getOnboardingStatus();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.username}!</h1>
        <p className="page-subtitle">Manage your employee information and documents</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Onboarding Status Card */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-between align-center">
            <h2 className="card-title">Onboarding Status</h2>
            <div className="d-flex gap-1 align-center">
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh status"
              >
                {refreshing ? '🔄' : '🔄'} {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <span className={`status-badge status-${onboardingStatus.status}`}>
                {onboardingStatus.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        <div className="card-body">
          <p className="mb-1">{onboardingStatus.message}</p>
          {userProfile?.feedback && userProfile.status === 'Rejected' && (
            <div className="alert alert-warning">
              <strong>HR Feedback:</strong> {userProfile.feedback}
            </div>
          )}
          
          {/* Status help text */}
          {userProfile?.status === 'Pending' && (
            <div className="alert alert-info">
              <strong>📋 Waiting for HR Review:</strong> Your application is being reviewed. 
              HR will approve or provide feedback for any needed changes. 
              Use the refresh button above to check for updates.
            </div>
          )}
          
          <div className="d-flex justify-between align-center">
            <button 
              className="btn btn-primary"
              onClick={() => navigate(onboardingStatus.path)}
            >
              {onboardingStatus.action}
            </button>
            
            {lastRefresh && (
              <small className="text-muted">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </small>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="d-flex" style={{ flexDirection: 'column', gap: '15px' }}>
            {quickActions.map((action, index) => (
              <div 
                key={index}
                className={`d-flex align-center gap-1 p-1 ${!action.enabled ? 'opacity-50' : ''}`}
                style={{
                  border: '1px solid #e1e8ed',
                  borderRadius: '6px',
                  cursor: action.enabled ? 'pointer' : 'not-allowed'
                }}
                onClick={() => action.enabled && navigate(action.path)}
              >
                <div style={{ fontSize: '24px', marginRight: '10px' }}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '600' }}>
                    {action.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    {action.description}
                  </p>
                  {!action.enabled && (
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#e74c3c' }}>
                      {action.title === 'Visa Status' 
                        ? 'Available for F1(CPT/OPT) visa holders only' 
                        : 'Complete onboarding first'}
                    </p>
                  )}
                </div>
                {action.enabled && (
                  <div style={{ fontSize: '18px', color: '#3498db' }}>
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Profile Summary */}
      {userProfile && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Profile Summary</h2>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-col">
                <strong>Name:</strong> {userProfile.firstName} {userProfile.lastName}
              </div>
              <div className="form-col">
                <strong>Email:</strong> {userProfile.email}
              </div>
            </div>
            <div className="form-row">
              <div className="form-col">
                <strong>Phone:</strong> {userProfile.cellPhone || 'Not provided'}
              </div>
              <div className="form-col">
                <strong>Work Authorization:</strong> {
                  userProfile.workAuthorization?.isPermanentResidentOrCitizen 
                    ? userProfile.workAuthorization.residentType 
                    : userProfile.workAuthorization?.visaType
                }
              </div>
            </div>
            <div className="mt-1">
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/personal-info')}
                disabled={userProfile.status !== 'Approved'}
              >
                View Full Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 