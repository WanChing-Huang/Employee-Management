import express from 'express';
import {
  getMyProfile,
  submitOnboardingApplication,
  updatePersonalInfo,
  getAllProfiles,
  getEmployeeProfile,
  reviewApplication,
  getApplicationsByStatus
} from '../controllers/userProfileController.js';
import { auth, hrOnly } from '../middleware/auth.js';
import { uploadMiddleware } from '../services/uploadService.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Employee routes
router.get('/my-profile', getMyProfile);
// router.post('/onboarding', uploadMiddleware.multiple, submitOnboardingApplication);
router.post('/onboarding', uploadMiddleware.multiple, submitOnboardingApplication);
router.put('/personal-info/:section', updatePersonalInfo);

// HR only routes
router.get('/all', hrOnly, getAllProfiles);
router.get('/:profileId', hrOnly, getEmployeeProfile);
router.post('/:profileId/review', hrOnly, reviewApplication);
router.get('/status/:status', hrOnly, getApplicationsByStatus);

export default router;