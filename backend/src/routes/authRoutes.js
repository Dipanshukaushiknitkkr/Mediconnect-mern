const express = require('express');
const router = express.Router();
const { registerUser, verifyOtp, resendOtp, loginUser, getMe, updateUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin } = require('../middleware/validatorMiddleware');

router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/verify-otp', authLimiter, verifyOtp);
router.post('/resend-otp', authLimiter, resendOtp);
router.post('/login', authLimiter, validateLogin, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

module.exports = router;
