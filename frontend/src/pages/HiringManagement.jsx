import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Send,
  ExpandMore,
  OpenInNew,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Add,
  ContentCopy,
  Email,
} from '@mui/icons-material';
import {
  generateRegistrationToken,
  fetchRegistrationTokens,
  fetchApplicationsByStatus,
} from '../store/hrSlice';
import StatusBadge from '../components/StatusBadge';
import { validateEmail } from '../utils/validators';

const HiringManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { registrationTokens, applications, loading } = useSelector((state) => state.hr);
  const [activeTab, setActiveTab] = useState(0);
  const [tokenDialog, setTokenDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (activeTab === 0) {
      dispatch(fetchRegistrationTokens());
    } else {
      // Fetch all application statuses
      dispatch(fetchApplicationsByStatus('Pending'));
      dispatch(fetchApplicationsByStatus('Rejected'));
      dispatch(fetchApplicationsByStatus('Approved'));
    }
  }, [dispatch, activeTab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleGenerateToken = async () => {
    if (!validateEmail(email)) {
      setEmailError('Invalid email format');
      return;
    }

    try {
      await dispatch(generateRegistrationToken(email)).unwrap();
      setTokenDialog(false);
      setEmail('');
      setSuccessMessage(`Registration token sent to ${email}`);
      dispatch(fetchRegistrationTokens());
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setEmailError(error.message || 'Failed to generate token');
    }
  };

  const handleCopyLink = (token) => {
    const link = `${import.meta.env.VITE_FRONTEND_URL}/register?token=${token}`;
    navigator.clipboard.writeText(link);
    // You could add a snackbar notification here
  };

  const handleViewApplication = (profileId) => {
    navigate(`/hr/review/${profileId}`);
  };

  const getTokenStatusIcon = (status) => {
    switch (status) {
      case 'Active':
        return <CheckCircle color="success" fontSize="small" />;
      case 'Used':
        return <CheckCircle color="info" fontSize="small" />;
      case 'Expired':
        return <Cancel color="error" fontSize="small" />;
      default:
        return <HourglassEmpty color="action" fontSize="small" />;
    }
  };

  const renderTokensTab = () => (
    <Box>
         {/* title and bottom */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">Registration Tokens</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setTokenDialog(true)}
        >
          Generate New Token
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}
       {/* table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell>Expires At</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrationTokens.length > 0 ? (
              registrationTokens.map((token) => (
                <TableRow key={token._id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" color="action" />
                      {token.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getTokenStatusIcon(token.status)}
                      <StatusBadge status={token.status} size="small" />
                    </Box>
                  </TableCell>
                  <TableCell>
                    {new Date(token.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(token.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {token.hasRegistered ? (
                      <Chip label="Yes" size="small" color="success" />
                    ) : (
                      <Chip label="No" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {token.status === 'Active' && (
                      <Tooltip title="Copy Registration Link">
                        <IconButton
                          size="small"
                          onClick={() => handleCopyLink(token.token)}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No registration tokens generated yet
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
  // Function to render applications section
  // This will be used for both pending, rejected, and approved applications
  const renderApplicationsSection = (status, data) => (
    <Accordion defaultExpanded={status === 'Pending'}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6">{status} Applications</Typography>
          <Chip label={data.length} size="small" />
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Submitted Date</TableCell>
                <TableCell>Work Authorization</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((app) => (
                  <TableRow key={app._id} hover>
                    <TableCell>
                      {app.firstName} {app.lastName}
                    </TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {app.workAuthorization?.isPermanentResidentOrCitizen
                        ? app.workAuthorization.residentType
                        : app.workAuthorization?.visaType || 'Not specified'}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        startIcon={<OpenInNew />}
                        onClick={() => handleViewApplication(app._id)}
                      >
                        {status === 'Pending' ? 'Review' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No {status.toLowerCase()} applications
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );

  const renderApplicationsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Onboarding Applications
      </Typography>
      
      {applications.pending.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You have {applications.pending.length} pending application{applications.pending.length > 1 ? 's' : ''} to review
        </Alert>
      )}

      {renderApplicationsSection('Pending', applications.pending)}
      {renderApplicationsSection('Rejected', applications.rejected)}
      {renderApplicationsSection('Approved', applications.approved)}
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hiring Management
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="Registration Tokens" />
          <Tab label="Onboarding Applications" />
        </Tabs>

        {activeTab === 0 ? renderTokensTab() : renderApplicationsTab()}
      </Paper>

      {/* Generate Token Dialog */}
      <Dialog
        open={tokenDialog}
        onClose={() => {
          setTokenDialog(false);
          setEmail('');
          setEmailError('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Registration Token</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary"  sx={{ mb: 2 }}>
            Enter the email address of the new employee. A registration link will be sent to this email.
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setEmailError('');
            }}
            error={!!emailError}
            helperText={emailError}
            autoFocus
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            The registration token will be valid for 3 hours from generation.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setTokenDialog(false);
            setEmail('');
            setEmailError('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleGenerateToken}
            disabled={!email}
          >
            Send Token
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HiringManagement;