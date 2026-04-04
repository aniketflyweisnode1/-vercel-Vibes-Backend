const express = require('express');
const router = express.Router();

const { createGuestPackage, getAllGuestPackage, getGuestPackageById, updateGuestPackage, deleteGuestPackage, getGuestPackageByAuth } = require('../../controllers/guestPackage.controller');

const { auth } = require('../../../middleware/auth');
// Create dress code (with auth)
router.post('/create', auth, createGuestPackage);

// Get all dress codes
router.get('/getAll', getAllGuestPackage);

// Get dress code by ID (with auth)
router.get('/getGuestPackageById/:id', auth, getGuestPackageById);

// Get dress code by authenticated user (with auth)
router.get('/getGuestPackageByAuth', auth, getGuestPackageByAuth);

// Update dress code by ID (with auth)
router.put('/updateGuestPackageById', auth, updateGuestPackage);

// Delete dress code by ID (with auth)
router.delete('/deleteGuestPackageById/:id', auth, deleteGuestPackage);

module.exports = router;

