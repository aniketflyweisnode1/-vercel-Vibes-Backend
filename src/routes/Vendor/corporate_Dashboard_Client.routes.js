const express = require('express');
const router = express.Router();

// Import controllers
const {
  createCorporateDashboardClient,
  getAllCorporateDashboardClients,
  getCorporateDashboardClientById,
  updateCorporateDashboardClient,
  deleteCorporateDashboardClient
} = require('../../controllers/corporate_Dashboard_Client.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const {
  createCorporateDashboardClientSchema,
  updateCorporateDashboardClientSchema,
  getCorporateDashboardClientByIdSchema,
  querySchema,
  deleteCorporateDashboardClientSchema
} = require('../../../validators/corporate_Dashboard_Client.validator');

// Create corporate dashboard client (with auth)
router.post('/create', auth, validateBody(createCorporateDashboardClientSchema), createCorporateDashboardClient);

// Get all corporate dashboard clients (with auth)
router.get('/getAll', auth, validateQuery(querySchema), getAllCorporateDashboardClients);

// Get corporate dashboard client by ID (with auth)
router.get('/getById/:id', auth, validateParams(getCorporateDashboardClientByIdSchema), getCorporateDashboardClientById);

// Update corporate dashboard client (with auth)
router.put('/update', auth, validateBody(updateCorporateDashboardClientSchema), updateCorporateDashboardClient);

// Delete corporate dashboard client (with auth)
router.delete('/delete/:id', auth, validateParams(deleteCorporateDashboardClientSchema), deleteCorporateDashboardClient);

module.exports = router;
