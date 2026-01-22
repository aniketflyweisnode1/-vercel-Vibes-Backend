const express = require('express');
const router = express.Router();

// Import controllers
const { createUser, getAllUsers, getUserById, updateUser, checkOutPackageById, verifyPackageById, cancelPackageMemberShip, webhookPackage, updateUserByIdBody, deleteUser, login, logout, getProfile, getStaffWorkingPrice, updateProfile, changePassword, sendOTP, verifyOTP, getUsersByRoleId, forgotPassword, resetPassword, PlatFormFeePayment, updateStaffProfile, testSendForgotPasswordOTPEmail } = require('../../controllers/user.controller');
// Import middleware
const { auth, authRateLimit } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
// Import validators
const { createUserSchema, updateUserSchema, updateUserByIdBodySchema, loginSchema, getUserByIdSchema, getAllUsersSchema, changePasswordSchema, sendOTPSchema, verifyOTPSchema, getUsersByRoleIdSchema, getUsersByRoleIdQuerySchema, forgotPasswordSchema, resetPasswordSchema, testEmailSchema } = require('../../../validators/user.validator');

router.post('/login', authRateLimit, validateBody(loginSchema), login);
router.post('/logout', auth, logout);
router.post('/send-otp', authRateLimit, validateBody(sendOTPSchema), sendOTP);
router.post('/verify-otp', authRateLimit, validateBody(verifyOTPSchema), verifyOTP);
router.post('/forgot-password', authRateLimit, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimit, validateBody(resetPasswordSchema), resetPassword);
router.post('/test-email-send', testSendForgotPasswordOTPEmail);
router.post('/create', validateBody(createUserSchema), createUser);
router.get('/getAll', getAllUsers);
router.get('/getByRoleId/:role_id', auth, validateParams(getUsersByRoleIdSchema), validateQuery(getUsersByRoleIdQuerySchema), getUsersByRoleId);
router.get('/getProfile', auth, getProfile);
router.get('/getStaffWorkingPrice', auth, getStaffWorkingPrice);
router.put('/updateProfile', auth, validateBody(updateUserSchema), updateProfile);
router.put('/updateStaffProfile', auth, updateStaffProfile);
router.put('/changePassword', auth, validateBody(changePasswordSchema), changePassword);
router.get('/getUserById/:id', auth, validateParams(getUserByIdSchema), getUserById);
router.put('/updateUserById', auth, validateBody(updateUserByIdBodySchema), updateUserByIdBody);
router.delete('/deleteUserById/:id', auth, validateParams(getUserByIdSchema), deleteUser);
router.post('/PlatFormFeePayment', auth, PlatFormFeePayment);

router.post("/checkOutPackageById/:id", auth, checkOutPackageById);
router.post("/verifyPackageById/:transactionId", verifyPackageById);
router.post("/cancelPackageMemberShip", auth, cancelPackageMemberShip);
router.post("/webhook", webhookPackage);

module.exports = router;
