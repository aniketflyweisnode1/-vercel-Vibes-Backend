const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createBankName, 
  getAllBankNames, 
  getBankNameById, 
  updateBankName, 
  updateBankNameByIdBody, 
  deleteBankName, 
  getBankNamesByAuth 
} = require('../../controllers/bank_name.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createBankNameSchema, 
  updateBankNameSchema, 
  updateBankNameByIdBodySchema, 
  getBankNameByIdSchema, 
  getAllBankNamesSchema 
} = require('../../../validators/bank_name.validator');

// Create bank name with auth
router.post('/create', auth, validateBody(createBankNameSchema), createBankName);

// Get all bank names with auth
router.get('/getAll', auth, validateQuery(getAllBankNamesSchema), getAllBankNames);

// Get bank names by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllBankNamesSchema), getBankNamesByAuth);

// Get bank name by ID with auth
router.get('/getById/:id', auth, validateParams(getBankNameByIdSchema), getBankNameById);

// Update bank name by ID with auth
router.put('/updateById', auth, validateBody(updateBankNameByIdBodySchema), updateBankNameByIdBody);

// Delete bank name by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getBankNameByIdSchema), deleteBankName);

module.exports = router;
