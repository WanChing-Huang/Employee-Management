import React, { useEffect, useState } from 'react';
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
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Search,
  Send,
  Visibility,
  MoreVert,
  Download,
  CheckCircle,
  Cancel,
  HourglassEmpty,
} from '@mui/icons-material';
import {
  fetchVisaStatusInProgress,
  fetchVisaStatusAll,
  reviewVisaDocument,
  sendReminder,
} from '../store/hrSlice';
import DocumentViewer from '../components/DocumentViewer';
import StatusBadge from '../components/StatusBadge';

const VisaManagement = () => {
  const dispatch = useDispatch();
  const { visaInProgress, visaAll, loading } = useSelector((state) => state.hr);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewDialog, setReviewDialog] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewDocument, setViewDocument] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (activeTab === 0) {
      dispatch(fetchVisaStatusInProgress());
    } else {
      dispatch(fetchVisaStatusAll(searchQuery));
    }
  }, [dispatch, activeTab, searchQuery]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSearchQuery('');
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    if (activeTab === 1) {
      dispatch(fetchVisaStatusAll(value));
    }
  };

  const handleReviewDocument = async (action) => {
    if (!reviewDialog) return;

    try {
      await dispatch(reviewVisaDocument({
        documentId: reviewDialog.documentId,
        action,
        feedback: action === 'reject' ? feedback : '',
      })).unwrap();
      
      setReviewDialog(null);
      setFeedback('');
      dispatch(fetchVisaStatusInProgress());
    } catch (error) {
      console.error('Review error:', error);
    }
  };

  const handleSendReminder = async (profileId, nextStep) => {
    try {
      await dispatch(sendReminder({ profileId, nextStep })).unwrap();
      // Show success message
    } catch (error) {
      console.error('Send reminder error:', error);
    }
  };
 
  // Function to handle action menu
  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setViewDocument(true);
    handleMenuClose();
  };

  const getDaysRemainingColor = (days) => {
    if (days < 30) return 'error';
    if (days < 90) return 'warning';
    return 'success';
  };

  const renderInProgressTab = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Employee Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Work Authorization</TableCell>
            <TableCell>Current Status</TableCell>
            <TableCell>Next Step</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visaInProgress.length > 0 ? (
            visaInProgress.map((employee) => (
              <TableRow key={employee._id || employee.email} hover>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Chip
                    label={employee.workAuthorization?.type || 'Unknown'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {employee.currentStatus}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {employee.nextStep}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  {employee.nextStep?.includes('Review') && employee.documents && (
                    <Box display="flex" gap={1} justifyContent="center">
                      {employee.documents
                        .filter(doc => doc.status === 'Pending')
                        .map((doc) => (
                          <Button
                            key={doc._id}
                            size="small"
                            variant="outlined"
                            onClick={() => setReviewDialog({
                              employee,
                              document: doc,
                              documentId: doc._id,
                            })}
                          >
                            Review {doc.type}
                          </Button>
                        ))
                      }
                    </Box>
                  )}
                  {employee.nextStep && !employee.nextStep.includes('Review') && employee._id && (
                    <Button
                      size="small"
                      startIcon={<Send />}
                      onClick={() => handleSendReminder(employee._id, employee.nextStep)}
                    >
                      Send Reminder
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  No employees with visa documentation in progress
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderAllTab = () => (
    <>
      <Box mb={3}>
        <TextField
          fullWidth
          placeholder="Search by employee name..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Employee Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Work Authorization</TableCell>
              <TableCell>Days Remaining</TableCell>
              <TableCell>Documents</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visaAll.length > 0 ? (
              visaAll.map((employee) => (
                <TableRow key={employee._id} hover>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={employee.workAuthorization?.type}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" display="block">
                        {new Date(employee.workAuthorization?.startDate).toLocaleDateString()} - 
                        {new Date(employee.workAuthorization?.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${employee.daysRemaining} days`}
                      size="small"
                      color={getDaysRemainingColor(employee.daysRemaining)}
                    />
                  </TableCell>
                  <TableCell>
                    {employee.visaDocuments?.map((doc) => (
                      <Chip
                        key={doc._id}
                        label={doc.type}
                        size="small"
                        color="success"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, employee)}
                      size="small"
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {searchQuery ? 'No employees found' : 'No employees with visa documentation'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
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
        Visa Status Management
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="In Progress" />
          <Tab label="All" />
        </Tabs>

        {activeTab === 0 ? renderInProgressTab() : renderAllTab()}
      </Paper>

      {/* Review Document Dialog */}
      <Dialog
        open={!!reviewDialog}
        onClose={() => {
          setReviewDialog(null);
          setFeedback('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Review {reviewDialog?.document?.type}
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Employee: {reviewDialog?.employee?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Document Type: {reviewDialog?.document?.type}
            </Typography>
          </Box>
          
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => {
              setSelectedDocument(reviewDialog.document);
              setViewDocument(true);
            }}
            sx={{ mb: 2 }}
          >
            View Document
          </Button>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Feedback (Required for rejection)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setReviewDialog(null);
            setFeedback('');
          }}>
            Cancel
          </Button>
          <Button
            color="error"
            startIcon={<Cancel />}
            onClick={() => handleReviewDocument('reject')}
            disabled={!feedback.trim()}
          >
            Reject
          </Button>
          <Button
            color="success"
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={() => handleReviewDocument('approve')}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedEmployee?.visaDocuments?.map((doc) => (
          <MenuItem
            key={doc._id}
            onClick={() => handleViewDocument(doc)}
          >
            <Visibility sx={{ mr: 1 }} fontSize="small" />
            View {doc.type}
          </MenuItem>
        ))}
        <MenuItem
          onClick={() => {
            handleSendReminder(selectedEmployee._id, 'Status Update');
            handleMenuClose();
          }}
        >
          <Send sx={{ mr: 1 }} fontSize="small" />
          Send Reminder
        </MenuItem>
      </Menu>

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

export default VisaManagement;