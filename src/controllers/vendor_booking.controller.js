const VendorBooking = require('../models/vendor_booking.model');
const Event = require('../models/event.model');
const Category = require('../models/category.model');
const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const VendorOnboardingPortal = require('../models/vendor_onboarding_portal.model');
const CategoriesFees = require('../models/categories_fees.model');
const VenueDetails = require('../models/venue_details.model');
const Country = require('../models/country.model');
const State = require('../models/state.model');
const City = require('../models/city.model');
const { createPaymentIntent, createCustomer } = require('../../utils/stripe');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

const ALLOWED_VENDOR_BOOKING_STATUS = ['pending', 'confirmed', 'cancelled', 'rescheduled'];

/**
 * Helper function to populate vendor onboarding portal with all IDs
 */
const populateVendorOnboardingPortal = async (portal) => {
  const populatedData = { ...portal.toObject() };

  // Populate Vendor_id (User)
  if (portal.Vendor_id) {
    try {
      const vendor = await User.findOne({ user_id: portal.Vendor_id });
      populatedData.vendor_details = vendor ? {
        user_id: vendor.user_id,
        name: vendor.name,
        email: vendor.email,
        mobile: vendor.mobile,
        role_id: vendor.role_id
      } : null;
    } catch (error) {
      populatedData.vendor_details = null;
    }
  }

  // Populate business_information_id
  if (portal.business_information_id) {
    try {
      const VendorBusinessInformation = require('../models/vendor_business_information.model');
      const businessInfo = await VendorBusinessInformation.findOne({
        business_information_id: portal.business_information_id
      });
      populatedData.business_information_details = businessInfo || null;
    } catch (error) {
      populatedData.business_information_details = null;
    }
  }

  // Populate bank_branch_name_id
  if (portal.bank_branch_name_id) {
    try {
      const BankBranchName = require('../models/bank_branch_name.model');
      const bankBranch = await BankBranchName.findOne({ bank_branch_name_id: portal.bank_branch_name_id });
      populatedData.bank_branch_details = bankBranch || null;
    } catch (error) {
      populatedData.bank_branch_details = null;
    }
  }

  // Populate categories_fees_id
  if (portal.categories_fees_id && Array.isArray(portal.categories_fees_id) && portal.categories_fees_id.length > 0) {
    try {

      const categoriesFees = await CategoriesFees.find({
        categories_fees_id: { $in: portal.categories_fees_id },
        status: true
      });

      // Populate category details for each categories fees
      const populatedCategoriesFees = await Promise.all(
        categoriesFees.map(async (fee) => {
          const feeObj = fee.toObject();
          if (fee.category_id) {
            try {
              const category = await Category.findOne({ category_id: fee.category_id });
              feeObj.category_details = category ? {
                category_id: category.category_id,
                category_name: category.category_name,
                emozi: category.emozi,
                status: category.status
              } : null;
            } catch (error) {
              feeObj.category_details = null;
            }
          }
          return feeObj;
        })
      );

      populatedData.categories_fees_details = populatedCategoriesFees;
    } catch (error) {
      populatedData.categories_fees_details = [];
    }
  } else {
    populatedData.categories_fees_details = [];
  }

  // Populate CreateBy and UpdatedBy
  if (portal.CreateBy) {
    try {
      const createdByUser = await User.findOne({ user_id: portal.CreateBy });
      populatedData.created_by_details = createdByUser ? {
        user_id: createdByUser.user_id,
        name: createdByUser.name,
        email: createdByUser.email
      } : null;
    } catch (error) {
      populatedData.created_by_details = null;
    }
  }

  if (portal.UpdatedBy) {
    try {
      const updatedByUser = await User.findOne({ user_id: portal.UpdatedBy });
      populatedData.updated_by_details = updatedByUser ? {
        user_id: updatedByUser.user_id,
        name: updatedByUser.name,
        email: updatedByUser.email
      } : null;
    } catch (error) {
      populatedData.updated_by_details = null;
    }
  }

  return populatedData;
};

const populateEventDetails = async (eventId) => {
  if (!eventId) {
    return null;
  }

  try {
    const event = await Event.findOne({ event_id: Number(eventId) }).lean();
    if (!event) {
      return null;
    }

    const [venueDetails, country, state, city] = await Promise.all([
      event.venue_details_id
        ? VenueDetails.findOne({ venue_details_id: event.venue_details_id }).lean()
        : Promise.resolve(null),
      event.country_id
        ? Country.findOne({ country_id: event.country_id }).lean()
        : Promise.resolve(null),
      event.state_id
        ? State.findOne({ state_id: event.state_id }).lean()
        : Promise.resolve(null),
      event.city_id
        ? City.findOne({ city_id: event.city_id }).lean()
        : Promise.resolve(null)
    ]);

    return {
      ...event,
      venue_details: venueDetails,
      country_details: country,
      state_details: state,
      city_details: city
    };
  } catch (error) {
    return null;
  }
};

/**
 * Normalize date inputs
 */
const parseDateOrNull = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${fieldName} value`);
  }
  return parsed;
};

/**
 * Create vendor booking
 */
const createVendorBooking = asyncHandler(async (req, res) => {
  try {
    const startDate = parseDateOrNull(req.body.Date_start, 'Date_start');
    if (!startDate) {
      return sendError(res, 'Date_start is required', 400);
    }

    const endDate = parseDateOrNull(req.body.End_date, 'End_date');

    const vendorId = req.body.vendor_id !== undefined && req.body.vendor_id !== null
      ? Number(req.body.vendor_id)
      : null;

    if (!vendorId || Number.isNaN(vendorId)) {
      return sendError(res, 'vendor_id is required and must be a valid number', 400);
    }

    const bookingCategoryIds = Array.isArray(req.body.Vendor_Category_id)
      ? req.body.Vendor_Category_id.map(id => Number(id)).filter(id => !Number.isNaN(id))
      : [];

    if (bookingCategoryIds.length === 0) {
      return sendError(res, 'Vendor_Category_id must include at least one category id', 400);
    }

    // Calculate amount and vendor_amount from vendor categories if vendor_id and categories are provided
    let calculatedBaseAmount = 0; // Base amount (Price from categories)
    let calculatedAmount = 0; // Customer pays: baseAmount + 7% platform fee
    let calculatedVendorAmount = 0; // Vendor receives: baseAmount - 7% platform fee

    const PLATFORM_FEE_PERCENTAGE = 0.07; // 7%

    let vendorPortal = null;
    try {
      vendorPortal = await VendorOnboardingPortal.findOne({
        Vendor_id: Number(vendorId),
        Status: true
      });
    } catch (error) {
      console.error('Error fetching vendor onboarding portal:', error);
    }

    if (!vendorPortal) {
      return sendError(res, `Active vendor onboarding portal not found for vendor_id ${vendorId}`, 404);
    }

    try {
      const populatedPortal = await populateVendorOnboardingPortal(vendorPortal);

      if (!populatedPortal.categories_fees_details || populatedPortal.categories_fees_details.length === 0) {
        return sendError(res, 'Vendor has not configured any categories fees. Please ensure the vendor has set up pricing for selected categories.', 400);
      }

      const missingCategories = [];
      const invalidPricingCategories = [];
      const matchedCategories = [];

      bookingCategoryIds.forEach(categoryId => {
        const matchingFee = populatedPortal.categories_fees_details.find(
          fee => Number(fee.category_id) === Number(categoryId));

        if (!matchingFee) {
          missingCategories.push(categoryId);
        } else {
          const MinFee = Number(matchingFee.MinFee) || 0;
          const price = Number(matchingFee.Price) || 0;

          if (price <= 0) {
            invalidPricingCategories.push({
              category_id: categoryId,
              price: price,
              minFee: MinFee
            });
          } else {
            // Base amount is the Price from category
            calculatedBaseAmount += price;
            matchedCategories.push({
              category_id: categoryId,
              price: price,
              minFee: MinFee
            });
          }
        }
      });

      // Check for manual amounts first - if provided, use them and skip category validation
      const manualAmount = Number(req.body.amount || 0);
      const manualVendorAmount = Number(req.body.vendor_amount || 0);

      if (manualAmount > 0 && manualVendorAmount > 0) {
        // Manual amounts provided - treat manualAmount as total (customer pays)
        // Calculate base amount from total (reverse calculate: total = base + 7% => base = total / 1.07)
        calculatedBaseAmount = manualAmount / (1 + PLATFORM_FEE_PERCENTAGE);
        
        // Customer pays: manualAmount (which includes platform fee)
        calculatedAmount = manualAmount;
        
        // Vendor receives: baseAmount - 7% platform fee
        const vendorPlatformFeeAmount = calculatedBaseAmount * PLATFORM_FEE_PERCENTAGE;
        calculatedVendorAmount = calculatedBaseAmount - vendorPlatformFeeAmount;
      } else {
        // No manual amounts - validate category pricing and calculate with platform fees
        // Log for debugging
        console.log('Pricing calculation summary:', {
          bookingCategoryIds,
          matchedCategories: matchedCategories.length,
          missingCategories: missingCategories.length,
          invalidPricingCategories: invalidPricingCategories.length,
          calculatedBaseAmount,
          calculatedAmount,
          calculatedVendorAmount
        });

        // Build detailed error message if there are issues
        if (missingCategories.length > 0 || invalidPricingCategories.length > 0) {
          const errorMessages = [];

          if (missingCategories.length > 0) {
            errorMessages.push(`Categories not found in vendor pricing: ${missingCategories.join(', ')}`);
          }

          if (invalidPricingCategories.length > 0) {
            const invalidIds = invalidPricingCategories.map(c => c.category_id).join(', ');
            errorMessages.push(`Categories with invalid pricing (Price must be > 0): ${invalidIds}`);
          }

          return sendError(res, `${errorMessages.join('. ')}. Please ensure all selected categories have valid pricing, or provide manual amount and vendor_amount in the request body.`, 400);
        }

        // If no categories matched or all had invalid pricing
        if (calculatedBaseAmount <= 0) {
          return sendError(res, `No valid pricing found for the selected categories (${bookingCategoryIds.join(', ')}). Please ensure all categories have valid pricing (Price > 0), or provide manual amount and vendor_amount in the request body.`, 400);
        }

        // Calculate platform fees
        // Customer pays: baseAmount + 7% platform fee
        const customerPlatformFeeAmount = calculatedBaseAmount * PLATFORM_FEE_PERCENTAGE;
        calculatedAmount = calculatedBaseAmount + customerPlatformFeeAmount;
        
        // Vendor also pays 7% platform fee (deducted from their payment)
        const vendorPlatformFeeAmount = calculatedBaseAmount * PLATFORM_FEE_PERCENTAGE;
        calculatedVendorAmount = calculatedBaseAmount - vendorPlatformFeeAmount;
      }
    } catch (pricingError) {
      console.error('Error calculating pricing from vendor portal:', pricingError);
      return sendError(res, 'Unable to calculate pricing from vendor portal. Please verify vendor pricing configuration.', 500);
    }

    // Use calculated amounts or fallback to manual amounts
    const finalAmount = calculatedAmount > 0 ? calculatedAmount : Number(req.body.amount || 0);
    const finalVendorAmount = calculatedVendorAmount > 0 ? calculatedVendorAmount : Number(req.body.vendor_amount || 0);

    // If using manual amounts, apply platform fee logic
    let finalBaseAmount = calculatedBaseAmount;
    if (finalAmount > 0 && finalVendorAmount > 0 && calculatedBaseAmount <= 0) {
      // Manual amounts provided but no base calculated - reverse calculate base from total
      finalBaseAmount = finalAmount / (1 + PLATFORM_FEE_PERCENTAGE);
      const vendorPlatformFeeAmount = finalBaseAmount * PLATFORM_FEE_PERCENTAGE;
      const recalculatedVendorAmount = finalBaseAmount - vendorPlatformFeeAmount;
      
      // Use recalculated vendor amount if it's different from manual
      if (Math.abs(recalculatedVendorAmount - finalVendorAmount) > 0.01) {
        finalVendorAmount = recalculatedVendorAmount;
      }
    }

    if (finalAmount <= 0 || finalVendorAmount <= 0) {
      const categoryList = bookingCategoryIds.join(', ');
      return sendError(res, `Unable to determine booking pricing for categories: [${categoryList}]. Please ensure: 1) All categories exist in vendor pricing, 2) Each category has Price > 0, OR 3) Provide manual 'amount' and 'vendor_amount' in the request body.`, 400);
    }

    const bookingData = {
      ...req.body,
      user_id: req.body.user_id || req.userId,
      vendor_id: vendorId,
      Date_start: startDate,
      End_date: endDate,
      Start_time: req.body.Start_time === '' ? null : req.body.Start_time || null,
      End_time: req.body.End_time === '' ? null : req.body.End_time || null,
      Vendor_Category_id: bookingCategoryIds,
      amount: finalAmount,
      vendor_amount: finalVendorAmount,
      Status: req.body.Status !== undefined ? req.body.Status : true,
      CreateBy: req.userId,
      CreateAt: new Date(),
      UpdatedBy: null,
      UpdatedAt: new Date()
    };

    bookingData.Year = bookingData.Year || startDate.getFullYear();
    bookingData.Month = bookingData.Month || (startDate.getMonth() + 1);

    const rawStatus = bookingData.vender_booking_status ?? bookingData.vendor_booking_status;
    if (rawStatus !== undefined && rawStatus !== null && rawStatus !== '') {
      const normalizedStatus = String(rawStatus).toLowerCase();
      if (!ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
        return sendError(res, `vender_booking_status must be one of: ${ALLOWED_VENDOR_BOOKING_STATUS.join(', ')}`, 400);
      }
      bookingData.vender_booking_status = normalizedStatus;
    } else {
      bookingData.vender_booking_status = 'pending';
    }
    delete bookingData.vendor_booking_status;

    const booking = await VendorBooking.create(bookingData);
    sendSuccess(res, booking, 'Vendor booking created successfully', 201);
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});

/**
 * Get all vendor bookings
 */
const getAllVendorBookings = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      user_id,
      vendor_id,
      Year,
      Month,
      Date_start,
      End_date,
      Start_time,
      End_time,
      Event_id,
      User_availabil,
      vender_booking_status,
      vendor_booking_status,
      Status
    } = req.query;

    const filter = {};

    if (user_id) {
      filter.user_id = parseInt(user_id, 10);
    }
    if (vendor_id) {
      filter.vendor_id = parseInt(vendor_id, 10);
    }
    if (Year) {
      filter.Year = parseInt(Year, 10);
    }
    if (Month) {
      filter.Month = parseInt(Month, 10);
    }
    if (Date_start) {
      const parsedStart = parseDateOrNull(Date_start, 'Date_start');
      if (parsedStart) {
        filter.Date_start = parsedStart;
      }
    }
    if (End_date) {
      const parsedEnd = parseDateOrNull(End_date, 'End_date');
      if (parsedEnd) {
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
    const statusFilter = vender_booking_status ?? vendor_booking_status;
    if (statusFilter) {
      const normalizedStatus = String(statusFilter).toLowerCase();
      if (ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
        filter.vender_booking_status = normalizedStatus;
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      VendorBooking.find(filter)
        .sort({ Date_start: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      VendorBooking.countDocuments(filter)
    ]);

    const populatedBookings = await Promise.all(bookings.map(async (booking) => {
      const bookingObj = booking.toObject();

      if (booking.user_id) {
        try {
          const user = await User.findOne({ user_id: booking.user_id }).select('user_id name email mobile');
          bookingObj.user_details = user || null;
        } catch (error) {
          bookingObj.user_details = null;
        }
      }

      if (booking.vendor_id) {
        try {
          const vendor = await User.findOne({ user_id: booking.vendor_id }).select('user_id name email mobile role_id');
          bookingObj.vendor_details = vendor || null;
        } catch (error) {
          bookingObj.vendor_details = null;
        }
      }

      bookingObj.event_details = await populateEventDetails(booking.Event_id);

      if (booking.Vendor_Category_id && booking.Vendor_Category_id.length) {
        try {
          const categories = await Category.find({ category_id: { $in: booking.Vendor_Category_id } });
          bookingObj.vendor_category_details = categories;
        } catch (error) {
          bookingObj.vendor_category_details = [];
        }
      }

      if (booking.CreateBy) {
        try {
          const createdByUser = await User.findOne({ user_id: booking.CreateBy }).select('user_id name email');
          bookingObj.created_by_details = createdByUser || null;
        } catch (error) {
          bookingObj.created_by_details = null;
        }
      }

      if (booking.UpdatedBy) {
        try {
          const updatedByUser = await User.findOne({ user_id: booking.UpdatedBy }).select('user_id name email');
          bookingObj.updated_by_details = updatedByUser || null;
        } catch (error) {
          bookingObj.updated_by_details = null;
        }
      }

      // Calculate Cancellation_Charge based on vendor's cancellation charges percentage
      let cancellationCharge = 0;
      if (booking.vendor_id && booking.amount) {
        try {
          const vendorPortal = await VendorOnboardingPortal.findOne({
            Vendor_id: booking.vendor_id,
            Status: true
          });

          if (vendorPortal && vendorPortal.CancellationCharges) {
            const cancellationChargesPercentage = Number(vendorPortal.CancellationCharges) || 0;
            cancellationCharge = Math.round((booking.amount * cancellationChargesPercentage) / 100 * 100) / 100;
          }
        } catch (error) {
          // If error occurs, cancellationCharge remains 0
          cancellationCharge = 0;
        }
      }
      bookingObj.Cancellation_Charge = cancellationCharge;

      return bookingObj;
    }));

    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };

    sendPaginated(res, populatedBookings, pagination, 'Vendor bookings retrieved successfully');
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});

/**
 * Get vendor booking by ID
 */
const getVendorBookingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await VendorBooking.findOne({
      Vendor_Booking_id: parseInt(id, 10)
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    const bookingObj = booking.toObject();

    if (booking.user_id) {
      const user = await User.findOne({ user_id: booking.user_id }).select('user_id name email mobile');
      bookingObj.user_details = user || null;
    }

    if (booking.vendor_id) {
      const vendor = await User.findOne({ user_id: booking.vendor_id }).select('user_id name email mobile role_id');
      bookingObj.vendor_details = vendor || null;
    }

    bookingObj.event_details = await populateEventDetails(booking.Event_id);

    if (booking.Vendor_Category_id && booking.Vendor_Category_id.length) {
      const categories = await Category.find({ category_id: { $in: booking.Vendor_Category_id } });
      bookingObj.vendor_category_details = categories;
    }

    if (booking.CreateBy) {
      const createdByUser = await User.findOne({ user_id: booking.CreateBy }).select('user_id name email');
      bookingObj.created_by_details = createdByUser || null;
    }

    if (booking.UpdatedBy) {
      const updatedByUser = await User.findOne({ user_id: booking.UpdatedBy }).select('user_id name email');
      bookingObj.updated_by_details = updatedByUser || null;
    }

    sendSuccess(res, bookingObj, 'Vendor booking retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor booking
 */
const updateVendorBooking = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Booking_id, ...updateBody } = req.body;

    const booking = await VendorBooking.findOne({
      Vendor_Booking_id: parseInt(Vendor_Booking_id, 10)
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    const updateData = {
      ...updateBody,
      UpdatedBy: req.userId,
      UpdatedAt: new Date()
    };

    if (updateData.Date_start !== undefined) {
      updateData.Date_start = parseDateOrNull(updateData.Date_start, 'Date_start');
    }

    if (updateData.End_date !== undefined) {
      updateData.End_date = parseDateOrNull(updateData.End_date, 'End_date');
    }

    if (updateData.Start_time !== undefined && updateData.Start_time === '') {
      updateData.Start_time = null;
    }
    if (updateData.End_time !== undefined && updateData.End_time === '') {
      updateData.End_time = null;
    }

    if (updateData.Vendor_Category_id !== undefined && !Array.isArray(updateData.Vendor_Category_id)) {
      updateData.Vendor_Category_id = [];
    }

    if (updateData.Date_start) {
      updateData.Year = updateData.Year || updateData.Date_start.getFullYear();
      updateData.Month = updateData.Month || (updateData.Date_start.getMonth() + 1);
    }

    if (Object.prototype.hasOwnProperty.call(updateData, 'vender_booking_status') || Object.prototype.hasOwnProperty.call(updateData, 'vendor_booking_status')) {
      const rawStatus = updateData.vender_booking_status ?? updateData.vendor_booking_status;
      if (rawStatus === null || rawStatus === '' || rawStatus === undefined) {
        delete updateData.vender_booking_status;
      } else {
        const normalizedStatus = String(rawStatus).toLowerCase();
        if (!ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
          return sendError(res, `vender_booking_status must be one of: ${ALLOWED_VENDOR_BOOKING_STATUS.join(', ')}`, 400);
        }
        updateData.vender_booking_status = normalizedStatus;
      }
      delete updateData.vendor_booking_status;
    }

    const updatedBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(Vendor_Booking_id, 10) },
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedBooking, 'Vendor booking updated successfully');
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});

/**
 * Delete vendor booking (soft delete)
 */
const deleteVendorBooking = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await VendorBooking.findOne({
      Vendor_Booking_id: parseInt(id, 10)
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found');
    }

    const deletedBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(id, 10) },
      {
        Status: false,
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    sendSuccess(res, deletedBooking, 'Vendor booking deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor bookings for authenticated user
 */
const getVendorBookingsByAuth = asyncHandler(async (req, res) => {
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
      vender_booking_status,
      vendor_booking_status,
      Status
    } = req.query;

    const filter = {
      vendor_id: req.userId,
      Status: true
    };

    if (Date_start) {
      const parsedStart = parseDateOrNull(Date_start, 'Date_start');
      if (parsedStart) {
        filter.Date_start = parsedStart;
      }
    }
    if (End_date) {
      const parsedEnd = parseDateOrNull(End_date, 'End_date');
      if (parsedEnd) {
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
    const statusFilter = vender_booking_status ?? vendor_booking_status;
    if (statusFilter) {
      const normalizedStatus = String(statusFilter).toLowerCase();
      if (ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
        filter.vender_booking_status = normalizedStatus;
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      VendorBooking.find(filter)
        .sort({ Date_start: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      VendorBooking.countDocuments(filter)
    ]);

    const populatedBookings = await Promise.all(bookings.map(async (booking) => {
      const bookingObj = booking.toObject();

      if (booking.user_id) {
        try {
          const user = await User.findOne({ user_id: booking.user_id }).select('user_id name email mobile');
          bookingObj.user_details = user || null;
        } catch (error) {
          bookingObj.user_details = null;
        }
      }

      if (booking.vendor_id) {
        try {
          const vendor = await User.findOne({ user_id: booking.vendor_id }).select('user_id name email mobile role_id');
          bookingObj.vendor_details = vendor || null;
        } catch (error) {
          bookingObj.vendor_details = null;
        }
      }

      bookingObj.event_details = await populateEventDetails(booking.Event_id);

      if (booking.Vendor_Category_id && booking.Vendor_Category_id.length) {
        try {
          const categories = await Category.find({ category_id: { $in: booking.Vendor_Category_id } });
          bookingObj.vendor_category_details = categories;
        } catch (error) {
          bookingObj.vendor_category_details = [];
        }
      }

      if (booking.CreateBy) {
        try {
          const createdByUser = await User.findOne({ user_id: booking.CreateBy }).select('user_id name email');
          bookingObj.created_by_details = createdByUser || null;
        } catch (error) {
          bookingObj.created_by_details = null;
        }
      }

      if (booking.UpdatedBy) {
        try {
          const updatedByUser = await User.findOne({ user_id: booking.UpdatedBy }).select('user_id name email');
          bookingObj.updated_by_details = updatedByUser || null;
        } catch (error) {
          bookingObj.updated_by_details = null;
        }
      }

      // Calculate Cancellation_Charge based on vendor's cancellation charges percentage
      let cancellationCharge = 0;
      if (booking.vendor_id && booking.amount) {
        try {
          const vendorPortal = await VendorOnboardingPortal.findOne({
            Vendor_id: booking.vendor_id,
            Status: true
          });

          if (vendorPortal && vendorPortal.CancellationCharges) {
            const cancellationChargesPercentage = Number(vendorPortal.CancellationCharges) || 0;
            cancellationCharge = Math.round((booking.amount * cancellationChargesPercentage) / 100 * 100) / 100;
          }
        } catch (error) {
          // If error occurs, cancellationCharge remains 0
          cancellationCharge = 0;
        }
      }
      bookingObj.Cancellation_Charge = cancellationCharge;

      return bookingObj;
    }));

    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };

    sendPaginated(res, populatedBookings, pagination, 'Vendor bookings retrieved successfully for authenticated user');
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});

const getVendorBookingsByUserId = asyncHandler(async (req, res) => {
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
      vender_booking_status,
      vendor_booking_status,
      Status
    } = req.query;

    const filter = {
      user_id: req.userId,
      Status: true
    };

    if (Date_start) {
      const parsedStart = parseDateOrNull(Date_start, 'Date_start');
      if (parsedStart) {
        filter.Date_start = parsedStart;
      }
    }
    if (End_date) {
      const parsedEnd = parseDateOrNull(End_date, 'End_date');
      if (parsedEnd) {
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
    const statusFilter = vender_booking_status ?? vendor_booking_status;
    if (statusFilter) {
      const normalizedStatus = String(statusFilter).toLowerCase();
      if (ALLOWED_VENDOR_BOOKING_STATUS.includes(normalizedStatus)) {
        filter.vender_booking_status = normalizedStatus;
      }
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      VendorBooking.find(filter)
        .sort({ Date_start: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      VendorBooking.countDocuments(filter)
    ]);

    const populatedBookings = await Promise.all(bookings.map(async (booking) => {
      const bookingObj = booking.toObject();

      if (booking.user_id) {
        try {
          const user = await User.findOne({ user_id: booking.user_id }).select('user_id name email mobile');
          bookingObj.user_details = user || null;
        } catch (error) {
          bookingObj.user_details = null;
        }
      }

      if (booking.vendor_id) {
        try {
          const vendor = await User.findOne({ user_id: booking.vendor_id }).select('user_id name email mobile role_id');
          bookingObj.vendor_details = vendor || null;
        } catch (error) {
          bookingObj.vendor_details = null;
        }
      }

      bookingObj.event_details = await populateEventDetails(booking.Event_id);

      if (booking.Vendor_Category_id && booking.Vendor_Category_id.length) {
        try {
          const categories = await Category.find({ category_id: { $in: booking.Vendor_Category_id } });
          bookingObj.vendor_category_details = categories;
        } catch (error) {
          bookingObj.vendor_category_details = [];
        }
      }

      if (booking.CreateBy) {
        try {
          const createdByUser = await User.findOne({ user_id: booking.CreateBy }).select('user_id name email');
          bookingObj.created_by_details = createdByUser || null;
        } catch (error) {
          bookingObj.created_by_details = null;
        }
      }

      if (booking.UpdatedBy) {
        try {
          const updatedByUser = await User.findOne({ user_id: booking.UpdatedBy }).select('user_id name email');
          bookingObj.updated_by_details = updatedByUser || null;
        } catch (error) {
          bookingObj.updated_by_details = null;
        }
      }

      // Calculate Cancellation_Charge based on vendor's cancellation charges percentage
      let cancellationCharge = 0;
      if (booking.vendor_id && booking.amount) {
        try {
          const vendorPortal = await VendorOnboardingPortal.findOne({
            Vendor_id: booking.vendor_id,
            Status: true
          });

          if (vendorPortal && vendorPortal.CancellationCharges) {
            const cancellationChargesPercentage = Number(vendorPortal.CancellationCharges) || 0;
            cancellationCharge = Math.round((booking.amount * cancellationChargesPercentage) / 100 * 100) / 100;
          }
        } catch (error) {
          // If error occurs, cancellationCharge remains 0
          cancellationCharge = 0;
        }
      }
      bookingObj.Cancellation_Charge = cancellationCharge;

      return bookingObj;
    }));

    const pagination = {
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit, 10),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    };

    sendPaginated(res, populatedBookings, pagination, 'Vendor bookings retrieved successfully for authenticated user');
  } catch (error) {
    if (error.message.startsWith('Invalid')) {
      return sendError(res, error.message, 400);
    }
    throw error;
  }
});


/**
 * Vendor booking payment function
 * Gets vendor onboarding portal, matches categories, calculates amounts, and creates transaction
 */
const VendorBookingPayment = asyncHandler(async (req, res) => {
  try {
    const {
      vendor_booking_id,
      payment_method_id,
      billingDetails
    } = req.body;

    if (!vendor_booking_id || !payment_method_id) {
      return sendError(res, 'vendor_booking_id and payment_method_id are required', 400);
    }

    // Step 1: Get vendor booking
    const booking = await VendorBooking.findOne({
      Vendor_Booking_id: parseInt(vendor_booking_id, 10),
      Status: true
    });

    if (!booking) {
      return sendNotFound(res, 'Vendor booking not found or inactive');
    }

    // Step 2: Get vendor onboarding portal using vendor_id from booking
    const vendorId = booking.vendor_id;
    if (!vendorId) {
      return sendError(res, 'Vendor ID is missing from booking', 400);
    }
    const vendorPortal = await VendorOnboardingPortal.findOne({
      Vendor_id: Number(vendorId),
      Status: true
    });

    if (!vendorPortal) {
      return sendError(res, `Vendor onboarding portal not found for vendor ID: ${vendorId}`, 404);
    }

    // Step 3: Populate all IDs in vendor onboarding portal
    const populatedPortal = await populateVendorOnboardingPortal(vendorPortal);

    // Step 4: Get categories fees from portal
    if (!populatedPortal.categories_fees_details || populatedPortal.categories_fees_details.length === 0) {
      return sendError(res, 'Vendor has not configured any categories fees. Please ensure the vendor has set up categories with pricing.', 400);
    }

    // Step 5: Match vendor_booking.Vendor_Category_id with categories_fees.category_id
    const bookingCategoryIds = booking.Vendor_Category_id.map(id => Number(id));
    let baseAmount = 0; // Base amount before platform fee (sum of Price from categories)

    const matchedCategories = [];
    const missingCategories = [];

    bookingCategoryIds.forEach(categoryId => {
      // Find matching categories fees

      const matchingFee = populatedPortal.categories_fees_details.find(
        fee => Number(fee.category_id) === Number(categoryId) && fee.status === true
      );


      if (matchingFee) {
        const MinFee = Number(matchingFee.MinFee) || 0;
        const price = Number(matchingFee.Price) || 0;

        // Calculate amounts
        const categoryBaseAmount = price; // base amount for this category

        baseAmount += categoryBaseAmount;

        matchedCategories.push({
          category_id: categoryId,
          price: price,
          minFee: MinFee,
          base_amount: categoryBaseAmount
        });
      } else {
        missingCategories.push(categoryId);
      }
    });

    if (missingCategories.length > 0) {
      return sendError(res, `Categories not found in vendor pricing: ${missingCategories.join(', ')}. Please ensure the vendor has set pricing for all selected categories.`, 400);
    }

    if (baseAmount <= 0) {
      return sendError(res, 'Invalid pricing calculation. Amount must be greater than 0.', 400);
    }

    // Step 5.5: Calculate 7% platform fee and total amount
    const PLATFORM_FEE_PERCENTAGE = 0.07; // 7%
    
    // Customer pays: baseAmount + 7% platform fee
    const customerPlatformFeeAmount = baseAmount * PLATFORM_FEE_PERCENTAGE;
    const totalAmount = baseAmount + customerPlatformFeeAmount; // Customer pays: base + 7% platform fee
    
    // Vendor also pays 7% platform fee (deducted from their payment)
    const vendorPlatformFeeAmount = baseAmount * PLATFORM_FEE_PERCENTAGE;
    const vendorAmount = baseAmount - vendorPlatformFeeAmount; // Vendor receives: baseAmount - 7% platform fee
    
    // Total platform fee to admin: from customer + from vendor
    const totalPlatformFeeAmount = customerPlatformFeeAmount + vendorPlatformFeeAmount;

    // Step 6: Get user information for Stripe customer creation
    const user = await User.findOne({ user_id: req.userId });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Step 7: Create or get Stripe customer
    let customerId = null;
    try {
      const customerData = {
        email: user.email,
        name: user.name,
        phone: user.mobile,
        metadata: {
          user_id: req.userId,
          payment_type: 'vendor_booking'
        }
      };

      const customer = await createCustomer(customerData);
      customerId = customer.customerId;
    } catch (customerError) {
      console.error('Customer creation error:', customerError);
      // Continue without customer if creation fails
    }

    // Step 8: Create Stripe payment intent
    let paymentIntent = null;
    try {
      const paymentOptions = {
        amount: Math.round(totalAmount),
        billingDetails: billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          customer_id: customerId,
          payment_type: 'vendor_booking',
          vendor_booking_id: parseInt(vendor_booking_id, 10),
          vendor_id: vendorId,
          description: 'Vendor booking payment'
        }
      };

      paymentIntent = await createPaymentIntent(paymentOptions);
    } catch (paymentError) {
      console.error('Payment intent creation error:', paymentError);
      return sendError(res, `Payment intent creation failed: ${paymentError.message}`, 400);
    }

    // Step 9: Update VendorBooking with amount, vendor_amount, and status
    // Vendor receives full payment (totalAmount), admin receives only platform fee
    const updatedBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(vendor_booking_id, 10) },
      {
        amount: totalAmount,
        vendor_amount: vendorAmount, // Vendor receives baseAmount only
        amount_status: 'confirmed',
        vendor_amount_status: 'confirmed',
        vender_booking_status: 'confirmed',
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    // Step 10: Create transaction for customer (customer pays totalAmount)
    const transactionData = {
      user_id: req.userId,
      amount: totalAmount,
      status: paymentIntent.status,
      payment_method_id: parseInt(payment_method_id, 10),
      transactionType: 'VendorBooking',
      vendor_booking_id: parseInt(vendor_booking_id, 10),
      transaction_date: new Date(),
      reference_number: paymentIntent.paymentIntentId,
      metadata: JSON.stringify({
        payment_intent_id: paymentIntent.paymentIntentId, // For Stripe refunds
        stripe_payment_intent_id: paymentIntent.paymentIntentId,
        stripe_client_secret: paymentIntent.clientSecret,
        customer_id: customerId,
        vendor_booking_id: parseInt(vendor_booking_id, 10),
        vendor_id: vendorId,
        vendor_amount: vendorAmount, // Vendor receives: baseAmount - 7% platform fee
        base_amount: baseAmount,
        customer_platform_fee: customerPlatformFeeAmount,
        vendor_platform_fee: vendorPlatformFeeAmount,
        total_platform_fee: totalPlatformFeeAmount,
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        total_amount: totalAmount,
        billingDetails: billingDetails || null,
        matched_categories: matchedCategories
      }),
      created_by: req.userId
    };

    const customerTransaction = await Transaction.create(transactionData);

    // Step 10.5: Create vendor transaction - Vendor receives baseAmount minus 7% platform fee
    const vendorUser = await User.findOne({ user_id: vendorId, status: true });
    
    if (vendorUser && vendorAmount > 0) {
      const vendorTransactionData = {
        user_id: vendorId, // Vendor user ID
        amount: vendorAmount, // Vendor receives: baseAmount - 7% platform fee
        status: paymentIntent.status, // Same status as customer transaction
        payment_method_id: parseInt(payment_method_id, 10),
        transactionType: 'VendorBooking',
        vendor_booking_id: parseInt(vendor_booking_id, 10),
        transaction_date: new Date(),
        reference_number: `VENDOR_PAYMENT_${paymentIntent.paymentIntentId}`,
        metadata: JSON.stringify({
          payment_intent_id: paymentIntent.paymentIntentId,
          stripe_payment_intent_id: paymentIntent.paymentIntentId,
          customer_id: customerId,
          vendor_booking_id: parseInt(vendor_booking_id, 10),
          vendor_id: vendorId,
          customer_user_id: req.userId,
          base_amount: baseAmount,
          customer_platform_fee: customerPlatformFeeAmount,
          vendor_platform_fee: vendorPlatformFeeAmount,
          total_platform_fee: totalPlatformFeeAmount,
          platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
          vendor_amount: vendorAmount, // Vendor receives: baseAmount - 7% platform fee
          total_amount: totalAmount,
          customer_transaction_id: customerTransaction.transaction_id,
          description: 'Vendor receives base amount minus 7% platform fee from vendor booking'
        }),
        created_by: req.userId
      };

      await Transaction.create(vendorTransactionData);
    }

    // Step 10.6: Create admin transaction for platform fees
    // Admin receives: 7% from customer + 7% from vendor = total platform fee
    // Find admin user (role_id = 1)
    const adminUser = await User.findOne({ role_id: 1, status: true }).sort({ user_id: 1 });
    
    if (adminUser && totalPlatformFeeAmount > 0) {
      const adminTransactionData = {
        user_id: adminUser.user_id,
        amount: totalPlatformFeeAmount, // Admin receives: platform fee from customer + platform fee from vendor
        status: paymentIntent.status, // Same status as customer transaction
        payment_method_id: parseInt(payment_method_id, 10),
        transactionType: 'VendorBooking',
        vendor_booking_id: parseInt(vendor_booking_id, 10),
        transaction_date: new Date(),
        reference_number: `PLATFORM_FEE_${paymentIntent.paymentIntentId}`,
        metadata: JSON.stringify({
          payment_intent_id: paymentIntent.paymentIntentId,
          stripe_payment_intent_id: paymentIntent.paymentIntentId,
          customer_id: customerId,
          vendor_booking_id: parseInt(vendor_booking_id, 10),
          vendor_id: vendorId,
          customer_user_id: req.userId,
          base_amount: baseAmount,
          customer_platform_fee: customerPlatformFeeAmount,
          vendor_platform_fee: vendorPlatformFeeAmount,
          total_platform_fee: totalPlatformFeeAmount,
          platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
          vendor_amount: vendorAmount, // Vendor receives: baseAmount - 7% platform fee
          total_amount: totalAmount,
          customer_transaction_id: customerTransaction.transaction_id,
          description: 'Platform fee (7% from customer + 7% from vendor) from vendor booking payment - Admin receives total platform fee'
        }),
        created_by: req.userId
      };

      await Transaction.create(adminTransactionData);
    }

    // Step 11: Update booking with transaction_id (customer transaction)
    const finalBooking = await VendorBooking.findOneAndUpdate(
      { Vendor_Booking_id: parseInt(vendor_booking_id, 10) },
      {
        transaction_id: customerTransaction.transaction_id,
        UpdatedBy: req.userId,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    // Populate booking details for response
    const bookingObj = finalBooking.toObject();
    if (updatedBooking.user_id) {
      const bookingUser = await User.findOne({ user_id: updatedBooking.user_id }).select('user_id name email mobile');
      bookingObj.user_details = bookingUser || null;
    }
    if (updatedBooking.vendor_id) {
      const vendor = await User.findOne({ user_id: updatedBooking.vendor_id }).select('user_id name email mobile role_id');
      bookingObj.vendor_details = vendor || null;
    }
    bookingObj.event_details = await populateEventDetails(booking.Event_id);

    sendSuccess(res, {
      customer_transaction_id: customerTransaction.transaction_id,
      vendor_booking: bookingObj,
      payment_breakdown: {
        total_amount: totalAmount, // Customer pays this (baseAmount + 7% platform fee)
        base_amount: baseAmount,
        customer_platform_fee: customerPlatformFeeAmount, // 7% from customer
        vendor_platform_fee: vendorPlatformFeeAmount, // 7% from vendor (deducted from vendor payment)
        total_platform_fee: totalPlatformFeeAmount, // Admin receives this (7% from customer + 7% from vendor)
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        vendor_amount: vendorAmount // Vendor receives: baseAmount - 7% platform fee
      },
      transactions: {
        customer: {
          transaction_id: customerTransaction.transaction_id,
          user_id: req.userId,
          amount: totalAmount,
          description: 'Customer payment for vendor booking (baseAmount + 7% platform fee)'
        },
        vendor: {
          user_id: vendorId,
          amount: vendorAmount, // baseAmount - 7% platform fee
          description: 'Vendor receives base amount minus 7% platform fee'
        },
        admin: {
          user_id: adminUser ? adminUser.user_id : null,
          amount: totalPlatformFeeAmount,
          description: 'Admin receives 7% platform fee from customer + 7% platform fee from vendor'
        }
      },
      matched_categories: matchedCategories,
      vendor_portal: {
        Vendor_Onboarding_Portal_id: populatedPortal.Vendor_Onboarding_Portal_id,
        Vendor_id: populatedPortal.Vendor_id,
        categories_fees_count: populatedPortal.categories_fees_details.length
      },
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      }
    }, 'Vendor booking payment processed successfully. Three transactions created: Customer pays total amount, Vendor receives base amount, Admin receives 7% platform fee.');
  } catch (error) {
    console.error('Vendor booking payment error:', error);
    throw error;
  }
});

module.exports = {
  createVendorBooking,
  getAllVendorBookings,
  getVendorBookingById,
  updateVendorBooking,
  deleteVendorBooking,
  getVendorBookingsByAuth,
  VendorBookingPayment,
  getVendorBookingsByUserId
};

