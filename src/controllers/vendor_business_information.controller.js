const VendorBusinessInformation = require('../models/vendor_business_information.model');
const User = require('../models/user.model');
const City = require('../models/city.model');
const State = require('../models/state.model');
const Country = require('../models/country.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Helper function to populate related data
 */
const populateVendorBusinessInformation = async (businessInfo) => {
  if (!businessInfo) return null;
  
  const populatedData = Array.isArray(businessInfo) 
    ? businessInfo.map(item => item.toObject ? item.toObject() : item)
    : [businessInfo.toObject ? businessInfo.toObject() : businessInfo];
  
  const result = await Promise.all(
    populatedData.map(async (item) => {
      // Populate vendor_id (User)
      if (item.vendor_id) {
        try {
          const vendor = await User.findOne({ user_id: item.vendor_id });
          item.vendor_details = vendor ? {
            user_id: vendor.user_id,
            name: vendor.name,
            email: vendor.email,
            mobile: vendor.mobile,
            role_id: vendor.role_id
          } : null;
        } catch (error) {
          item.vendor_details = null;
        }
      }

      // Populate City
      if (item.Basic_information_City_id) {
        try {
          const city = await City.findOne({ city_id: item.Basic_information_City_id });
          item.city_details = city ? {
            city_id: city.city_id,
            name: city.name
          } : null;
        } catch (error) {
          item.city_details = null;
        }
      }

      // Populate State
      if (item.Basic_information_State_id) {
        try {
          const state = await State.findOne({ state_id: item.Basic_information_State_id });
          item.state_details = state ? {
            state_id: state.state_id,
            name: state.name
          } : null;
        } catch (error) {
          item.state_details = null;
        }
      }

      // Populate Country
      if (item.Basic_information_Country_id) {
        try {
          const country = await Country.findOne({ country_id: item.Basic_information_Country_id });
          item.country_details = country ? {
            country_id: country.country_id,
            name: country.name
          } : null;
        } catch (error) {
          item.country_details = null;
        }
      }

      // Populate CreateBy and UpdatedBy
      if (item.created_by) {
        try {
          const createdByUser = await User.findOne({ user_id: item.created_by });
          item.created_by_details = createdByUser ? {
            user_id: createdByUser.user_id,
            name: createdByUser.name,
            email: createdByUser.email
          } : null;
        } catch (error) {
          item.created_by_details = null;
        }
      }

      if (item.updated_by) {
        try {
          const updatedByUser = await User.findOne({ user_id: item.updated_by });
          item.updated_by_details = updatedByUser ? {
            user_id: updatedByUser.user_id,
            name: updatedByUser.name,
            email: updatedByUser.email
          } : null;
        } catch (error) {
          item.updated_by_details = null;
        }
      }

      return item;
    })
  );
  
  return Array.isArray(businessInfo) ? result : result[0];
};

/**
 * Create a new vendor business information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorBusinessInformation = asyncHandler(async (req, res) => {
  try {
    // Create vendor business information data
    const businessInfoData = {
      ...req.body,
      vendor_id: req.userId || req.body.vendor_id,
      created_by: req.userId || null
    };

    // Create vendor business information
    const businessInfo = await VendorBusinessInformation.create(businessInfoData);
    const populatedBusinessInfo = await populateVendorBusinessInformation(businessInfo);
    sendSuccess(res, populatedBusinessInfo, 'Vendor business information created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vendor business information with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVendorBusinessInformation = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      approval_by_admin,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { business_name: { $regex: search, $options: 'i' } },
        { business_email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { Basic_information_LegalName: { $regex: search, $options: 'i' } },
        { Basic_information_Business_Description: { $regex: search, $options: 'i' } },
        { KYC_fullname: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Add approval filter
    if (approval_by_admin !== undefined) {
      filter.approval_by_admin = approval_by_admin === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [businessInfo, total] = await Promise.all([
      VendorBusinessInformation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorBusinessInformation.countDocuments(filter)
    ]);

    // Populate related data
    const populatedBusinessInfo = await populateVendorBusinessInformation(businessInfo);

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
    sendPaginated(res, populatedBusinessInfo, pagination, 'Vendor business information retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor business information by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorBusinessInformationById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const businessInfo = await VendorBusinessInformation.findOne({ 
      business_information_id: parseInt(id) 
    });

    if (!businessInfo) {
      return sendNotFound(res, 'Vendor business information not found');
    }
    const populatedBusinessInfo = await populateVendorBusinessInformation(businessInfo);
    sendSuccess(res, populatedBusinessInfo, 'Vendor business information retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor business information by authenticated vendor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorBusinessInformationByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      approval_by_admin,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      vendor_id: req.userId
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { business_name: { $regex: search, $options: 'i' } },
        { business_email: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { Basic_information_LegalName: { $regex: search, $options: 'i' } },
        { Basic_information_Business_Description: { $regex: search, $options: 'i' } },
        { KYC_fullname: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Add approval filter
    if (approval_by_admin !== undefined) {
      filter.approval_by_admin = approval_by_admin === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [businessInfo, total] = await Promise.all([
      VendorBusinessInformation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VendorBusinessInformation.countDocuments(filter)
    ]);

    // Populate related data
    const populatedBusinessInfo = await populateVendorBusinessInformation(businessInfo);

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
    sendPaginated(res, populatedBusinessInfo, pagination, 'Vendor business information retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor business information by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorBusinessInformation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const businessInfo = await VendorBusinessInformation.findOneAndUpdate(
      { business_information_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!businessInfo) {
      return sendNotFound(res, 'Vendor business information not found');
    }
    const populatedBusinessInfo = await populateVendorBusinessInformation(businessInfo);
    sendSuccess(res, populatedBusinessInfo, 'Vendor business information updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor business information by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorBusinessInformationByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const businessInfo = await VendorBusinessInformation.findOneAndUpdate(
      { business_information_id: parseInt(id) },
      finalUpdateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!businessInfo) {
      return sendNotFound(res, 'Vendor business information not found');
    }
    const populatedBusinessInfo = await populateVendorBusinessInformation(businessInfo);
    sendSuccess(res, populatedBusinessInfo, 'Vendor business information updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vendor business information by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVendorBusinessInformation = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const businessInfo = await VendorBusinessInformation.findOneAndUpdate(
      { business_information_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!businessInfo) {
      return sendNotFound(res, 'Vendor business information not found');
    }
    sendSuccess(res, businessInfo, 'Vendor business information deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVendorBusinessInformation,
  getAllVendorBusinessInformation,
  getVendorBusinessInformationById,
  getVendorBusinessInformationByAuth,
  updateVendorBusinessInformation,
  updateVendorBusinessInformationByIdBody,
  deleteVendorBusinessInformation
};

