import express from 'express';
import multer from 'multer';
import path from 'path';
import { auth, hrOnly } from '../middleware/auth.js';
import {
  uploadDocument,
  getUserDocuments,
  downloadDocument,
  updateDocumentStatus,
  deleteDocument
} from '../controllers/documentController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow PDF, JPG, PNG files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'image/jpeg' || 
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Apply auth middleware to all routes
router.use(auth);

// Upload document for user profile
router.post('/upload/:userProfileId', upload.single('document'), uploadDocument);

// Get all documents for a user profile
router.get('/:userProfileId', getUserDocuments);

// Download/view document
router.get('/download/:filename', downloadDocument);

// Update document status (HR only)
router.patch('/:userProfileId/status/:documentId', hrOnly, updateDocumentStatus);

// Delete document
router.delete('/:userProfileId', deleteDocument);

export default router; 