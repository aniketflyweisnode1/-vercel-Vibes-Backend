const StaffEventBook = require('../models/staff_event_book.model');
const { sendSuccess, sendError, sendNotFound } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new staff event booking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStaffEventBook = asyncHandler(async (req, res) => {
  try {
    const staffEventBookData = {
      ...req.body,
      created_by: req.userId
    };

    const staffEventBook = await StaffEventBook.create(staffEventBookData);
    sendSuccess(res, staffEventBook, 'Staff event booking created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all staff event bookings (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStaffEventBooks = asyncHandler(async (req, res) => {
  try {
    const staffEventBooks = await StaffEventBook.find()
      .sort({ created_at: -1 });

    sendSuccess(res, staffEventBooks, 'Staff event bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff event booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffEventBookById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffEventBook = await StaffEventBook.findOne({ staff_event_book_id: parseInt(id) });

    if (!staffEventBook) {
      return sendNotFound(res, 'Staff event booking not found');
    }
    sendSuccess(res, staffEventBook, 'Staff event booking retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff event bookings by authenticated user (simple - no pagination, search, or filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffEventBooksByAuth = asyncHandler(async (req, res) => {
  try {
    const staffEventBooks = await StaffEventBook.find({ created_by: req.userId })
      .sort({ created_at: -1 });

    sendSuccess(res, staffEventBooks, 'Staff event bookings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update staff event booking by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStaffEventBook = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const staffEventBook = await StaffEventBook.findOneAndUpdate(
      { staff_event_book_id: parseInt(id) },
      updateData,
      { 
        new: true, 
        runValidators: true
      }
    );

    if (!staffEventBook) {
      return sendNotFound(res, 'Staff event booking not found');
    }
    sendSuccess(res, staffEventBook, 'Staff event booking updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete staff event booking by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStaffEventBook = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffEventBook = await StaffEventBook.findOneAndUpdate(
      { staff_event_book_id: parseInt(id) },
      { 
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!staffEventBook) {
      return sendNotFound(res, 'Staff event booking not found');
    }
    sendSuccess(res, staffEventBook, 'Staff event booking deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createStaffEventBook,
  getAllStaffEventBooks,
  getStaffEventBookById,
  getStaffEventBooksByAuth,
  updateStaffEventBook,
  deleteStaffEventBook
};

