import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createUserProfile,
  getUserProfileByUser,
  updateUserProfile,
  uploadUserProfileDocument,
  getAllUserProfiles,
  updateUserProfileStatus
} from '../controllers/userProfileController.js';

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
        file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create new user profile
router.post('/', createUserProfile);

// Get user profile by user ID
router.get('/user/:userId', getUserProfileByUser);

// Update user profile
router.put('/:id', updateUserProfile);

// Upload document for user profile
router.post('/:id/upload', upload.single('document'), uploadUserProfileDocument);

// Get all user profiles (for HR/admin)
router.get('/', getAllUserProfiles);

// Update user profile status (for HR/admin)
router.patch('/:id/status', updateUserProfileStatus);

export default router; 