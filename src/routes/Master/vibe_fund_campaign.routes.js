const express = require('express');
const router = express.Router();

const { 
  createVibeFundCampaign, 
  getAllVibeFundCampaign, 
  getVibeFundCampaignById, 
  getVibeFundCampaignByAuth, 
  updateVibeFundCampaign, 
  deleteVibeFundCampaign,
  changeApprovedStatus 
} = require('../../controllers/vibe_fund_campaign.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createVibeFundCampaignSchema, 
  updateVibeFundCampaignSchema, 
  getVibeFundCampaignByIdSchema, 
  getAllVibeFundCampaignSchema,
  changeApprovedStatusSchema 
} = require('../../../validators/vibe_fund_campaign.validator');

// Create vibe fund campaign (with auth)
router.post('/create', auth, validateBody(createVibeFundCampaignSchema), createVibeFundCampaign);

// Get all vibe fund campaigns
router.get('/getAll', getAllVibeFundCampaign);

// Get vibe fund campaign by ID (with auth)
router.get('/getVibeFundCampaignById/:id', auth, validateParams(getVibeFundCampaignByIdSchema), getVibeFundCampaignById);

// Get vibe fund campaign by authenticated user (with auth)
router.get('/getVibeFundCampaignByAuth', auth, getVibeFundCampaignByAuth);

// Update vibe fund campaign by ID (with auth)
router.put('/updateVibeFundCampaignById', auth, validateBody(updateVibeFundCampaignSchema), updateVibeFundCampaign);

// Delete vibe fund campaign by ID (with auth)
router.delete('/deleteVibeFundCampaignById/:id', auth, validateParams(getVibeFundCampaignByIdSchema), deleteVibeFundCampaign);

// Change approved status of vibe fund campaign (with auth)
router.patch('/changeApprovedStatus', auth, validateBody(changeApprovedStatusSchema), changeApprovedStatus);

module.exports = router;

