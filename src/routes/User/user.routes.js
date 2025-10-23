const express = require('express');
const router = express.Router();

// Import controllers
const { createUser, getAllUsers, getUserById, updateUser, updateUserByIdBody, deleteUser, login, logout, getProfile, updateProfile, changePassword, sendOTP, verifyOTP, getUsersByRoleId, forgotPassword, resetPassword, PlatFormFeePayment } = require('../../controllers/user.controller'); 
  // Import middleware
const { auth, authRateLimit } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
// Import validators
const { createUserSchema, updateUserSchema, updateUserByIdBodySchema, loginSchema, getUserByIdSchema, getAllUsersSchema, changePasswordSchema, sendOTPSchema, verifyOTPSchema, getUsersByRoleIdSchema, getUsersByRoleIdQuerySchema, forgotPasswordSchema, resetPasswordSchema } = require('../../../validators/user.validator');

router.post('/login', authRateLimit, validateBody(loginSchema), login);
router.post('/logout', auth, logout);

router.post('/send-otp', authRateLimit, validateBody(sendOTPSchema), sendOTP);
router.post('/verify-otp', authRateLimit, validateBody(verifyOTPSchema), verifyOTP);

router.post('/forgot-password', authRateLimit, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimit, validateBody(resetPasswordSchema), resetPassword);

router.post('/create',  validateBody(createUserSchema), createUser);

router.get('/getAll',  getAllUsers);

router.get('/getByRoleId/:role_id', auth, validateParams(getUsersByRoleIdSchema), validateQuery(getUsersByRoleIdQuerySchema), getUsersByRoleId);

router.get('/getProfile', auth, getProfile);

router.put('/updateProfile', auth, validateBody(updateUserSchema), updateProfile);    

router.put('/changePassword', auth, validateBody(changePasswordSchema), changePassword);   

router.get('/getUserById/:id', auth, validateParams(getUserByIdSchema), getUserById);

router.put('/updateUserById', auth, validateBody(updateUserByIdBodySchema), updateUserByIdBody);

router.delete('/deleteUserById/:id',  auth, validateParams(getUserByIdSchema), deleteUser);

// Process platform fee payment (with auth) - Creates PlatformFee transaction and updates user
router.post('/PlatFormFeePayment', auth, PlatFormFeePayment);

module.exports = router;
