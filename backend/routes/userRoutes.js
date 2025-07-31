import express from 'express';
import {
  generateRegistrationToken,
  validateRegistrationToken,
  registerUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  loginUser
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
router.get('/', hrOnly, getAllUsers);
router.delete('/:id', hrOnly, deleteUser);
router.patch('/:id/role', hrOnly, updateUserRole);

// General user routes
router.get('/:id', getUserById);
router.put('/:id', updateUser);

export default router; 