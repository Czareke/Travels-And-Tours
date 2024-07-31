const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const router = express.Router();

// Route to get all users (for admin)
router
    .route('/user')
    .get(authController.protect, authController.restrictTo('admin'), userController.getAllUsers);

// Route to get and update the user profile
router
    .route('/me')
    .get(authController.protect, userController.getUserProfile);

// Middleware to protect all routes below
router.use(authController.protect);

// Routes to get, update, and delete a specific user by ID (for admin)
router
    .route('/user/:id')
    .get(authController.restrictTo('admin'), userController.getOneUser)
    .patch(authController.restrictTo('admin','user'), userController.updateMe)
    .delete(authController.restrictTo('admin','user'), userController.deleteMe);

module.exports = router;
