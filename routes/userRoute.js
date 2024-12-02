const express = require('express');
const router = express.Router();
const { registerUser, registerAdmin, authUser, authAdmin, forgotPassword, resetPassword, getAllUsers, getUserProfile, updateUserProfile} = require("../controllers/users");
const { protect, admin } = require('../middleware/auth');


router.post('/register', registerUser);
router.post('/auth', authUser)

router.post('/register-admin', registerAdmin);
router.post('/auth-admin', authAdmin)

router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:token', resetPassword)

router.get("/all", protect, admin, getAllUsers)
router.get("/profile", protect, getUserProfile)
router.put('/profile', protect, updateUserProfile);

module.exports = router;