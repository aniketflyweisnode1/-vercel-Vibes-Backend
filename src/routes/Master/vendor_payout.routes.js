const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createVendorPayoutSchema, updateVendorPayoutSchema, querySchema, idSchema } = require('../../../validators/vendor_payout.validator');
const { createVendorPayout, getAllVendorPayouts, getVendorPayoutById, updateVendorPayout, deleteVendorPayout } = require('../../controllers/vendor_payout.controller');

// Create vendor payout (with auth)
router.post('/create', auth, validateBody(createVendorPayoutSchema), createVendorPayout);

// Get all vendor payouts (no auth required)
router.get('/all', validateQuery(querySchema), getAllVendorPayouts);

// Get vendor payout by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getVendorPayoutById);

// Update vendor payout (with auth)
router.put('/update', auth, validateBody(updateVendorPayoutSchema), updateVendorPayout);

// Delete vendor payout (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteVendorPayout);

module.exports = router;

