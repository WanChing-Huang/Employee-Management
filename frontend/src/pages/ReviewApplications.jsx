import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Home,
  Work,
  ContactPhone,
  InsertDriveFile,
  Visibility,
  CheckCircle,
  Cancel,
  ArrowBack,
} from '@mui/icons-material';
import { fetchEmployeeProfile, reviewApplication, fetchDocumentsByProfile } from '../store/hrSlice';
import StatusBadge from '../components/StatusBadge';
import DocumentViewer from '../components/DocumentViewer';

const ReviewApplication = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedEmployee, loading } = useSelector((state) => state.hr);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewDocument, setViewDocument] = useState(false);

  useEffect(() => {
    dispatch(fetchEmployeeProfile(profileId));
    dispatch(fetchDocumentsByProfile(profileId));
  }, [dispatch, profileId]);
  const documents = useSelector((state) => state.hr.documentsByEmployee[profileId]);
  

  const handleReview = async () => {
    try {
      await dispatch(reviewApplication({
        profileId,
        action: reviewAction,
        feedback: reviewAction === 'reject' ? feedback : '',
      })).unwrap();

      setReviewDialog(false);
      navigate('/hr/hiring-management');
    } catch (error) {
      console.error('Review error:', error);
    }
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setViewDocument(true);
  };

  if (loading || !selectedEmployee) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  const { profile } = selectedEmployee;
  
  const canReview = profile.status === 'Pending';

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/hr/hiring-management')}
        >
          Back to Hiring Management
        </Button>
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          Review Application
        </Typography>
        <StatusBadge status={profile.status} size="large" />
      </Box>

      {profile.status === 'Rejected' && profile.feedback && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Previous Rejection Feedback:
          </Typography>
          {profile.feedback}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              {/* avatar and name */}
              <Avatar
                src={profile.profilePicture ?
                  `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${profile.profilePicture}` :
                  undefined
                }
                sx={{ width: 80, height: 80 }}
              >
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </Avatar>
              <Box>
                <Typography variant="h5">
                  {profile.firstName} {profile.middleName} {profile.lastName}
                </Typography>
                {profile.preferredName && (
                  <Typography variant="body2" color="text.secondary">
                    Preferred: {profile.preferredName}
                  </Typography>
                )}
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>
                <Typography>{profile.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  SSN
                </Typography>
                <Typography>{profile.ssn}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Date of Birth
                </Typography>
                <Typography>
                  {new Date(profile.dateOfBirth).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Gender
                </Typography>
                <Typography>{profile.gender}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Contact Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Phone sx={{ mr: 1, verticalAlign: 'middle' }} />
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Cell Phone
                </Typography>
                <Typography>{profile.cellPhone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Work Phone
                </Typography>
                <Typography>{profile.workPhone || 'Not provided'}</Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Address */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Home sx={{ mr: 1, verticalAlign: 'middle' }} />
              Address
            </Typography>
            <Typography>
              {profile.address.street} {profile.address.apt && `, ${profile.address.apt}`}
            </Typography>
            <Typography>
              {profile.address.city}, {profile.address.state} {profile.address.zipCode}
            </Typography>
          </Paper>

          {/* Work Authorization */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
              Work Authorization
            </Typography>
            {profile.workAuthorization.isPermanentResidentOrCitizen ? (
              <Chip
                label={profile.workAuthorization.residentType}
                color="success"
                variant="outlined"
              />
            ) : (
              <Box>
                <Chip
                  label={profile.workAuthorization.visaType}
                  color="primary"
                  variant="outlined"
                />
                {profile.workAuthorization.visaTitle && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Title: {profile.workAuthorization.visaTitle}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Valid: {new Date(profile.workAuthorization.startDate).toLocaleDateString()} -
                  {new Date(profile.workAuthorization.endDate).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Emergency Contacts */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <ContactPhone sx={{ mr: 1, verticalAlign: 'middle' }} />
              Emergency Contacts & Reference
            </Typography>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Reference
            </Typography>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography>
                      {profile.reference.firstName} {profile.reference.lastName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Relationship
                    </Typography>
                    <Typography>{profile.reference.relationship}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography>{profile.reference.phone}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography>{profile.reference.email}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Typography variant="subtitle2" gutterBottom>
              Emergency Contacts
            </Typography>
            {profile.emergencyContacts.map((contact, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Name
                      </Typography>
                      <Typography>
                        {contact.firstName} {contact.lastName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Relationship
                      </Typography>
                      <Typography>{contact.relationship}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography>{contact.phone}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary">
                        Email
                      </Typography>
                      <Typography>{contact.email}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        {/* Documents & Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>
            <List>
              {profile.profilePicture && (
                <ListItem>
                  <ListItemIcon>
                    <InsertDriveFile />
                  </ListItemIcon>
                  <ListItemText primary="Profile Picture" />
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDocument({
                      type: 'Profile Picture',
                      _id: 'profilePicture',
                    })}
                  >
                    View
                  </Button>
                </ListItem>
              )}

              {Array.isArray(documents?.driverLicense) && documents.driverLicense.map((doc) => (
                <ListItem key={doc._id}>
                  <ListItemIcon>
                    <InsertDriveFile />
                  </ListItemIcon>
                  <ListItemText primary="Driver's License" />
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDocument({
                      ...doc,
                      type: "Driver's License"
                    })}
                  >
                    View
                  </Button>
                </ListItem>
              ))}
              {/* {documents?.driverLicense && (
                <ListItem>
                  <ListItemIcon>
                    <InsertDriveFile />
                  </ListItemIcon>
                  <ListItemText primary="Driver's License" />
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDocument({
                      ...documents.driverLicense,
                      type: 'Driver\'s License',
                      _id: 'driverLicense',
                    })}
                  >
                    View
                  </Button>
                </ListItem>
              )} */}

              {Array.isArray(documents?.visaDocuments) && documents.visaDocuments.map((doc) => (
                <ListItem key={doc._id}>
                  <ListItemIcon>
                    <InsertDriveFile />
                  </ListItemIcon>
                  <ListItemText primary={doc.type} />
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleViewDocument(doc)}
                  >
                    View
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>

          {canReview && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Review Actions
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircle />}
                  onClick={() => {
                    setReviewAction('approve');
                    setReviewDialog(true);
                  }}
                >
                  Approve Application
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={() => {
                    setReviewAction('reject');
                    setReviewDialog(true);
                  }}
                >
                  Reject Application
                </Button>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => {
          setReviewDialog(false);
          setFeedback('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {reviewAction === 'approve' ? 'Approve' : 'Reject'} Application
        </DialogTitle>
        <DialogContent>
          {reviewAction === 'approve' ? (
            <Typography>
              Are you sure you want to approve this application? The employee will be able to access their dashboard and manage their information.
            </Typography>
          ) : (
            <>
              <Typography sx={{ mb: 2 }}>
                Please provide feedback for the rejection. This will be visible to the employee.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Rejection Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setReviewDialog(false);
            setFeedback('');
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={reviewAction === 'approve' ? 'success' : 'error'}
            onClick={handleReview}
            disabled={reviewAction === 'reject' && !feedback.trim()}
          >
            {reviewAction === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Viewer */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          open={viewDocument}
          onClose={() => {
            setViewDocument(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </Box>
  );
};

export default ReviewApplication;