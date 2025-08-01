import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  CircularProgress,
  IconButton,
  Divider,
  Avatar,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  CardMembership as VisaIcon,
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
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
        console.log('Profile refreshed successfully');
      }
    } catch (error) {
      if (error.response?.status === 404) {
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
        path: '/onboarding',
        color: 'default',
        icon: <ScheduleIcon />
      };
    }

    switch (userProfile.status) {
      case 'Pending':
        return {
          status: 'pending',
          message: 'Onboarding application submitted - awaiting HR review',
          action: 'View Application',
          path: '/onboarding',
          color: 'warning',
          icon: <ScheduleIcon />
        };
      case 'Rejected':
        return {
          status: 'rejected',
          message: 'Onboarding application needs changes',
          action: 'Update Application',
          path: '/onboarding',
          color: 'error',
          icon: <CancelIcon />
        };
      case 'Approved':
        return {
          status: 'approved',
          message: 'Onboarding application approved',
          action: 'View Profile',
          path: '/personal-info',
          color: 'success',
          icon: <CheckCircleIcon />
        };
      default:
        return {
          status: 'unknown',
          message: 'Status unknown',
          action: 'Check Application',
          path: '/onboarding',
          color: 'default',
          icon: <WarningIcon />
        };
    }
  };

  const quickActions = [
    {
      title: 'Personal Information',
      description: 'Update your personal details and contact information',
      icon: <PersonIcon />,
      path: '/personal-info',
      enabled: userProfile?.status === 'Approved',
      color: 'primary'
    },
    {
      title: 'Visa Status',
      description: 'Manage your work authorization documents',
      icon: <VisaIcon />,
      path: '/visa-status',
      enabled: userProfile?.status === 'Approved' && userProfile?.workAuthorization?.visaType === 'F1(CPT/OPT)',
      color: 'secondary'
    },
    {
      title: 'Documents',
      description: 'View and download your uploaded documents',
      icon: <FolderIcon />,
      path: '/personal-info#documents',
      enabled: userProfile?.status === 'Approved',
      color: 'info'
    }
  ];

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  const onboardingStatus = getOnboardingStatus();

  return (
    <Box>
      {/* Page Header */}
      <Paper
        elevation={2}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Welcome, {user?.username}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Manage your employee information and documents
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Onboarding Status Card */}
        <Grid item xs={12}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  {onboardingStatus.icon}
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Onboarding Status
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={refreshing}
                    color="primary"
                    size="small"
                  >
                    <RefreshIcon sx={{ 
                      animation: refreshing ? 'spin 1s linear infinite' : 'none',
                      '@keyframes spin': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' },
                      },
                    }} />
                  </IconButton>
                  <Chip
                    label={onboardingStatus.status.replace('_', ' ')}
                    color={onboardingStatus.color}
                    variant="filled"
                    sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                  />
                </Box>
              </Box>

              <Typography variant="body1" color="text.secondary" mb={2}>
                {onboardingStatus.message}
              </Typography>

              {/* Feedback for rejected applications */}
              {userProfile?.feedback && userProfile.status === 'Rejected' && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    HR Feedback:
                  </Typography>
                  <Typography variant="body2">
                    {userProfile.feedback}
                  </Typography>
                </Alert>
              )}

              {/* Status help text */}
              {userProfile?.status === 'Pending' && (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    📋 Waiting for HR Review:
                  </Typography>
                  <Typography variant="body2">
                    Your application is being reviewed. HR will approve or provide feedback for any needed changes. 
                    Use the refresh button above to check for updates.
                  </Typography>
                </Alert>
              )}

              <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
                <Button
                  variant="contained"
                  color={onboardingStatus.color}
                  size="large"
                  onClick={() => navigate(onboardingStatus.path)}
                  startIcon={onboardingStatus.icon}
                  sx={{ px: 4 }}
                >
                  {onboardingStatus.action}
                </Button>

                {lastRefresh && (
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Typography variant="h5" component="h2" fontWeight="bold" mb={3}>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            {quickActions.map((action, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={action.enabled ? 3 : 1}
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    cursor: action.enabled ? 'pointer' : 'not-allowed',
                    opacity: action.enabled ? 1 : 0.6,
                    '&:hover': action.enabled ? {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                    } : {},
                  }}
                  onClick={() => action.enabled && navigate(action.path)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: action.enabled ? `${action.color}.main` : 'grey.400',
                          width: 48,
                          height: 48,
                        }}
                      >
                        {action.icon}
                      </Avatar>
                      <Typography variant="h6" component="h3" fontWeight="bold">
                        {action.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      size="small"
                      color={action.color}
                      disabled={!action.enabled}
                      sx={{ fontWeight: 'bold' }}
                    >
                      {action.enabled ? 'Access' : 'Requires Approval'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Profile Summary */}
        {userProfile && (
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h5" component="h2" fontWeight="bold" mb={3}>
                  Profile Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {userProfile.firstName} {userProfile.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Full Name
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {userProfile.email}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Email Address
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {userProfile.workAuthorization?.visaType || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Visa Type
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {userProfile.cellPhone || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Phone Number
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard; 