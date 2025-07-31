import express from 'express';
import {
  generateRegistrationToken,
  validateRegistrationToken,
  getRegistrationTokens,
  registerUser,
  getUserById,
  updateUserRole,
  loginUser,
  logoutUser
} from '../controllers/userController.js';
import { auth, hrOnly } from '../middleware/auth.js';

const router = express.Router();

// Public routes 
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/validate-token/:token', validateRegistrationToken);

// Protected routes (authentication required)
// below route should auth
router.use(auth);

// HR only routes
router.post('/generate-token', hrOnly, generateRegistrationToken);
router.patch('/:id/role', hrOnly, updateUserRole);
router.get('/', hrOnly, getRegistrationTokens);

// General user routes
router.get('/:id', getUserById);
router.post('/logout', logoutUser);

export default router; 