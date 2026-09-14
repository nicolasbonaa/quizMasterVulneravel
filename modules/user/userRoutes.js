const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { registerValidator, loginValidator, profileUpdateValidator } = require('./userValidator');
const { isAuthenticated } = require('../../middlewares/auth');
const profileMulter = require('../../middlewares/profileMulter');
const asyncHandler = require('../../middlewares/asyncHandler');

router.get('/users', asyncHandler(userController.listUsers));
router.get('/users/:id', asyncHandler(userController.getUserById));
router.post('/users', asyncHandler(userController.createUser));
router.put('/users/:id', asyncHandler(userController.updateUser));
router.delete('/users/:id', asyncHandler(userController.deleteUser));

router.post('/register', registerValidator, asyncHandler(userController.register));

router.post('/login', loginValidator, asyncHandler(userController.login));

router.post('/logout', userController.logout);

router.get('/profile/me', isAuthenticated, asyncHandler(userController.getMyProfile));

router.put('/profile/me', isAuthenticated, profileMulter.single('profilePicture'), 
    profileUpdateValidator, asyncHandler(userController.updateProfile));

router.get('/profile/:username', asyncHandler(userController.getPublicProfile));

module.exports = router;