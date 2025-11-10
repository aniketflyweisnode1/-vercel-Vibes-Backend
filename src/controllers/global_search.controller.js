const GlobalSearch = require('../models/global_search.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create global search entry
 */
const createGlobalSearch = asyncHandler(async (req, res) => {
  try {
    if (!req.userId) {
      return sendError(res, 'Authentication required', 401);
    }

    const globalSearchData = {
      ...req.body,
      CreateBy: req.userId,
      CreateAt: new Date(),
      UpdatedBy: null,
      UpdatedAt: new Date()
    };

    const entry = await GlobalSearch.create(globalSearchData);
    sendSuccess(res, entry, 'Global search entry created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all global search entries with pagination and filtering
 */
const getAllGlobalSearch = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      Status,
      search = ''
    } = req.query;

    const filter = {};

    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    if (search) {
      const regex = { $regex: search, $options: 'i' };
      filter.$or = [
        { Page_Name: regex },
        { Page_Routes: regex },
        { Page_content: regex }
      ];
    }

    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      GlobalSearch.find(filter)
        .sort({ CreateAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      GlobalSearch.countDocuments(filter)
    ]);

    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };

    sendPaginated(res, entries, pagination, 'Global search entries retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get global search entry by ID
 */
const getGlobalSearchById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await GlobalSearch.findOne({ GlobalSearch_id: parseInt(id, 10) });

    if (!entry) {
      return sendNotFound(res, 'Global search entry not found');
    }

    sendSuccess(res, entry, 'Global search entry retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update global search entry
 */
const updateGlobalSearch = asyncHandler(async (req, res) => {
  try {
    const { GlobalSearch_id, ...updateBody } = req.body;

    if (!req.userId) {
      return sendError(res, 'Authentication required', 401);
    }

    const entry = await GlobalSearch.findOne({ GlobalSearch_id: parseInt(GlobalSearch_id, 10) });

    if (!entry) {
      return sendNotFound(res, 'Global search entry not found');
    }

    const updateData = {
      ...updateBody,
      UpdatedBy: req.userId,
      UpdatedAt: new Date()
    };

    const updatedEntry = await GlobalSearch.findOneAndUpdate(
      { GlobalSearch_id: parseInt(GlobalSearch_id, 10) },
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedEntry, 'Global search entry updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete (soft delete) global search entry
 */
const deleteGlobalSearch = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.userId) {
      return sendError(res, 'Authentication required', 401);
    }

    const entry = await GlobalSearch.findOne({ GlobalSearch_id: parseInt(id, 10) });

    if (!entry) {
      return sendNotFound(res, 'Global search entry not found');
    }

    const deletedEntry = await GlobalSearch.findOneAndUpdate(
      { GlobalSearch_id: parseInt(id, 10) },
      {
        Status: false,
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    sendSuccess(res, deletedEntry, 'Global search entry deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Search global content
 */
const searchGlobalContent = asyncHandler(async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || !q.trim()) {
      return sendError(res, 'Search query is required', 400);
    }

    const query = {
      Status: true,
      $or: [
        { Page_Name: { $regex: q, $options: 'i' } },
        { Page_Routes: { $regex: q, $options: 'i' } },
        { Page_content: { $regex: q, $options: 'i' } }
      ]
    };

    const results = await GlobalSearch.find(query).sort({ CreateAt: -1 }).limit(50);

    sendSuccess(res, results, 'Global search results retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createGlobalSearch,
  getAllGlobalSearch,
  getGlobalSearchById,
  updateGlobalSearch,
  deleteGlobalSearch,
  searchGlobalContent
};

