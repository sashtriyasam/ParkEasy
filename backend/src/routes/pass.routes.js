const express = require('express');
const router = express.Router();
const passController = require('../controllers/pass.controller');
const { protect, restrictTo } = require('../middleware/auth');

// AI TEST: Run `GET /api/v1/passes/me` with valid Bearer token
// Expected: 200 with { status: 'success', data: [] } (or array of passes)
// Previously: 404 (route was never registered)

// Customer routes
router.get('/me', protect, restrictTo('CUSTOMER', 'ADMIN'), passController.getMyPasses);
router.get('/available', protect, restrictTo('CUSTOMER', 'ADMIN'), passController.getAvailablePasses);
router.post('/purchase', protect, restrictTo('CUSTOMER', 'ADMIN'), passController.purchasePass);
router.delete('/:id/cancel', protect, restrictTo('CUSTOMER', 'ADMIN'), passController.cancelPass);

// Provider routes
router.get('/facility/:facilityId', protect, restrictTo('PROVIDER', 'ADMIN'), passController.getFacilityPasses);

module.exports = router;
