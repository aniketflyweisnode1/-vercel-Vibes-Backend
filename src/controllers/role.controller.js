const Role = require('../models/role.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRole = asyncHandler(async (req, res) => {
  try {
    const roleData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create role
    const role = await Role.create(roleData);

    // Note: Number references cannot be populated directly
    sendSuccess(res, role, 'Role created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all roles with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRoles = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [roles, total] = await Promise.all([
      Role.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Role.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };
    sendPaginated(res, roles, pagination, 'Roles retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRoleById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({role_id: parseInt(id)});

    if (!role) {
      return sendNotFound(res, 'Role not found');
    }
    sendSuccess(res, role, 'Role retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update role by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRole = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params || req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const role = await Role.findOneAndUpdate(
      {role_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!role) {
      return sendNotFound(res, 'Role not found');
    }
    sendSuccess(res, role, 'Role updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete role by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRole = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findOneAndUpdate(
      {role_id: parseInt(id)},
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!role) {
      return sendNotFound(res, 'Role not found');
    }
    sendSuccess(res, role, 'Role deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get roles created by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRolesByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object - only show roles created by the authenticated user
    const filter = {
      created_by: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { emoji: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [roles, total] = await Promise.all([
      Role.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Role.countDocuments(filter)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    };
    sendPaginated(res, roles, pagination, 'User roles retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update role by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRoleByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const role = await Role.findOneAndUpdate(
      {role_id: parseInt(id)},
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!role) {
      return sendNotFound(res, 'Role not found');
    }
    sendSuccess(res, role, 'Role updated successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  updateRoleByIdBody,
  deleteRole,
  getRolesByAuth
};

