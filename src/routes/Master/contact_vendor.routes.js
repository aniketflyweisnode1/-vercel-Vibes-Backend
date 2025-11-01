const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createContactVendorSchema, updateContactVendorSchema, querySchema, idSchema } = require('../../../validators/contact_vendor.validator');
const { createContactVendor, getAllContactVendors, getContactVendorById, updateContactVendor, deleteContactVendor } = require('../../controllers/contact_vendor.controller');

// Create contact vendor (with auth)
router.post('/create', auth, validateBody(createContactVendorSchema), createContactVendor);

// Get all contact vendors (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllContactVendors);

// Get contact vendor by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getContactVendorById);

// Update contact vendor (with auth)
router.put('/update', auth, validateBody(updateContactVendorSchema), updateContactVendor);

// Delete contact vendor (with auth)
router.delete('/delete/:id', auth, validateParams(idSchema), deleteContactVendor);

module.exports = router;

