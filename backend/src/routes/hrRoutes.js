import express from 'express';
import {
  getDashboardStats,
  getEmployeeSummary,
  searchEmployees,
  getVisaStatusInProgress,
  getVisaStatusAll,
  getEmployeeForReview,
  deleteUser
} from '../controllers/hrController.js';
import { auth, hrOnly } from '../middleware/auth.js';

const router = express.Router();

// All HR routes require authentication and HR role
router.use(auth, hrOnly);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Employee management
router.get('/employees/summary', getEmployeeSummary);
router.get('/employees/search', searchEmployees);
router.delete('/employees/:id', deleteUser);

// Visa status management
router.get('/visa-status/in-progress', getVisaStatusInProgress);
router.get('/visa-status/all', getVisaStatusAll);
router.get('/visa-status/employee/:employeeId', getEmployeeForReview);

export default router;
