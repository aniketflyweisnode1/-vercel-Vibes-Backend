const express = require('express');
const router = express.Router();
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');
const { createFilterVendorLeadsSchema, updateFilterVendorLeadsSchema, querySchema, idSchema } = require('../../../validators/filter_vendor_leads.validator');
const { createFilterVendorLeads, getAllFilterVendorLeads, getFilterVendorLeadsById, getFilterVendorLeadsByAuth, updateFilterVendorLeads, deleteFilterVendorLeads } = require('../../controllers/filter_vendor_leads.controller');

// Create filter vendor leads (with auth)
router.post('/create', auth, validateBody(createFilterVendorLeadsSchema), createFilterVendorLeads);

// Get all filter vendor leads (with auth)
router.get('/all', auth, validateQuery(querySchema), getAllFilterVendorLeads);

// Get filter vendor leads by authenticated user (with auth)
router.get('/my-leads', auth, validateQuery(querySchema), getFilterVendorLeadsByAuth);

// Get filter vendor leads by ID (with auth)
router.get('/get/:id', auth, validateParams(idSchema), getFilterVendorLeadsById);

// Update filter vendor leads (with auth)
router.put('/update', auth, validateBody(updateFilterVendorLeadsSchema), updateFilterVendorLeads);

// Delete filter vendor leads (with auth)
router.delete('/delete/:id', auth, deleteFilterVendorLeads);

module.exports = router;
