const expressAsyncHandler = require('express-async-handler');
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken'); 
const crypto = require('crypto');
const sendMail = require('../utils/sendMail');


// Controller to register a new user
const registerUser = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({
        name,
        email,
        password, // Password will be hashed by the middleware in the User model
    });

    await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully', user: newUser });
});

// Controller to register a new admin
const registerAdmin = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
        return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    // Create a new admin
    const newAdmin = new User({
        name,
        email,
        password, // Password will be hashed by the middleware in the User model
        isAdmin: true, // Set isAdmin to true for admin registration
    });

    await newAdmin.save();

    res.status(201).json({ success: true, message: 'Admin registered successfully', admin: newAdmin });
});

// Controller to authenticate a user
const authUser = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate a token
    const token = generateToken(user._id);

    res.json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        },
    });
});

// Controller to authenticate an admin
const authAdmin = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find the admin by email
    const admin = await User.findOne({ email });
    if (!admin || !admin.isAdmin) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if the password matches
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate a token
    const token = generateToken(admin._id);

    res.json({
        success: true,
        token,
        user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            isAdmin: admin.isAdmin,
        },
    });
});

// Controller to handle forgot password
const forgotPassword = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

    await user.save();

    // Construct reset link
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`; // Ensure to set FRONTEND_URL in your environment variables
    const resetLink = `${req.protocol}://${req.get('host')}/api/users/reset-password/${resetToken}`;


    // Send email with the reset link
    await sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        text: `You are receiving this email because you (or someone else) have requested the reset of a password. 
        Please make a PUT request to the following link to reset your password:\n\n${resetLink}`,
    });

    res.status(200).json({ success: true, message: 'Reset link sent to your email' });
});

// Controller to handle reset password
const resetPassword = expressAsyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    // Hash the new password
    user.password = newPassword; // Assuming your hash middleware handles password hashing
    user.resetPasswordToken = undefined; // Clear the reset token
    user.resetPasswordExpires = undefined; // Clear the expiration

    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
});

// Function to get all users (for admin access)
const getAllUsers = expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json({ success: true, data: users });
});

// Function to get the logged-in user's profile
const getUserProfile = expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from response
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
});

// Controller to update user profile
const updateUserProfile = expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
        user.password = req.body.password; // Assuming password hashing middleware is in place
    }

    const updatedUser = await user.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
        },
    });
});


module.exports = { registerUser, registerAdmin, authUser, authAdmin, forgotPassword, resetPassword, getAllUsers, getUserProfile,updateUserProfile };