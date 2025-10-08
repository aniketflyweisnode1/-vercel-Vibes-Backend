const Country = require('../models/country.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new country
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCountry = asyncHandler(async (req, res) => {
  try {
    // Create country data
    const countryData = {
      ...req.body,
      created_by: req.userId
    };

    // Create country
    const country = await Country.create(countryData);

    // Note: Number references cannot be populated directly
    sendSuccess(res, country, 'Country created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all countries with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCountries = asyncHandler(async (req, res) => {
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
        { name: { $regex: search, $options: 'i' } }
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
    const [countries, total] = await Promise.all([
      Country.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Country.countDocuments(filter)
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
    sendPaginated(res, countries, pagination, 'Countries retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get country by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCountryById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findOne({country_id: parseInt(id)});

    if (!country) {
      return sendNotFound(res, 'Country not found');
    }
    sendSuccess(res, country, 'Country retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update country by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCountry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params || req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const country = await Country.findOneAndUpdate(
      {country_id: parseInt(id)},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!country) {
      return sendNotFound(res, 'Country not found');
    }
    sendSuccess(res, country, 'Country updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete country by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCountry = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const country = await Country.findOneAndDelete({ country_id: parseInt(id) });

    if (!country) {
      return sendNotFound(res, 'Country not found');
    }

    sendSuccess(res, null, 'Country deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountry,
  deleteCountry
};

