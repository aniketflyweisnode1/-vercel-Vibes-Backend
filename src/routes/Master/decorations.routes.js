const express = require('express');
const router = express.Router();

const { 
  createDecorations, 
  getAllDecorations, 
  getDecorationsById, 
  getDecorationsByAuth, 
  updateDecorations, 
  deleteDecorations 
} = require('../../controllers/decorations.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createDecorationsSchema, 
  updateDecorationsSchema, 
  getDecorationsByIdSchema, 
  getAllDecorationsSchema 
} = require('../../../validators/decorations.validator');

// Create decorations (with auth)
router.post('/create', auth, validateBody(createDecorationsSchema), createDecorations);

// Get all decorations
router.get('/getAll', validateQuery(getAllDecorationsSchema), getAllDecorations);

// Get decorations by ID (with auth)
router.get('/getDecorationsById/:id', auth, validateParams(getDecorationsByIdSchema), getDecorationsById);

// Get decorations by authenticated user (with auth)
router.get('/getDecorationsByAuth', auth, getDecorationsByAuth);

// Update decorations by ID (with auth)
router.put('/updateDecorationsById', auth, validateBody(updateDecorationsSchema), updateDecorations);

// Delete decorations by ID (with auth)
router.delete('/deleteDecorationsById/:id', auth, validateParams(getDecorationsByIdSchema), deleteDecorations);

module.exports = router;

