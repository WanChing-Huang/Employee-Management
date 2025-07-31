import { useState, useRef } from 'react';
import axios from 'axios';

const FileUpload = ({ 
  userProfileId, 
  documentType, 
  currentFile, 
  onUploadSuccess, 
  onUploadError,
  accept = ".pdf,.jpg,.jpeg,.png",
  label = "Upload Document"
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Only PDF, JPG, and PNG files are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('File size must be less than 5MB');
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);

    setUploading(true);

    try {
      const response = await axios.post(
        `/api/documents/upload/${userProfileId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      onUploadSuccess?.(response.data);
      setPreview(null);
    } catch (error) {
      onUploadError?.(error.response?.data?.error || 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
    // Reset input
    e.target.value = '';
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const viewDocument = async (filename) => {
    try {
      const response = await axios.get(`/api/documents/download/${filename}?userProfileId=${userProfileId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Clean up the object URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error viewing document:', error);
      onUploadError?.('Failed to view document: ' + (error.response?.data?.error || error.message));
    }
  };

  const downloadDocument = async (filename) => {
    try {
      const response = await axios.get(`/api/documents/download/${filename}?userProfileId=${userProfileId}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/octet-stream'
      });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      onUploadError?.('Failed to download document: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="file-upload">
      <div className="form-group">
        <label className="form-label">{label}</label>
        
        {/* Current file display */}
        {currentFile && (
          <div className="current-file">
            <div className="file-info">
              <span className="file-name">📄 {currentFile}</span>
              <div className="file-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => viewDocument(currentFile)}
                >
                  👁️ View
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => downloadDocument(currentFile)}
                >
                  📥 Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload area */}
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          
          {uploading ? (
            <div className="upload-status">
              <div className="spinner"></div>
              <p>Uploading...</p>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon">📁</div>
              <p>
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="upload-hint">
                PDF, JPG, PNG up to 5MB
              </p>
            </div>
          )}
        </div>

        {/* Image preview */}
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" className="preview-image" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload; 
