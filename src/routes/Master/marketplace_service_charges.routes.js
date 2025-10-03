const express = require('express');
const router = express.Router();

const { 
  createMarketPlaceServiceCharges, 
  getAllMarketPlaceServiceCharges, 
  getMarketPlaceServiceChargesById, 
  getMarketPlaceServiceChargesByAuth, 
  updateMarketPlaceServiceCharges, 
  deleteMarketPlaceServiceCharges 
} = require('../../controllers/marketplace_service_charges.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createMarketPlaceServiceChargesSchema, 
  updateMarketPlaceServiceChargesSchema, 
  getMarketPlaceServiceChargesByIdSchema, 
  getAllMarketPlaceServiceChargesSchema 
} = require('../../../validators/marketplace_service_charges.validator');

// Create marketplace service charges (with auth)
router.post('/create', auth, validateBody(createMarketPlaceServiceChargesSchema), createMarketPlaceServiceCharges);

// Get all marketplace service charges
router.get('/getAll',  getAllMarketPlaceServiceCharges);

// Get marketplace service charges by ID (with auth)
router.get('/getMarketPlaceServiceChargesById/:id', auth, validateParams(getMarketPlaceServiceChargesByIdSchema), getMarketPlaceServiceChargesById);

// Get marketplace service charges by authenticated user (with auth)
router.get('/getMarketPlaceServiceChargesByAuth', auth, getMarketPlaceServiceChargesByAuth);

// Update marketplace service charges by ID (with auth)
router.put('/updateMarketPlaceServiceChargesById', auth, validateBody(updateMarketPlaceServiceChargesSchema), updateMarketPlaceServiceCharges);

// Delete marketplace service charges by ID (with auth)
router.delete('/deleteMarketPlaceServiceChargesById/:id', auth, validateParams(getMarketPlaceServiceChargesByIdSchema), deleteMarketPlaceServiceCharges);

module.exports = router;

