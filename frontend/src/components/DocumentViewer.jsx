import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Close, Download, Visibility } from '@mui/icons-material';
import { downloadDocument } from '../services/document';
                                   //dialog is open or not
const DocumentViewer = ({ document, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);


  
  const handleDownload = async () => {
    try {
      setLoading(true);
     // const documentId = document.type === 'driverLicense' ? 'driverLicense' : (document._id || document.id);

      const blob = await downloadDocument(document._id || document.id);
      const url = window.URL.createObjectURL(blob); // temporary URL

      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${ document.type || 'document'}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
    } finally {
      setLoading(false);
    }
  };


  const handlePreview = async () => {
    try {
      setLoading(true);
      //const documentId = document.type === 'driverLicense' ? 'driverLicense' : (document._id || document.id);
      const blob = await downloadDocument(document._id || document.id);
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url); //display the document in the dialog
    } catch (error) {
      console.error('Error previewing document:', error);
    } finally {
      setLoading(false);
    }
  };
  
  //close the dialog and revoke the URL if it exists
  const handleClose = () => {
    if (previewUrl) {
      window.URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onClose();
  };
  
    //useEffect to handle preview when the dialog opens
  React.useEffect(() => {
    if (open && !previewUrl) {
      handlePreview();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{document?.type || 'Document'}</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        ) : previewUrl ? (
          <Box sx={{ width: '100%', height: '600px' }}>
            <iframe
              src={previewUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Document Preview"
            />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <Typography color="textSecondary">
              Unable to preview document
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleDownload} startIcon={<Download />} disabled={loading}>
          Download
        </Button>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentViewer;