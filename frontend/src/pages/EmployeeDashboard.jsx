import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Alert,
  Divider,
} from '@mui/material';
import {
  Person,
  Assignment,
  CheckCircle,
  Warning,
  Error,
  Pending,
} from '@mui/icons-material';
import { fetchMyProfile } from '../store/profileSlice';
import StatusBadge from '../components/StatusBadge';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, status, loading } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    // Redirect based on profile status
    if (!loading && ['Never Submitted', 'Rejected'].includes(status)) {
      navigate('/onboarding');
    }
  }, [status, loading, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'Approved':
        return <CheckCircle color="success" sx={{ fontSize: 60 }} />;
      case 'Pending':
        return <Pending color="warning" sx={{ fontSize: 60 }} />;
      case 'Rejected':
        return <Error color="error" sx={{ fontSize: 60 }} />;
      default:
        return <Warning color="action" sx={{ fontSize: 60 }} />;
    }
  };

  const showVisaStatus = profile?.workAuthorization?.visaType === 'F1(CPT/OPT)';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName} {user?.lastName}!
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Status Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              {getStatusIcon()}
              <Box>
                <Typography variant="h6">Onboarding Status</Typography>
                <StatusBadge status={status} size="large" />
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            {status === 'Pending' && (
              <Alert severity="info">
                Your onboarding application is under review by HR.
              </Alert>
            )}
            
            {status === 'Approved' && (
              <Alert severity="success">
                Your onboarding application has been approved. You can now manage your personal information.
              </Alert>
            )}
            
            {profile?.feedback && status === 'Rejected' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Feedback from HR:
                </Typography>
                {profile.feedback}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Person color="primary" />
                      <Typography variant="subtitle1">
                        Personal Information
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      View and update your personal details
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      onClick={() => navigate('/personal-info')}
                      disabled={status !== 'Approved'}
                    >
                      Manage
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              {showVisaStatus && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Assignment color="primary" />
                        <Typography variant="subtitle1">
                          Visa Status Management
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Upload and track your visa documents
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        onClick={() => navigate('/visa-status')}
                        disabled={status !== 'Approved'}
                      >
                        Manage
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Profile Summary */}
        {profile && status === 'Approved' && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Summary
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{profile.email}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography>{profile.cellPhone || 'Not provided'}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Work Authorization
                  </Typography>
                  <Typography>
                    {profile.workAuthorization?.isPermanentResidentOrCitizen 
                      ? profile.workAuthorization.residentType
                      : profile.workAuthorization?.visaType || 'Not provided'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography>
                    {profile.address?.city && profile.address?.state 
                      ? `${profile.address.city}, ${profile.address.state}`
                      : 'Not provided'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard;