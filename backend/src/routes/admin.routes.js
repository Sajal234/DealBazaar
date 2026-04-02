import express from 'express';
import {
  listPendingStores,
  listPendingDeals,
  updateStoreStatus,
  updateDealStatus,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Strict Middleware Boundary:
// Applying `use` here unconditionally enforces that every single route 
// defined below it MUST successfully pass both JWT verification AND 'admin' role checks.
router.use(protect);
router.use(authorize('admin'));

// @route   PATCH /api/admin/stores/:id/status
// @desc    Approve/Reject Store (Assigns Trust isVerified flag)
// @access  Private (Admin Only)
router.get('/stores/pending', listPendingStores);
router.patch('/stores/:id/status', updateStoreStatus);

// @route   PATCH /api/admin/deals/:id/status
// @desc    Approve/Reject Deal (Sets Expiry TTL & Cloudinary Cron triggers)
// @access  Private (Admin Only)
router.get('/deals/pending', listPendingDeals);
router.patch('/deals/:id/status', updateDealStatus);

export default router;
