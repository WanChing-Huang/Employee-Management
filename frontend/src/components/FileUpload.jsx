import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Clear,
  CheckCircle,
} from '@mui/icons-material';

const FileUpload = ({
  label,
  accept,
  onChange,
  value,
  error,
  helperText,
  disabled = false,
  required = false,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
//drag and drop functionality for file upload
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader(); //use FileReader to preview the file
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onChange(file);
  };

  const handleClear = () => {
    setPreview(null);
    onChange(null);
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {label} {required && '*'}
      </Typography>
      
      <Paper
        variant="outlined"
        //drag and drop functionality for file upload
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 2,
          border: dragActive ? '2px dashed #1976d2' : '1px dashed #ccc',
          backgroundColor: dragActive ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {value ? (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                />
              ) : (
                <InsertDriveFile color="primary" />
              )}
              <Typography variant="body2">{value.name || value}</Typography>
              <CheckCircle color="success" fontSize="small" />
            </Box>
            <IconButton size="small" onClick={handleClear} disabled={disabled}>
              <Clear />
            </IconButton>
          </Box>
        ) : (
          <Box textAlign="center">
            <input
              accept={accept}
              style={{ display: 'none' }}
              id={`file-upload-${label}`}
              type="file"
              onChange={handleChange}
              disabled={disabled}
            />
            <label htmlFor={`file-upload-${label}`}>
              <CloudUpload fontSize="large" color="action" />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Drag and drop a file here or click to select
              </Typography>
              <Button
                variant="outlined"
                component="span"
                size="small"
                sx={{ mt: 2 }}
                disabled={disabled}
              >
                Choose File
              </Button>
            </label>
          </Box>
        )}
      </Paper>
      
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

export default FileUpload;