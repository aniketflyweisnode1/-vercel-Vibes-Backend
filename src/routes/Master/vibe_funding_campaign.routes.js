const express = require('express');
const router = express.Router();

const { 
  createVibeFundingCampaign, 
  getAllVibeFundingCampaign, 
  getVibeFundingCampaignById, 
  updateVibeFundingCampaign, 
  deleteVibeFundingCampaign 
} = require('../../controllers/vibe_funding_campaign.controller');

const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

const { 
  createVibeFundingCampaignSchema, 
  updateVibeFundingCampaignSchema, 
  getVibeFundingCampaignByIdSchema, 
  getAllVibeFundingCampaignSchema 
} = require('../../../validators/vibe_funding_campaign.validator');

// Create vibe funding campaign (with auth)
router.post('/create', auth, validateBody(createVibeFundingCampaignSchema), createVibeFundingCampaign);

// Get all vibe funding campaigns
router.get('/getAll', getAllVibeFundingCampaign);

// Get vibe funding campaign by ID (with auth)
router.get('/getVibeFundingCampaignById/:id', auth, validateParams(getVibeFundingCampaignByIdSchema), getVibeFundingCampaignById);

// Update vibe funding campaign by ID (with auth)
router.put('/updateVibeFundingCampaignById', auth, validateBody(updateVibeFundingCampaignSchema), updateVibeFundingCampaign);

// Delete vibe funding campaign by ID (with auth)
router.delete('/deleteVibeFundingCampaignById/:id', auth, validateParams(getVibeFundingCampaignByIdSchema), deleteVibeFundingCampaign);

module.exports = router;

