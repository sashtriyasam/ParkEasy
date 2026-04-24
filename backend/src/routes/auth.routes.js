const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { protect } = require('../middleware/auth');

const router = express.Router();


router.post('/register', validate(registerSchema), authController.register);

router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh', authController.refresh);
router.post('/update-push-token', protect, authController.updatePushToken);
router.post('/switch-role', protect, authController.switchRole);
router.get('/me', protect, authController.getMe);
router.delete('/me', protect, authController.deleteMe);

// Temporary seeding route (unprotected for one-time initialization)
router.get('/seed-production-admin', authController.seedProductionAdmin);

module.exports = router;
