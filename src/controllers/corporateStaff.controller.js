const StaffWorkingPrice = require('../models/staff_working_price.model');
const User = require('../models/user.model');
const StaffCategory = require('../models/staff_category.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Field mapping between User and StaffWorkingPrice models
 */
const FIELD_MAPPING = {
  // StaffWorkingPrice fields
  staffWorkingPrice: {
    primary: 'staff_working_price_id',
    staff: 'staff_id',
    category: 'staff_category_id',
    price: 'price',
    reviews: 'review_count',
    status: 'status',
    createdBy: 'created_by',
    createdAt: 'created_at',
    updatedBy: 'updated_by',
    updatedAt: 'updated_at'
  },

  // User fields (mapped to staff_info)
  user: {
    // Basic fields
    id: 'user_id',
    name: 'name',
    email: 'email',
    mobile: 'mobile',
    image: 'user_img',
    gender: 'gender',
    address: 'address',
    postalCode: 'postal_code',
    onlineStatus: 'online_status',
    status: 'status',

    // Location fields
    country: 'country_id',
    state: 'state_id',
    city: 'city_id',

    // Business fields
    businessName: 'business_name',
    businessCategory: 'business_category_id',
    businessType: 'business_type_id',
    businessDescription: 'business_description',
    businessAddress: 'business_address',
    businessWebsite: 'business_website',
    businessRegNo: 'business_reg_no',
    whatsapp: 'whatsapp_no',

    // Banking fields
    bankAccountHolder: 'bank_account_holder_name',
    bankAccountNo: 'bank_account_no',
    bankName: 'bank_name_id',
    bankBranch: 'bank_branch_id',

    // Document fields
    idProof: 'id_proof_owner_img',
    licenseCertificate: 'licenses_certificate_file',

    // Platform fields
    platformFeeStatus: 'PlatFormFee_status',
    platformFee: 'PlatFormFee',
    transactionId: 'trangaction_id',

    // Timestamps
    createdBy: 'created_by',
    createdOn: 'created_on',
    updatedBy: 'updated_by',
    updatedOn: 'updated_on'
  },

  // StaffCategory fields
  staffCategory: {
    id: 'staff_category_id',
    name: 'name',
    status: 'status',
    createdBy: 'created_by',
    createdAt: 'created_at',
    updatedBy: 'updated_by',
    updatedAt: 'updated_at'
  }
};

/**
 * Helper function to map User fields to StaffWorkingPrice response
 * @param {Object} user - User object
 * @returns {Object} Mapped user fields
 */
const mapUserFields = (user) => {
  if (!user) return null;

  return {
    // Basic fields
    [FIELD_MAPPING.user.id]: user.user_id,
    [FIELD_MAPPING.user.name]: user.name,
    [FIELD_MAPPING.user.email]: user.email,
    [FIELD_MAPPING.user.mobile]: user.mobile,
    [FIELD_MAPPING.user.image]: user.user_img,
    [FIELD_MAPPING.user.gender]: user.gender,
    [FIELD_MAPPING.user.address]: user.address,
    [FIELD_MAPPING.user.postalCode]: user.postal_code,
    [FIELD_MAPPING.user.onlineStatus]: user.online_status,
    [FIELD_MAPPING.user.status]: user.status,

    // Location fields
    [FIELD_MAPPING.user.country]: user.country_id,
    [FIELD_MAPPING.user.state]: user.state_id,
    [FIELD_MAPPING.user.city]: user.city_id,

    // Business fields
    [FIELD_MAPPING.user.businessName]: user.business_name,
    [FIELD_MAPPING.user.businessCategory]: user.business_category_id,
    [FIELD_MAPPING.user.businessType]: user.business_type_id,
    [FIELD_MAPPING.user.businessDescription]: user.business_description,
    [FIELD_MAPPING.user.businessAddress]: user.business_address,
    [FIELD_MAPPING.user.businessWebsite]: user.business_website,
    [FIELD_MAPPING.user.businessRegNo]: user.business_reg_no,
    [FIELD_MAPPING.user.whatsapp]: user.whatsapp_no,

    // Banking fields
    [FIELD_MAPPING.user.bankAccountHolder]: user.bank_account_holder_name,
    [FIELD_MAPPING.user.bankAccountNo]: user.bank_account_no,
    [FIELD_MAPPING.user.bankName]: user.bank_name_id,
    [FIELD_MAPPING.user.bankBranch]: user.bank_branch_id,

    // Document fields
    [FIELD_MAPPING.user.idProof]: user.id_proof_owner_img,
    [FIELD_MAPPING.user.licenseCertificate]: user.licenses_certificate_file,

    // Platform fields
    [FIELD_MAPPING.user.platformFeeStatus]: user.PlatFormFee_status,
    [FIELD_MAPPING.user.platformFee]: user.PlatFormFee,
    [FIELD_MAPPING.user.transactionId]: user.trangaction_id,

    // Timestamps
    [FIELD_MAPPING.user.createdBy]: user.created_by,
    [FIELD_MAPPING.user.createdOn]: user.created_on,
    [FIELD_MAPPING.user.updatedBy]: user.updated_by,
    [FIELD_MAPPING.user.updatedOn]: user.updated_on
  };
};

/**
 * Helper function to map StaffCategory fields
 * @param {Object} category - StaffCategory object
 * @returns {Object} Mapped category fields
 */
const mapStaffCategoryFields = (category) => {
  if (!category) return null;

  return {
    [FIELD_MAPPING.staffCategory.id]: category.staff_category_id,
    [FIELD_MAPPING.staffCategory.name]: category.name,
    [FIELD_MAPPING.staffCategory.status]: category.status,
    [FIELD_MAPPING.staffCategory.createdBy]: category.created_by,
    [FIELD_MAPPING.staffCategory.createdAt]: category.created_at,
    [FIELD_MAPPING.staffCategory.updatedBy]: category.updated_by,
    [FIELD_MAPPING.staffCategory.updatedAt]: category.updated_at
  };
};

/**
 * Helper function to populate staff data with user and category information
 * @param {Object} staffData - Staff working price data
 * @returns {Object} Populated staff data
 */
const populateStaffData = async (staffData) => {
  try {
    // Get user information
    const user = await User.findOne({ user_id: staffData.staff_id });

    // Get staff category information
    const staffCategory = await StaffCategory.findOne({ staff_category_id: staffData.staff_category_id });

    // Get created by user information
    const createdByUser = await User.findOne({ user_id: staffData.created_by });

    // Get updated by user information (if exists)
    let updatedByUser = null;
    if (staffData.updated_by) {
      updatedByUser = await User.findOne({ user_id: staffData.updated_by });
    }

    return {
      // StaffWorkingPrice fields (using field mapping)
      [FIELD_MAPPING.staffWorkingPrice.primary]: staffData.staff_working_price_id,
      [FIELD_MAPPING.staffWorkingPrice.staff]: staffData.staff_id,
      [FIELD_MAPPING.staffWorkingPrice.category]: staffData.staff_category_id,
      [FIELD_MAPPING.staffWorkingPrice.price]: staffData.price,
      [FIELD_MAPPING.staffWorkingPrice.reviews]: staffData.review_count,
      [FIELD_MAPPING.staffWorkingPrice.status]: staffData.status,
      [FIELD_MAPPING.staffWorkingPrice.createdBy]: staffData.created_by,
      [FIELD_MAPPING.staffWorkingPrice.createdAt]: staffData.created_at,
      [FIELD_MAPPING.staffWorkingPrice.updatedBy]: staffData.updated_by,
      [FIELD_MAPPING.staffWorkingPrice.updatedAt]: staffData.updated_at,

      // Populated User information using mapping function
      staff_info: mapUserFields(user),

      // Populated Staff Category information using mapping function
      staff_category_info: mapStaffCategoryFields(staffCategory),

      // Populated Created By User information (simplified)
      created_by_info: createdByUser ? {
        [FIELD_MAPPING.user.id]: createdByUser.user_id,
        [FIELD_MAPPING.user.name]: createdByUser.name,
        [FIELD_MAPPING.user.email]: createdByUser.email,
        [FIELD_MAPPING.user.mobile]: createdByUser.mobile,
        [FIELD_MAPPING.user.businessName]: createdByUser.business_name,
        [FIELD_MAPPING.user.image]: createdByUser.user_img
      } : null,

      // Populated Updated By User information (simplified)
      updated_by_info: updatedByUser ? {
        [FIELD_MAPPING.user.id]: updatedByUser.user_id,
        [FIELD_MAPPING.user.name]: updatedByUser.name,
        [FIELD_MAPPING.user.email]: updatedByUser.email,
        [FIELD_MAPPING.user.mobile]: updatedByUser.mobile,
        [FIELD_MAPPING.user.businessName]: updatedByUser.business_name,
        [FIELD_MAPPING.user.image]: updatedByUser.user_img
      } : null
    };
  } catch (error) {
    console.error('Error populating staff data:', error);
    return staffData.toObject();
  }
};

/**
 * Get field mappings for documentation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFieldMappings = asyncHandler(async (req, res) => {
  try {
    const mappings = {
      staffWorkingPrice: {
        description: "StaffWorkingPrice model fields",
        fields: FIELD_MAPPING.staffWorkingPrice,
        total_fields: Object.keys(FIELD_MAPPING.staffWorkingPrice).length
      },
      user: {
        description: "User model fields (mapped to staff_info)",
        fields: FIELD_MAPPING.user,
        total_fields: Object.keys(FIELD_MAPPING.user).length,
        categories: {
          basic: ['id', 'name', 'email', 'mobile', 'image', 'gender', 'address', 'postalCode', 'onlineStatus', 'status'],
          location: ['country', 'state', 'city'],
          business: ['businessName', 'businessCategory', 'businessType', 'businessDescription', 'businessAddress', 'businessWebsite', 'businessRegNo', 'whatsapp'],
          banking: ['bankAccountHolder', 'bankAccountNo', 'bankName', 'bankBranch'],
          documents: ['idProof', 'licenseCertificate'],
          platform: ['platformFeeStatus', 'platformFee', 'transactionId'],
          timestamps: ['createdBy', 'createdOn', 'updatedBy', 'updatedOn']
        }
      },
      staffCategory: {
        description: "StaffCategory model fields",
        fields: FIELD_MAPPING.staffCategory,
        total_fields: Object.keys(FIELD_MAPPING.staffCategory).length
      }
    };

    sendSuccess(res, mappings, 'Field mappings retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Create a new staff working price using user model method
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStaff = asyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const userData = {
      ...req.body,
      Fixed_role_id: req.body.role_id,
      created_by: req.userId || null
    };
    const user = await User.findOne({ user_id: req.userId });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    const createUser = await User.create(userData);
    // console.log(createUser);
    // const staff = await StaffWorkingPrice.create({
    //   staff_id: createUser.user_id,
    //   staff_category_id: req.body.staff_category_id,
    //   price: req.body.price,
    //   review_count: req.body.review_count,
    //   created_by: req.userId
    // });
    // const populatedStaff = await populateStaffData(staff);

    sendSuccess(res, createUser, 'Staff created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all staff with pagination, search, and filters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllStaff = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, staff_category_id, status, sort_by = 'created_at', sort_order = 'desc' } = req.query;

    // Build filter object for User model (role_id = 4 for staff)
    const filter = { role_id: 4, created_by: req.userId };

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // If staff_category_id is provided, get staff_ids that have this category first
    let staffIdsWithCategory = null;
    if (staff_category_id) {
      const categoryId = parseInt(staff_category_id);
      const staffWorkingPrices = await StaffWorkingPrice.find({
        staff_category_id: categoryId,
        status: true
      });
      staffIdsWithCategory = staffWorkingPrices.map(swp => swp.staff_id);

      // If no staff found with this category, return empty result
      if (staffIdsWithCategory.length === 0) {
        const paginationInfo = {
          current_page: parseInt(page),
          total_pages: 0,
          total_items: 0,
          items_per_page: parseInt(limit),
          has_next_page: false,
          has_prev_page: false
        };
        return sendPaginated(res, [], 'Staff retrieved successfully', paginationInfo);
      }

      // Filter by staff_ids that have the category
      filter.user_id = { $in: staffIdsWithCategory };
    }

    // Build sort object
    const sort = {};
    sort[sort_by] = sort_order === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count of staff users
    const total = await User.countDocuments(filter);

    // Get staff users with pagination
    const staffUsers = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-password');

    // Populate staff data with working prices and categories
    const populatedStaffList = await Promise.all(
      staffUsers.map(async (user) => {
        // Get staff working prices for this user
        const staffWorkingPrices = await StaffWorkingPrice.find({
          staff_id: user.user_id,
          status: true
        });

        // Get staff categories for the working prices
        const staffCategories = await Promise.all(
          staffWorkingPrices.map(async (price) => {
            const category = await StaffCategory.findOne({
              staff_category_id: price.staff_category_id
            });
            return {
              ...price.toObject(),
              category_details: category
            };
          })
        );

        // Format response similar to populateStaffData
        return {
          staff_working_price_id: staffWorkingPrices[0]?.staff_working_price_id || null,
          staff_id: user.user_id,
          staff_category_id: staffWorkingPrices[0]?.staff_category_id || null,
          price: staffWorkingPrices[0]?.price || null,
          review_count: staffWorkingPrices[0]?.review_count || 0,
          status: user.status,
          created_by: user.created_by || null,
          created_at: user.created_at || user.createdAt,
          updated_by: user.updated_by || null,
          updated_at: user.updated_at || user.updatedAt,
          staff_info: {
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            user_img: user.user_img,
            gender: user.gender,
            address: user.address,
            postal_code: user.postal_code,
            online_status: user.online_status,
            status: user.status,
            country_id: user.country_id,
            state_id: user.state_id,
            city_id: user.city_id,
            business_name: user.business_name,
            business_category_id: user.business_category_id,
            business_type_id: user.business_type_id,
            business_description: user.business_description,
            business_address: user.business_address,
            business_website: user.business_website
          },
          staff_category: staffCategories[0]?.category_details || null,
          working_prices: staffCategories,
          created_by_info: user.created_by ? await User.findOne({ user_id: user.created_by }).select('user_id name email') : null,
          updated_by_info: user.updated_by ? await User.findOne({ user_id: user.updated_by }).select('user_id name email') : null
        };
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    const paginationInfo = {
      current_page: parseInt(page),
      total_pages: totalPages,
      total_items: total,
      items_per_page: parseInt(limit),
      has_next_page: hasNextPage,
      has_prev_page: hasPrevPage
    };

    sendPaginated(res, populatedStaffList, 'Staff retrieved successfully', paginationInfo);
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await StaffWorkingPrice.findOne({ staff_working_price_id: parseInt(id) });

    if (!staff) {
      return sendNotFound(res, 'Staff not found');
    }

    const populatedStaff = await populateStaffData(staff);
    sendSuccess(res, populatedStaff, 'Staff retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff by category ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffByCategoryId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffList = await StaffWorkingPrice.find({ staff_category_id: parseInt(id) })
      .sort({ created_at: -1 });

    const populatedStaffList = await Promise.all(
      staffList.map(staff => populateStaffData(staff))
    );

    sendSuccess(res, populatedStaffList, 'Staff retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff by user ID (staff_id)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffByUserId = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staffList = await StaffWorkingPrice.find({ staff_id: parseInt(id) })
      .sort({ created_at: -1 });

    const populatedStaffList = await Promise.all(
      staffList.map(staff => populateStaffData(staff))
    );

    sendSuccess(res, populatedStaffList, 'Staff retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update staff by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStaff = asyncHandler(async (req, res) => {
  try {
    const { staff_working_price_id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const staff = await StaffWorkingPrice.findOneAndUpdate(
      { staff_working_price_id: parseInt(staff_working_price_id) },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!staff) {
      return sendNotFound(res, 'Staff not found');
    }

    const populatedStaff = await populateStaffData(staff);
    sendSuccess(res, populatedStaff, 'Staff updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Delete staff by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStaff = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await StaffWorkingPrice.findOneAndUpdate(
      { staff_working_price_id: parseInt(id) },
      {
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!staff) {
      return sendNotFound(res, 'Staff not found');
    }

    const populatedStaff = await populateStaffData(staff);
    sendSuccess(res, populatedStaff, 'Staff deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffStatistics = asyncHandler(async (req, res) => {
  try {
    const totalStaff = await StaffWorkingPrice.countDocuments({ status: true });
    const totalCategories = await StaffCategory.countDocuments({ status: true });
    const totalUsers = await User.countDocuments({ status: true });

    // Get average price
    const avgPriceResult = await StaffWorkingPrice.aggregate([
      { $match: { status: true } },
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);

    const avgPrice = avgPriceResult.length > 0 ? avgPriceResult[0].avgPrice : 0;

    // Get price range
    const priceRange = await StaffWorkingPrice.aggregate([
      { $match: { status: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    // Get staff by category
    const staffByCategory = await StaffWorkingPrice.aggregate([
      { $match: { status: true } },
      {
        $group: {
          _id: '$staff_category_id',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Populate category names
    const populatedStaffByCategory = await Promise.all(
      staffByCategory.map(async (item) => {
        const category = await StaffCategory.findOne({ staff_category_id: item._id });
        return {
          staff_category_id: item._id,
          category_name: category ? category.name : 'Unknown',
          count: item.count,
          avg_price: item.avgPrice
        };
      })
    );

    const statistics = {
      total_staff: totalStaff,
      total_categories: totalCategories,
      total_users: totalUsers,
      average_price: Math.round(avgPrice * 100) / 100,
      price_range: priceRange.length > 0 ? {
        min: priceRange[0].minPrice,
        max: priceRange[0].maxPrice
      } : { min: 0, max: 0 },
      staff_by_category: populatedStaffByCategory
    };

    sendSuccess(res, statistics, 'Staff statistics retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Create staff for user using static method
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStaffForUser = asyncHandler(async (req, res) => {
  try {
    const { user_id, staff_category_id, price, review_count = 0 } = req.body;

    // Use static method to create staff for user
    const staff = await User.createStaffForUser(user_id, staff_category_id, price, review_count, req.userId);
    const populatedStaff = await populateStaffData(staff);

    sendSuccess(res, populatedStaff, 'Staff created for user successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff info for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffInfoForUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ user_id: parseInt(id) });
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    const staffInfo = await user.getStaffInfo();
    sendSuccess(res, staffInfo, 'Staff information retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Check if user is staff
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkUserIsStaff = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ user_id: parseInt(id) });
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    const isStaff = await user.isStaff();
    sendSuccess(res, { user_id: user.user_id, is_staff: isStaff }, 'Staff status checked successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get staff statistics for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStaffStatisticsForUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ user_id: parseInt(id) });
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    const statistics = await user.getStaffStatistics();
    sendSuccess(res, statistics, 'User staff statistics retrieved successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  getStaffByCategoryId,
  getStaffByUserId,
  updateStaff,
  deleteStaff,
  getStaffStatistics,
  createStaffForUser,
  getStaffInfoForUser,
  checkUserIsStaff,
  getStaffStatisticsForUser,
  getFieldMappings
};
