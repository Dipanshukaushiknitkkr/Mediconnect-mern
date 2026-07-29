const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword, getMe, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validatorMiddleware');

router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, validateLogin, loginUser);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
