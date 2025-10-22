const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createEmailTemplate, 
  getAllEmailTemplate, 
  getEmailTemplateById, 
  updateEmailTemplate, 
  updateEmailTemplateByIdBody, 
  deleteEmailTemplate 
} = require('../../controllers/email_template.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createEmailTemplateSchema, 
  updateEmailTemplateSchema, 
  updateEmailTemplateByIdBodySchema, 
  getEmailTemplateByIdSchema, 
  getAllEmailTemplateSchema 
} = require('../../../validators/email_template.validator');

// Create email template with auth
router.post('/create', auth, validateBody(createEmailTemplateSchema), createEmailTemplate);

// Get all email templates with auth
router.get('/getAll', auth, validateQuery(getAllEmailTemplateSchema), getAllEmailTemplate);

// Get email template by ID with auth
router.get('/getById/:id', auth, validateParams(getEmailTemplateByIdSchema), getEmailTemplateById);

// Update email template by ID with auth
router.put('/updateById', auth, validateBody(updateEmailTemplateByIdBodySchema), updateEmailTemplateByIdBody);

// Delete email template by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getEmailTemplateByIdSchema), deleteEmailTemplate);

module.exports = router;
