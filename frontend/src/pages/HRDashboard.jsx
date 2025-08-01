import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  People,
  Assignment,
  AssignmentTurnedIn,
  PersonAdd,
  Assessment,
  Warning,
} from '@mui/icons-material';
import { fetchDashboardStats } from '../store/hrSlice';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

//chart js registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const HRDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.hr);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  if (loading || !dashboardStats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const statsCards = [
    {
      title: 'Total Employees',
      value: dashboardStats.totalEmployees,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      action: () => navigate('/hr/employees'),
    },
    {
      title: 'Pending Applications',
      value: dashboardStats.pendingApplications,
      icon: <Assignment sx={{ fontSize: 40 }} />,
      color: '#ff9800',
      action: () => navigate('/hr/hiring-management'),
    },
    {
      title: 'Visa Employees',
      value: dashboardStats.visaEmployees,
      icon: <AssignmentTurnedIn sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      action: () => navigate('/hr/visa-management'),
    },
    {
      title: 'Active Tokens',
      value: dashboardStats.activeTokens,
      icon: <PersonAdd sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      action: () => navigate('/hr/hiring-management'),
    },
  ];

  const applicationStatusData = {
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
      {
        data: [
          dashboardStats.pendingApplications,
          dashboardStats.totalEmployees,
          0, // You might want to add rejected count to your stats
        ],
        backgroundColor: ['#ff9800', '#4caf50', '#f44336'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        HR Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
              onClick={stat.action}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Quick Actions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Generate Registration Token
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Send registration invitations to new employees
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate('/hr/hiring-management')}
                    >
                      Go to Hiring
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Review Applications
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {dashboardStats.pendingApplications} applications waiting for review
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate('/hr/hiring-management')}
                    >
                      Review Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Visa Status Management
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track and manage employee visa documents
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate('/hr/visa-management')}
                    >
                      Manage Visas
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Employee Profiles
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage all employee information
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate('/hr/employees')}
                    >
                      View Employees
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Application Status Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Application Status
            </Typography>
            <Box sx={{ height: 300 }}>
              <Doughnut data={applicationStatusData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications & Alerts
            </Typography>
            <Box>
              {dashboardStats.pendingApplications > 0 && (
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                  <Warning color="warning" />
                  <Typography>
                    {dashboardStats.pendingApplications} onboarding applications pending review
                  </Typography>
                </Box>
              )}
              {dashboardStats.visaEmployees > 0 && (
                <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
                  <Assessment color="info" />
                  <Typography>
                    {dashboardStats.visaEmployees} employees with visa documentation in progress
                  </Typography>
                </Box>
              )}
              {dashboardStats.activeTokens > 0 && (
                <Box display="flex" alignItems="center" gap={1}>
                  <PersonAdd color="primary" />
                  <Typography>
                    {dashboardStats.activeTokens} active registration tokens
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HRDashboard;