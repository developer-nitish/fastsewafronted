const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    logout
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', auth, getMe);
router.put('/update', auth, updateProfile);
router.put('/change-password', auth, changePassword);
router.post('/logout', auth, logout);

module.exports = router;