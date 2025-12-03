const VendorPayout = require('../models/vendor_payout.model');
const User = require('../models/user.model');
const BankBranchName = require('../models/bank_branch_name.model');
const Event = require('../models/event.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new vendor payout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVendorPayout = asyncHandler(async (req, res) => {
  try {
    // Create vendor payout data
    const vendorPayoutData = {
      ...req.body,
      CreateBy: req.userId,
      CreateAt: new Date()
    };

    // Create vendor payout
    const vendorPayout = await VendorPayout.create(vendorPayoutData);

    sendSuccess(res, vendorPayout, 'Vendor payout created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vendor payouts with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVendorPayouts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, Vendor_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    
    if (status !== undefined && status !== '') {
      filter.Status = status === 'true';
    }

    if (Vendor_id) {
      filter.Vendor_id = parseInt(Vendor_id);
    }

    // Get vendor payouts with pagination
    const [vendorPayouts, total] = await Promise.all([
      VendorPayout.find(filter)
        .sort({ CreateAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VendorPayout.countDocuments(filter)
    ]);

    // Manually populate related fields
    const populatedVendorPayouts = await Promise.all(
      vendorPayouts.map(async (payout) => {
        const payoutObj = payout.toObject();

        // Populate Vendor_id
        if (payout.Vendor_id) {
          try {
            const vendor = await User.findOne({ user_id: payout.Vendor_id });
            payoutObj.vendor_details = vendor ? {
              user_id: vendor.user_id,
              name: vendor.name,
              email: vendor.email,
              mobile: vendor.mobile
            } : null;
          } catch (error) {
            console.log('Error fetching vendor for ID:', payout.Vendor_id);
            payoutObj.vendor_details = null;
          }
        }

        // Populate bank_branch_name_id
        if (payout.bank_branch_name_id) {
          try {
            const bankBranch = await BankBranchName.findOne({ bank_branch_name_id: payout.bank_branch_name_id });
            payoutObj.bank_branch_details = bankBranch || null;
          } catch (error) {
            console.log('Error fetching bank branch for ID:', payout.bank_branch_name_id);
            payoutObj.bank_branch_details = null;
          }
        }

        // Populate Event_Id
        if (payout.Event_Id) {
          try {
            const event = await Event.findOne({ event_id: payout.Event_Id });
            payoutObj.event_details = event ? {
              event_id: event.event_id,
              name_title: event.name_title,
              date: event.date
            } : null;
          } catch (error) {
            console.log('Error fetching event for ID:', payout.Event_Id);
            payoutObj.event_details = null;
          }
        }

        // Populate CreateBy
        if (payout.CreateBy) {
          try {
            const createdByUser = await User.findOne({ user_id: payout.CreateBy });
            payoutObj.created_by_details = createdByUser ? {
              user_id: createdByUser.user_id,
              name: createdByUser.name,
              email: createdByUser.email
            } : null;
          } catch (error) {
            console.log('Error fetching created by user for ID:', payout.CreateBy);
            payoutObj.created_by_details = null;
          }
        }

        // Populate UpdatedBy
        if (payout.UpdatedBy) {
          try {
            const updatedByUser = await User.findOne({ user_id: payout.UpdatedBy });
            payoutObj.updated_by_details = updatedByUser ? {
              user_id: updatedByUser.user_id,
              name: updatedByUser.name,
              email: updatedByUser.email
            } : null;
          } catch (error) {
            console.log('Error fetching updated by user for ID:', payout.UpdatedBy);
            payoutObj.updated_by_details = null;
          }
        }

        return payoutObj;
      })
    );

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };

    sendPaginated(res, populatedVendorPayouts, pagination, 'Vendor payouts retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor payout by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorPayoutById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const vendorPayout = await VendorPayout.findOne({ Vendor_Payout_id: parseInt(id) });

    if (!vendorPayout) {
      return sendNotFound(res, 'Vendor payout not found');
    }

    // Convert to plain object for manipulation
    const vendorPayoutObj = vendorPayout.toObject();

    // Populate Vendor_id
    if (vendorPayout.Vendor_id) {
      try {
        const vendor = await User.findOne({ user_id: vendorPayout.Vendor_id });
        vendorPayoutObj.vendor_details = vendor ? {
          user_id: vendor.user_id,
          name: vendor.name,
          email: vendor.email,
          mobile: vendor.mobile
        } : null;
      } catch (error) {
        console.log('Error fetching vendor for ID:', vendorPayout.Vendor_id);
        vendorPayoutObj.vendor_details = null;
      }
    }

    // Populate bank_branch_name_id
    if (vendorPayout.bank_branch_name_id) {
      try {
        const bankBranch = await BankBranchName.findOne({ bank_branch_name_id: vendorPayout.bank_branch_name_id });
        vendorPayoutObj.bank_branch_details = bankBranch || null;
      } catch (error) {
        console.log('Error fetching bank branch for ID:', vendorPayout.bank_branch_name_id);
        vendorPayoutObj.bank_branch_details = null;
      }
    }

    // Populate Event_Id
    if (vendorPayout.Event_Id) {
      try {
        const event = await Event.findOne({ event_id: vendorPayout.Event_Id });
        vendorPayoutObj.event_details = event ? {
          event_id: event.event_id,
          name_title: event.name_title,
          date: event.date
        } : null;
      } catch (error) {
        console.log('Error fetching event for ID:', vendorPayout.Event_Id);
        vendorPayoutObj.event_details = null;
      }
    }

    // Populate CreateBy
    if (vendorPayout.CreateBy) {
      try {
        const createdByUser = await User.findOne({ user_id: vendorPayout.CreateBy });
        vendorPayoutObj.created_by_details = createdByUser ? {
          user_id: createdByUser.user_id,
          name: createdByUser.name,
          email: createdByUser.email
        } : null;
      } catch (error) {
        console.log('Error fetching created by user for ID:', vendorPayout.CreateBy);
        vendorPayoutObj.created_by_details = null;
      }
    }

    // Populate UpdatedBy
    if (vendorPayout.UpdatedBy) {
      try {
        const updatedByUser = await User.findOne({ user_id: vendorPayout.UpdatedBy });
        vendorPayoutObj.updated_by_details = updatedByUser ? {
          user_id: updatedByUser.user_id,
          name: updatedByUser.name,
          email: updatedByUser.email
        } : null;
      } catch (error) {
        console.log('Error fetching updated by user for ID:', vendorPayout.UpdatedBy);
        vendorPayoutObj.updated_by_details = null;
      }
    }

    sendSuccess(res, vendorPayoutObj, 'Vendor payout retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vendor payout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVendorPayout = asyncHandler(async (req, res) => {
  try {
    const { Vendor_Payout_id } = req.body;

    if (!Vendor_Payout_id) {
      return sendError(res, 'Vendor_Payout_id is required', 400);
    }

    // Add updatedBy and updatedAt to request body
    req.body.UpdatedBy = req.userId;
    req.body.UpdatedAt = new Date();

    const vendorPayout = await VendorPayout.findOneAndUpdate(
      { Vendor_Payout_id: parseInt(Vendor_Payout_id) },
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendorPayout) {
      return sendNotFound(res, 'Vendor payout not found');
    }

    sendSuccess(res, vendorPayout, 'Vendor payout updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vendor payouts by authenticated vendor
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVendorPayoutsByAuth = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object - only show payouts for the authenticated vendor
    const filter = {
      Vendor_id: req.userId
    };
    
    if (status !== undefined && status !== '') {
      filter.Status = status === 'true';
    }

    // Get vendor payouts with pagination
    const [vendorPayouts, total] = await Promise.all([
      VendorPayout.find(filter)
        .sort({ CreateAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VendorPayout.countDocuments(filter)
    ]);

    // Manually populate related fields
    const populatedVendorPayouts = await Promise.all(
      vendorPayouts.map(async (payout) => {
        const payoutObj = payout.toObject();

        // Populate Vendor_id
        if (payout.Vendor_id) {
          try {
            const vendor = await User.findOne({ user_id: payout.Vendor_id });
            payoutObj.vendor_details = vendor ? {
              user_id: vendor.user_id,
              name: vendor.name,
              email: vendor.email,
              mobile: vendor.mobile
            } : null;
          } catch (error) {
            console.log('Error fetching vendor for ID:', payout.Vendor_id);
            payoutObj.vendor_details = null;
          }
        }

        // Populate bank_branch_name_id
        if (payout.bank_branch_name_id) {
          try {
            const bankBranch = await BankBranchName.findOne({ bank_branch_name_id: payout.bank_branch_name_id });
            payoutObj.bank_branch_details = bankBranch || null;
          } catch (error) {
            console.log('Error fetching bank branch for ID:', payout.bank_branch_name_id);
            payoutObj.bank_branch_details = null;
          }
        }

        // Populate Event_Id
        if (payout.Event_Id) {
          try {
            const event = await Event.findOne({ event_id: payout.Event_Id });
            payoutObj.event_details = event ? {
              event_id: event.event_id,
              name_title: event.name_title,
              date: event.date
            } : null;
          } catch (error) {
            console.log('Error fetching event for ID:', payout.Event_Id);
            payoutObj.event_details = null;
          }
        }

        // Populate CreateBy
        if (payout.CreateBy) {
          try {
            const createdByUser = await User.findOne({ user_id: payout.CreateBy });
            payoutObj.created_by_details = createdByUser ? {
              user_id: createdByUser.user_id,
              name: createdByUser.name,
              email: createdByUser.email
            } : null;
          } catch (error) {
            console.log('Error fetching created by user for ID:', payout.CreateBy);
            payoutObj.created_by_details = null;
          }
        }

        // Populate UpdatedBy
        if (payout.UpdatedBy) {
          try {
            const updatedByUser = await User.findOne({ user_id: payout.UpdatedBy });
            payoutObj.updated_by_details = updatedByUser ? {
              user_id: updatedByUser.user_id,
              name: updatedByUser.name,
              email: updatedByUser.email
            } : null;
          } catch (error) {
            console.log('Error fetching updated by user for ID:', payout.UpdatedBy);
            payoutObj.updated_by_details = null;
          }
        }

        return payoutObj;
      })
    );

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrevPage: parseInt(page) > 1
    };

    sendPaginated(res, populatedVendorPayouts, pagination, 'Vendor payouts retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vendor payout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVendorPayout = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const vendorPayout = await VendorPayout.findOneAndDelete({ Vendor_Payout_id: parseInt(id) });

    if (!vendorPayout) {
      return sendNotFound(res, 'Vendor payout not found');
    }

    sendSuccess(res, null, 'Vendor payout deleted successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVendorPayout,
  getAllVendorPayouts,
  getVendorPayoutById,
  getVendorPayoutsByAuth,
  updateVendorPayout,
  deleteVendorPayout
};

