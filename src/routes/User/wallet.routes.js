const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createWallet, 
  getAllWallets, 
  getWalletById, 
  getWalletByAuth, 
  updateWallet, 
  updateWalletByAuth, 
  deleteWallet 
} = require('../../controllers/wallet.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createWalletSchema, 
  updateWalletSchema, 
  getWalletByIdSchema, 
  getAllWalletsSchema 
} = require('../../../validators/wallet.validator');

// Create wallet (with auth)
router.post('/create', auth, validateBody(createWalletSchema), createWallet);

// Get all wallets (with auth)
router.get('/getAll', auth, validateQuery(getAllWalletsSchema), getAllWallets);

// Get wallet by ID (with auth)
router.get('/getWalletById/:id', auth, validateParams(getWalletByIdSchema), getWalletById);

// Get wallet by authenticated user (with auth)
router.get('/getWalletByAuth', auth, getWalletByAuth);

// Update wallet by ID (with auth)
router.put('/updateWalletById', auth, validateBody(updateWalletSchema), updateWallet);

// Update wallet by authenticated user (with auth)
router.put('/updateWalletByAuth', auth, validateBody(updateWalletSchema), updateWalletByAuth);

// Delete wallet by ID (with auth)
router.delete('/deleteWalletById/:id', auth, validateParams(getWalletByIdSchema), deleteWallet);

module.exports = router;
