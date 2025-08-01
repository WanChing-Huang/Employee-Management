import express from 'express';
import {
  uploadDocument,
  getMyDocuments,
  downloadDocument,
  getVisaStatus,
  downloadTemplate,
  reviewVisaDocument,
  sendReminder,
  getDocumentsByProfileId
} from '../controllers/documentController.js';
import { auth, hrOnly } from '../middleware/auth.js';
import { upload } from '../services/uploadService.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Employee routes
router.post('/upload', upload.single('document'), uploadDocument);
router.get('/my-documents', getMyDocuments);
router.get('/download/:documentId', downloadDocument);
router.get('/visa-status', getVisaStatus);
router.get('/template/:templateType', downloadTemplate);

// HR routes
router.post('/visa/:documentId/review', hrOnly, reviewVisaDocument);
router.post('/reminder/:profileId', hrOnly, sendReminder);
router.get('/by-profile/:profileId', hrOnly, getDocumentsByProfileId);

export default router;