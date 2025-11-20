const AvailabilityCalender = require('../models/availability_calender.model');
const VendorBooking = require('../models/vendor_booking.model');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new availability calender entry
 */
const createAvailabilityCalender = asyncHandler(async (req, res) => {
  try {
    const dateStartInput = req.body.Date_start;
    const endDateInput = req.body.End_date;

    const parsedDateStart = dateStartInput ? new Date(dateStartInput) : null;
    if (!parsedDateStart || Number.isNaN(parsedDateStart.getTime())) {
      return sendError(res, 'Invalid Date_start value', 400);
    }

    let parsedEndDate = null;
    if (endDateInput !== undefined && endDateInput !== null && endDateInput !== '') {
      parsedEndDate = new Date(endDateInput);
      if (Number.isNaN(parsedEndDate.getTime())) {
        return sendError(res, 'Invalid End_date value', 400);
      }
    }

    const availabilityData = {
      ...req.body,
      user_id: req.body.user_id || req.userId,
      Date_start: parsedDateStart,
      End_date: parsedEndDate,
      Status: req.body.Status !== undefined ? req.body.Status : true,
      CreateBy: req.userId,
      CreateAt: new Date(),
      UpdatedBy: null,
      UpdatedAt: new Date()
    };

    if (availabilityData.Start_time === '') {
      availabilityData.Start_time = null;
    }
    if (availabilityData.End_time === '') {
      availabilityData.End_time = null;
    }

    const availabilityCalender = await AvailabilityCalender.create(availabilityData);
    sendSuccess(res, availabilityCalender, 'Availability calendar created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all availability calendar entries with pagination and filtering
 */
const getAllAvailabilityCalenders = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      user_id,
      Year,
      Month,
      Date_start,
      End_date,
      Start_time,
      End_time,
      Event_id,
      User_availabil,
      Status
    } = req.query;

    const filter = {};

    if (user_id) {
      filter.user_id = parseInt(user_id, 10);
    }
    if (Year) {
      filter.Year = parseInt(Year, 10);
    }
    if (Month) {
      filter.Month = parseInt(Month, 10);
    }
    if (Date_start) {
      const parsedStart = new Date(Date_start);
      if (!Number.isNaN(parsedStart.getTime())) {
        filter.Date_start = parsedStart;
      }
    }
    if (End_date) {
      const parsedEnd = new Date(End_date);
      if (!Number.isNaN(parsedEnd.getTime())) {
        filter.End_date = parsedEnd;
      }
    }
    if (Event_id) {
      filter.Event_id = parseInt(Event_id, 10);
    }
    if (User_availabil) {
      filter.User_availabil = User_availabil;
    }
    if (Start_time) {
      filter.Start_time = Start_time;
    }
    if (End_time) {
      filter.End_time = End_time;
    }
    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    const skip = (page - 1) * limit;

    let [entries, total] = await Promise.all([
      AvailabilityCalender.find(filter)
        .sort({ CreateAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      AvailabilityCalender.countDocuments(filter)
    ]);

    // Fallback: If no availability entries found but user_id provided,
    // derive availability from vendor bookings for that vendor
    if ((!entries || entries.length === 0) && user_id) {
      const vendorFilter = {
        vendor_id: parseInt(user_id, 10),
        Status: true,
        amount: { $gt: 0 }
      };

      const [vendorBookings, vendorTotal] = await Promise.all([
        VendorBooking.find(vendorFilter)
          .sort({ Date_start: -1 })
          .skip(skip)
          .limit(parseInt(limit, 10)),
        VendorBooking.countDocuments(vendorFilter)
      ]);

      if (vendorBookings.length > 0) {
        entries = vendorBookings.map(booking => ({
          Availability_Calender_id: null,
          Year: booking.Year || (booking.Date_start ? new Date(booking.Date_start).getFullYear() : null),
          Month: booking.Month || (booking.Date_start ? new Date(booking.Date_start).getMonth() + 1 : null),
          Date_start: booking.Date_start,
          End_date: booking.End_date || booking.Date_start,
          Start_time: booking.Start_time,
          End_time: booking.End_time,
          Event_id: booking.Event_id || null,
          User_availabil: 'Book',
          user_id: booking.vendor_id,
          Status: true,
          CreateBy: booking.CreateBy,
          CreateAt: booking.CreateAt,
          UpdatedBy: booking.UpdatedBy,
          UpdatedAt: booking.UpdatedAt,
          source: 'vendor_booking',
          Vendor_Booking_id: booking.Vendor_Booking_id,
          booking_status: booking.vender_booking_status,
          booking_amount: booking.amount
        }));
        total = vendorTotal;
      }
    }

    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };

    sendPaginated(res, entries, pagination, 'Availability calendar entries retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get availability calendar entry by ID
 */
const getAvailabilityCalenderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await AvailabilityCalender.findOne({
      Availability_Calender_id: parseInt(id, 10)
    });

    if (!entry) {
      return sendNotFound(res, 'Availability calendar entry not found');
    }

    sendSuccess(res, entry, 'Availability calendar entry retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update availability calendar entry
 */
const updateAvailabilityCalender = asyncHandler(async (req, res) => {
  try {
    const { Availability_Calender_id, ...updateBody } = req.body;

    const entry = await AvailabilityCalender.findOne({
      Availability_Calender_id: parseInt(Availability_Calender_id, 10)
    });

    if (!entry) {
      return sendNotFound(res, 'Availability calendar entry not found');
    }

    const updateData = {
      ...updateBody,
      UpdatedBy: req.userId,
      UpdatedAt: new Date()
    };

    if (updateData.Date_start !== undefined) {
      const parsedStart = new Date(updateData.Date_start);
      if (Number.isNaN(parsedStart.getTime())) {
        return sendError(res, 'Invalid Date_start value', 400);
      }
      updateData.Date_start = parsedStart;
    }

    if (updateData.End_date !== undefined) {
      if (updateData.End_date === null || updateData.End_date === '') {
        updateData.End_date = null;
      } else {
        const parsedEnd = new Date(updateData.End_date);
        if (Number.isNaN(parsedEnd.getTime())) {
          return sendError(res, 'Invalid End_date value', 400);
        }
        updateData.End_date = parsedEnd;
      }
    }

    if (updateData.Start_time !== undefined) {
      if (updateData.Start_time === '') {
        updateData.Start_time = null;
      }
    } else {
      delete updateData.Start_time;
    }

    if (updateData.End_time !== undefined) {
      if (updateData.End_time === '') {
        updateData.End_time = null;
      }
    } else {
      delete updateData.End_time;
    }

    const updatedEntry = await AvailabilityCalender.findOneAndUpdate(
      { Availability_Calender_id: parseInt(Availability_Calender_id, 10) },
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedEntry, 'Availability calendar entry updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete availability calendar entry (soft delete)
 */
const deleteAvailabilityCalender = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await AvailabilityCalender.findOne({
      Availability_Calender_id: parseInt(id, 10)
    });

    if (!entry) {
      return sendNotFound(res, 'Availability calendar entry not found');
    }

    const deletedEntry = await AvailabilityCalender.findOneAndUpdate(
      { Availability_Calender_id: parseInt(id, 10) },
      {
        Status: false,
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    sendSuccess(res, deletedEntry, 'Availability calendar entry deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get availability calendar entries for authenticated user
 */
const getAvailabilityCalendersByAuth = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      Date_start,
      End_date,
      Start_time,
      End_time,
      Event_id,
      User_availabil,
      Status
    } = req.query;

    const filter = {
      user_id: req.userId
    };

    if (Date_start) {
      const parsedStart = new Date(Date_start);
      if (!Number.isNaN(parsedStart.getTime())) {
        filter.Date_start = parsedStart;
      }
    }
    if (End_date) {
      const parsedEnd = new Date(End_date);
      if (!Number.isNaN(parsedEnd.getTime())) {
        filter.End_date = parsedEnd;
      }
    }
    if (Start_time) {
      filter.Start_time = Start_time;
    }
    if (End_time) {
      filter.End_time = End_time;
    }
    if (Event_id) {
      filter.Event_id = parseInt(Event_id, 10);
    }
    if (User_availabil) {
      filter.User_availabil = User_availabil;
    }
    if (Status !== undefined) {
      filter.Status = Status === 'true';
    }

    const skip = (page - 1) * limit;

    const [entries, total] = await Promise.all([
      AvailabilityCalender.find(filter)
        .sort({ Date_start: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      AvailabilityCalender.countDocuments(filter)
    ]);

    const populatedEntries = await Promise.all(entries.map(async (entry) => {
      const entryObj = entry.toObject();

      if (entry.Event_id) {
        try {
          const event = await Event.findOne({ event_id: entry.Event_id });
          entryObj.event_details = event || null;
        } catch (error) {
          entryObj.event_details = null;
        }
      }

      if (entry.user_id) {
        try {
          const user = await User.findOne({ user_id: entry.user_id }).select('user_id name email mobile');
          entryObj.user_details = user || null;
        } catch (error) {
          entryObj.user_details = null;
        }
      }

      if (entry.CreateBy) {
        try {
          const createdByUser = await User.findOne({ user_id: entry.CreateBy }).select('user_id name email');
          entryObj.created_by_details = createdByUser || null;
        } catch (error) {
          entryObj.created_by_details = null;
        }
      }

      if (entry.UpdatedBy) {
        try {
          const updatedByUser = await User.findOne({ user_id: entry.UpdatedBy }).select('user_id name email');
          entryObj.updated_by_details = updatedByUser || null;
        } catch (error) {
          entryObj.updated_by_details = null;
        }
      }

      return entryObj;
    }));

    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };

    sendPaginated(res, populatedEntries, pagination, 'Availability calendar entries retrieved successfully for authenticated user');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createAvailabilityCalender,
  getAllAvailabilityCalenders,
  getAvailabilityCalenderById,
  updateAvailabilityCalender,
  deleteAvailabilityCalender,
  getAvailabilityCalendersByAuth
};

