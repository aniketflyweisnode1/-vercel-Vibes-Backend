const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createCommunityDesignDownload, 
  getAllCommunityDesignDownloads, 
  getCommunityDesignDownloadById, 
  updateCommunityDesignDownload, 
  deleteCommunityDesignDownload 
} = require('../../controllers/community_designs_downloads.controller');

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createCommunityDesignDownloadSchema, 
  updateCommunityDesignDownloadSchema, 
  getCommunityDesignDownloadByIdSchema, 
  getAllCommunityDesignDownloadsSchema 
} = require('../../../validators/community_designs_downloads.validator');

// Create community design download (with auth)
router.post('/create', auth, validateBody(createCommunityDesignDownloadSchema), createCommunityDesignDownload);

// Get all community design downloads (without auth)
router.get('/getAll', validateQuery(getAllCommunityDesignDownloadsSchema), getAllCommunityDesignDownloads);

// Get community design download by ID (with auth)
router.get('/getCommunityDesignDownloadById/:id', auth, validateParams(getCommunityDesignDownloadByIdSchema), getCommunityDesignDownloadById);

// Update community design download by ID (with auth)
router.put('/updateCommunityDesignDownloadById', auth, validateBody(updateCommunityDesignDownloadSchema), updateCommunityDesignDownload);

// Delete community design download by ID (with auth)
router.delete('/deleteCommunityDesignDownloadById/:id', auth, validateParams(getCommunityDesignDownloadByIdSchema), deleteCommunityDesignDownload);

module.exports = router;

