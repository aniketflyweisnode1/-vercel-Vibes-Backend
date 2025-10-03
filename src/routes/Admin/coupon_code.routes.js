const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCouponCode, 
  getAllCouponCodes, 
  getCouponCodeById, 
  getCouponCodeByAuth, 
  updateCouponCode, 
  deleteCouponCode 
} = require('../../controllers/coupon_code.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCouponCodeSchema, 
  updateCouponCodeSchema, 
  getCouponCodeByIdSchema, 
  getAllCouponCodesSchema 
} = require('../../../validators/coupon_code.validator');

// Create coupon code (with auth)
router.post('/create', auth, validateBody(createCouponCodeSchema), createCouponCode);

// Get all coupon codes (with auth)
router.get('/getAll', auth, validateQuery(getAllCouponCodesSchema), getAllCouponCodes);

// Get coupon code by ID (with auth)
router.get('/getCouponCodeById/:id', auth, validateParams(getCouponCodeByIdSchema), getCouponCodeById);

// Get coupon codes by authenticated user (with auth)
router.get('/getCouponCodeByAuth', auth, getCouponCodeByAuth);

// Update coupon code by ID (with auth)
router.put('/updateCouponCodeById', auth, validateBody(updateCouponCodeSchema), updateCouponCode);

// Delete coupon code by ID (with auth)
router.delete('/deleteCouponCodeById/:id', auth, validateParams(getCouponCodeByIdSchema), deleteCouponCode);

module.exports = router;
