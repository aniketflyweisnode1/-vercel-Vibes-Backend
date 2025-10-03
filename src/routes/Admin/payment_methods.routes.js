const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createPaymentMethod, 
  getAllPaymentMethods, 
  getPaymentMethodById, 
  updatePaymentMethod, 
  updatePaymentMethodByIdBody, 
  deletePaymentMethod, 
  getPaymentMethodsByAuth 
} = require('../../controllers/payment_methods.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createPaymentMethodSchema, 
  updatePaymentMethodSchema, 
  updatePaymentMethodByIdBodySchema, 
  getPaymentMethodByIdSchema, 
  getAllPaymentMethodsSchema 
} = require('../../../validators/payment_methods.validator');

// Create payment method with auth
router.post('/create', auth, validateBody(createPaymentMethodSchema), createPaymentMethod);

// Get all payment methods with auth
router.get('/getAll', auth, validateQuery(getAllPaymentMethodsSchema), getAllPaymentMethods);

// Get payment methods by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllPaymentMethodsSchema), getPaymentMethodsByAuth);

// Get payment method by ID with auth
router.get('/getById/:id', auth, validateParams(getPaymentMethodByIdSchema), getPaymentMethodById);

// Update payment method by ID with auth
router.put('/updateById', auth, validateBody(updatePaymentMethodByIdBodySchema), updatePaymentMethodByIdBody);

// Delete payment method by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getPaymentMethodByIdSchema), deletePaymentMethod);

module.exports = router;
