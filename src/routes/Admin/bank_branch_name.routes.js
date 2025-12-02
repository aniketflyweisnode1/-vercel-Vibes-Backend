const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createBankBranchName, 
  getAllBankBranchNames, 
  getBankBranchNameById, 
  updateBankBranchName, 
  updateBankBranchNameByIdBody, 
  deleteBankBranchName, 
  getBankBranchNamesByAuth 
} = require('../../controllers/bank_branch_name.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createBankBranchNameSchema, 
  updateBankBranchNameSchema, 
  updateBankBranchNameByIdBodySchema, 
  getBankBranchNameByIdSchema, 
  getAllBankBranchNamesSchema 
} = require('../../../validators/bank_branch_name.validator');

// Create bank branch name with auth
router.post('/create', auth, createBankBranchName);

// Get all bank branch names with auth
router.get('/getAll', auth, validateQuery(getAllBankBranchNamesSchema), getAllBankBranchNames);

// Get bank branch names by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllBankBranchNamesSchema), getBankBranchNamesByAuth);

// Get bank branch name by ID with auth
router.get('/getById/:id', auth, validateParams(getBankBranchNameByIdSchema), getBankBranchNameById);

// Update bank branch name by ID with auth
router.put('/updateById', auth, validateBody(updateBankBranchNameByIdBodySchema), updateBankBranchNameByIdBody);

// Delete bank branch name by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getBankBranchNameByIdSchema), deleteBankBranchName);

module.exports = router;
