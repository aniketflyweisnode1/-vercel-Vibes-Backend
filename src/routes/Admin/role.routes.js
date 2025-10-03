const express = require('express');
const router = express.Router();

// Import controllers
const { 
  createRole, 
  getAllRoles, 
  getRoleById, 
  updateRole, 
  updateRoleByIdBody, 
  deleteRole, 
  getRolesByAuth 
} = require('../../controllers/role.controller'); 

// Import middleware
const { auth } = require('../../../middleware/auth');
const { validateBody, validateQuery, validateParams } = require('../../../middleware/validation');

// Import validators
const { 
  createRoleSchema, 
  updateRoleSchema, 
  updateRoleByIdBodySchema, 
  getRoleByIdSchema, 
  getAllRolesSchema 
} = require('../../../validators/role.validator');

// Create role with auth
router.post('/create', validateBody(createRoleSchema), createRole);

// Get all roles with auth
router.get('/getAll', getAllRoles);

// Get roles by authenticated user with auth
router.get('/getByAuth', auth, validateQuery(getAllRolesSchema), getRolesByAuth);

// Get role by ID with auth
router.get('/getById/:id', auth, validateParams(getRoleByIdSchema), getRoleById);

// Update role by ID with auth
router.put('/updateById', auth, validateBody(updateRoleByIdBodySchema), updateRoleByIdBody);

// Delete role by ID with auth
router.delete('/deleteById/:id', auth, validateParams(getRoleByIdSchema), deleteRole);

module.exports = router;
