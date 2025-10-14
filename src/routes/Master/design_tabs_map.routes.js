const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createDesignTabsMap, 
  getAllDesignTabsMaps, 
  getDesignTabsMapById,
  getDesignsByTabId,
  updateDesignTabsMap, 
  deleteDesignTabsMap 
} = require('../../controllers/design_tabs_map.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createDesignTabsMapSchema, 
  updateDesignTabsMapSchema, 
  getDesignTabsMapByIdSchema, 
  getAllDesignTabsMapsSchema 
} = require('../../../validators/design_tabs_map.validator');

// Create design tabs map (with auth)
router.post('/create', auth, validateBody(createDesignTabsMapSchema), createDesignTabsMap);

// Get all design tabs maps (without auth)
router.get('/getAll', validateQuery(getAllDesignTabsMapsSchema), getAllDesignTabsMaps);

// Get design tabs map by ID (with auth)
router.get('/getDesignTabsMapById/:id', auth, validateParams(getDesignTabsMapByIdSchema), getDesignTabsMapById);

// Get designs by tab ID (without auth)
router.get('/getDesignsByTabId/:id', validateParams(getDesignTabsMapByIdSchema), validateQuery(getAllDesignTabsMapsSchema), getDesignsByTabId);

// Update design tabs map by ID (with auth)
router.put('/updateDesignTabsMapById', auth, validateBody(updateDesignTabsMapSchema), updateDesignTabsMap);

// Delete design tabs map by ID (with auth)
router.delete('/deleteDesignTabsMapById/:id', auth, validateParams(getDesignTabsMapByIdSchema), deleteDesignTabsMap);

module.exports = router;

