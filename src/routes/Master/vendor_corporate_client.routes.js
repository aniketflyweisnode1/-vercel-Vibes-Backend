const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createVendorCorporateClientSchema, updateVendorCorporateClientSchema, querySchema, idSchema } = require('../../../validators/vendor_corporate_client.validator');
const { createVendorCorporateClient, getAllVendorCorporateClients, getVendorCorporateClientById, getVendorCorporateClientsByAuth, updateVendorCorporateClient, deleteVendorCorporateClient } = require('../../controllers/vendor_corporate_client.controller');

// Create vendor corporate client (with auth)
router.post('/create', auth, validateBody(createVendorCorporateClientSchema), createVendorCorporateClient);

// Get all vendor corporate clients (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllVendorCorporateClients);

// Get vendor corporate clients by authenticated user (with auth)
router.get('/my-clients', auth, validateQuery(querySchema), getVendorCorporateClientsByAuth);

// Get vendor corporate client by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getVendorCorporateClientById);

// Update vendor corporate client (with auth)
router.put('/update', auth, validateBody(updateVendorCorporateClientSchema), updateVendorCorporateClient);

// Delete vendor corporate client (with auth)
router.delete('/delete/:id', auth, deleteVendorCorporateClient);

module.exports = router;
