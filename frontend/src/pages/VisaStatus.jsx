import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Divider } from '@mui/material';
import {
  Box,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error as ErrorIcon,
  HourglassEmpty,
  Download,
  Description,
} from '@mui/icons-material';

import { fetchVisaStatus, uploadDocument } from '../store/documentSlice';
import { downloadTemplate } from '../services/document';
import FileUpload from '../components/FileUpload';
import StatusBadge from '../components/StatusBadge';
import { VISA_DOCUMENTS } from '../utils/constants';

const VisaStatus = () => {
  const dispatch = useDispatch();
  const { visaStatus, loading, uploadLoading } = useSelector((state) => state.document);
  const [activeStep, setActiveStep] = useState(0);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadType, setUploadType] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);

  useEffect(() => {
    dispatch(fetchVisaStatus());
  }, [dispatch]);

  useEffect(() => {
    if (visaStatus?.documentStatus) {
      // Find the current active step based on document status and set as current step
      const currentStep = VISA_DOCUMENTS.findIndex(docType => {
        const status = visaStatus.documentStatus[docType]?.status;
        return status === 'Rejected' || status === 'Not Uploaded';
      });
      setActiveStep(currentStep !== -1 ? currentStep : VISA_DOCUMENTS.length);
    }
  }, [visaStatus]);
  

  const handleUpload = async (docType) => {
    if (!uploadFile) return;

    try {
      await dispatch(uploadDocument({ file: uploadFile, type: docType })).unwrap();
      setUploadFile(null);
      setUploadType(''); // Reset upload type
      dispatch(fetchVisaStatus());// Refresh visa status after upload
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDownloadTemplate = async (templateType) => {
    try {
      const blob = await downloadTemplate(templateType);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `I-983_${templateType}_template.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const getStepIcon = (docType) => {
    const status = visaStatus?.documentStatus?.[docType]?.status;
    // Return appropriate icon based on document status
    switch (status) {
      case 'Approved':
        return <CheckCircle color="success" />;
      case 'Rejected':
        return <ErrorIcon color="error" />;
      case 'Pending':
        return <HourglassEmpty color="warning" />;
      default:
        return <CloudUpload color="action" />;
    }
  };
  
    // Function to get content for each step based on document type
  const getStepContent = (docType) => {
    const docStatus = visaStatus?.documentStatus?.[docType];
    const isActive = visaStatus?.nextStep === docType || //next step doc
                    (docStatus?.status === 'Rejected') ||  //rejected and should re upload
                    (!docStatus && activeStep === VISA_DOCUMENTS.indexOf(docType)); // not uploaded yet but is the current step

    return (
      <Box>
        {docStatus ? (
          <Box>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <StatusBadge status={docStatus.status} />
              {docStatus.uploadedAt && (
                <Typography variant="caption" color="text.secondary">
                  Uploaded on {new Date(docStatus.uploadedAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>

            {docStatus.status === 'Rejected' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  HR Feedback:
                </Typography>
                {docStatus.feedback || 'Please resubmit this document.'}
              </Alert>
            )}

            {docStatus.status === 'Pending' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Your document is under review by HR. You will be notified once it's processed.
              </Alert>
            )}

            {(docStatus.status === 'Rejected' || (isActive && docStatus.status !== 'Approved')) && (
              <Box mt={2}>
                <Typography variant="body2" gutterBottom>
                  Upload new document:
                </Typography>
                <FileUpload
                  label={`${docType} Document`}
                  accept="application/pdf,image/*"
                  value={uploadFile}
                  onChange={(file) => {
                    setUploadFile(file);
                    setUploadType(docType);
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => handleUpload(docType)}
                  disabled={!uploadFile || uploadLoading}
                  sx={{ mt: 2 }}
                >
                  {uploadLoading ? <CircularProgress size={24} /> : 'Upload'}
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Box>
            {isActive ? (
              <Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please upload your {docType} to proceed with the visa documentation process.
                </Alert>
                
                {docType === 'I-983' && (
                  <Box mb={2}>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => setShowTemplateDialog(true)}
                      sx={{ mr: 2 }}
                    >
                      Download Templates
                    </Button>
                  </Box>
                )}
                
                <FileUpload
                  label={`${docType} Document`}
                  accept="application/pdf,image/*"
                  value={uploadFile}
                  onChange={(file) => {
                    setUploadFile(file);
                    setUploadType(docType);
                  }}
                  required
                />
                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={() => handleUpload(docType)}
                  disabled={!uploadFile || uploadLoading}
                  sx={{ mt: 2 }}
                >
                  {uploadLoading ? <CircularProgress size={24} /> : 'Upload'}
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                This document will be available for upload after previous documents are approved.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!visaStatus?.isOPT) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Visa Status Management
        </Typography>
        <Alert severity="info">
          Visa status management is only available for employees with F1(CPT/OPT) visa type.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Visa Status Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Upload Progress
            </Typography>
            
            {visaStatus?.allApproved && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Congratulations! All your visa documents have been approved.
              </Alert>
            )}

            <Stepper activeStep={activeStep} orientation="vertical">
              {VISA_DOCUMENTS.map((docType, index) => (
                <Step key={docType} expanded>
                  <StepLabel
                    icon={getStepIcon(docType)} 
                    optional={
                      visaStatus?.documentStatus?.[docType]?.status === 'Approved' && (
                        <Typography variant="caption">Approved</Typography>
                      )
                    }
                  >
                    {docType}
                  </StepLabel>
                  <StepContent>
                    {getStepContent(docType)}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Status
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Next Step:
                </Typography>
                <Chip
                  label={visaStatus?.nextStep || 'All documents approved'}
                  color={visaStatus?.allApproved ? 'success' : 'primary'}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Process Overview:
              </Typography>
              <Typography variant="body2" paragraph>
                You need to upload your visa documents in the following order:
              </Typography>
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                {VISA_DOCUMENTS.map((doc) => (
                  <li key={doc}>
                    <Typography variant="body2">{doc}</Typography>
                  </li>
                ))}
              </ol>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Each document must be approved by HR before you can proceed to the next step.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* I-983 Template Dialog */}
      <Dialog open={showTemplateDialog} onClose={() => setShowTemplateDialog(false)}>
        <DialogTitle>Download I-983 Templates</DialogTitle>
        <DialogContent>
          <Typography  sx={{ mb: 2 }}>
            Please select which template you would like to download:
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Description />}
              onClick={() => {
                handleDownloadTemplate('empty');
                setShowTemplateDialog(false);
              }}
              fullWidth
            >
              Empty Template
            </Button>
            <Button
              variant="outlined"
              startIcon={<Description />}
              onClick={() => {
                handleDownloadTemplate('sample');
                setShowTemplateDialog(false);
              }}
              fullWidth
            >
              Sample Template (with examples)
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTemplateDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VisaStatus;