const City = require('../models/city.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new city
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createCity = asyncHandler(async (req, res) => {
  try {
    // Create city data
    const cityData = {
      ...req.body,
      created_by: req.userId || 1
    };

    // Create city
    const city = await City.create(cityData);

    // Note: Number references cannot be populated directly
    sendSuccess(res, city, 'City created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all cities with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCities = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      country_id,
      state_id,
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

    // Add country_id filter
    if (country_id) {
      filter.country_id = country_id;
    }

    // Add state_id filter
    if (state_id) {
      filter.state_id = state_id;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [cities, total] = await Promise.all([
      City.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      City.countDocuments(filter)
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
    sendPaginated(res, cities, pagination, 'Cities retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get city by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCityById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findOne({city_id: parseInt(id)});

    if (!city) {
      return sendNotFound(res, 'City not found');
    }
    sendSuccess(res, city, 'City retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update city by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateCity = asyncHandler(async (req, res) => {
  try {
    const { id } =  req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const city = await City.findOneAndUpdate(
      {city_id: id},
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!city) {
      return sendNotFound(res, 'City not found');
    }
    sendSuccess(res, city, 'City updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get cities by country ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCitiesByCountryId = asyncHandler(async (req, res) => {
  try {
    const { countryId } = req.params;

    const cities = await City.find({ country_id: parseInt(countryId), status: true })
      .sort({ name: 1 });
    sendSuccess(res, cities, 'Cities by country retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get cities by state ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCitiesByStateId = asyncHandler(async (req, res) => {
  try {
    const { stateId } = req.params;

    const cities = await City.find({ state_id: parseInt(stateId), status: true })
      .sort({ name: 1 });
    sendSuccess(res, cities, 'Cities by state retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete city by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteCity = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const city = await City.findOneAndDelete({ city_id: parseInt(id) });

    if (!city) {
      return sendNotFound(res, 'City not found');
    }

    sendSuccess(res, null, 'City deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createCity,
  getAllCities,
  getCityById,
  updateCity,
  getCitiesByCountryId,
  getCitiesByStateId,
  deleteCity
};

