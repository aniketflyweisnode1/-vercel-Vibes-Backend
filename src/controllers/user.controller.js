const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const Transaction = require('../models/transaction.model');
const StaffWorkingPrice = require('../models/staff_working_price.model');
const StaffCategory = require('../models/staff_category.model');
const StaffEventBook = require('../models/staff_event_book.model');
const Country = require('../models/country.model');
const State = require('../models/state.model');
const City = require('../models/city.model');
const Role = require('../models/role.model');
const BusinessCategory = require('../models/business_category.model');
const BusinessType = require('../models/business_type.model');
const BankName = require('../models/bank_name.model');
const BankBranchName = require('../models/bank_branch_name.model');
const { createWalletForUser } = require('./wallet.controller');
const { createNotificationHendlar } = require('../../utils/notificationHandler');
const { generateTokens } = require('../../utils/jwt');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { generateOTP } = require('../../utils/helpers');
const emailService = require('../../utils/emailService');
const { createPaymentIntent, createCustomer } = require('../../utils/stripe');

const PROFILE_COMPLETION_REQUIREMENTS = [
  'name',
  'email',
  'mobile',
  'address',
  'country_id',
  'state_id',
  'city_id',
  'zip_code',
  'Govt_id_type',
  'ID_Number',
  'bank_account_holder_name',
  'bank_name_id',
  'bank_account_no',
  'bank_branch_id'
];

/**
 * Determine if a profile field has a non-empty value
 * @param {any} value
 * @returns {boolean}
 */
const isProfileFieldFilled = (value) => {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return !Number.isNaN(value) && value > 0;
  }

  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return true;
};

/**
 * Check whether a user's profile meets completion requirements
 * @param {Object} userLike - User document or plain object
 * @returns {boolean}
 */
const evaluateProfileCompletion = (userLike = {}) => {
  return PROFILE_COMPLETION_REQUIREMENTS.every((field) => {
    const value = userLike[field];
    return isProfileFieldFilled(value);
  });
};

/**
 * Ensure the isProfileComplete flag reflects current data
 * @param {import('mongoose').Document|Object} userDoc
 * @param {number|null} actorId
 * @returns {Promise<import('mongoose').Document|null>}
 */
const syncProfileCompletionStatus = async (userDoc, actorId = null) => {
  if (!userDoc) {
    return null;
  }

  const userObj = userDoc.toObject ? userDoc.toObject() : userDoc;
  const userId = userObj.user_id;

  if (!userId) {
    return userDoc;
  }

  const isComplete = evaluateProfileCompletion(userObj);

  if (userObj.isProfileComplete === isComplete) {
    if (userDoc.isProfileComplete !== undefined) {
      userDoc.isProfileComplete = isComplete;
    }
    return userDoc;
  }

  const updatedUser = await User.findOneAndUpdate(
    { user_id: userId },
    {
      isProfileComplete: isComplete,
      updated_by: actorId || userObj.updated_by || null,
      updated_on: new Date()
    },
    {
      new: true,
      runValidators: false,
      select: '-password'
    }
  );

  return updatedUser || userDoc;
};

/**
 * Helper function to populate all referenced IDs with complete data
 * @param {Object} user - User object
 * @returns {Object} User object with populated data
 */
const populateUserReferences = async (user) => {
  const userObj = user.toObject();

  try {
    // Populate all referenced IDs in parallel
    const [
      country,
      state,
      city,
      role,
      fixedRole,
      businessCategory,
      businessType,
      bankName,
      bankBranch,
      createdByUser,
      updatedByUser
    ] = await Promise.all([
      user.country_id ? Country.findOne({ country_id: user.country_id, status: true }) : null,
      user.state_id ? State.findOne({ state_id: user.state_id, status: true }) : null,
      user.city_id ? City.findOne({ city_id: user.city_id, status: true }) : null,
      user.role_id ? Role.findOne({ role_id: user.role_id, status: true }) : null,
      user.Fixed_role_id ? Role.findOne({ role_id: user.Fixed_role_id, status: true }) : null,
      user.business_category_id ? BusinessCategory.findOne({ business_category_id: user.business_category_id, status: true }) : null,
      user.business_type_id ? BusinessType.findOne({ business_type_id: user.business_type_id, status: true }) : null,
      user.bank_name_id ? BankName.findOne({ bank_name_id: user.bank_name_id, status: true }) : null,
      user.bank_branch_id ? BankBranchName.findOne({ bank_branch_name_id: user.bank_branch_id, status: true }) : null,
      user.created_by ? User.findOne({ user_id: user.created_by }).select('name email') : null,
      user.updated_by ? User.findOne({ user_id: user.updated_by }).select('name email') : null
    ]);

    // Add populated data to user object
    userObj.country_details = country;
    userObj.state_details = state;
    userObj.city_details = city;
    userObj.role_details = role;
    userObj.fixed_role_details = fixedRole;
    userObj.business_category_details = businessCategory;
    userObj.business_type_details = businessType;
    userObj.bank_name_details = bankName;
    userObj.bank_branch_details = bankBranch;
    userObj.created_by_user = createdByUser;
    userObj.updated_by_user = updatedByUser;

    return userObj;
  } catch (error) {
    console.error('Error populating user references:', error);
    return userObj; // Return original object if population fails
  }
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createUser = asyncHandler(async (req, res) => {
  try {
    // Create user data
    const userData = {
      ...req.body,
      created_by: req.userId || null
    };

    userData.isProfileComplete = evaluateProfileCompletion(userData);

    // Set Fixed_role_id to the same value as role_id during creation
    if (userData.role_id) {
      userData.Fixed_role_id = userData.role_id;
    }

    // Create user
    const user = await User.create(userData);

    // Create wallet for the user with amount 0
    try {
      await createWalletForUser(user.user_id, req.userId || null);
    } catch (walletError) {
      // Don't fail user creation if wallet creation fails
    }

    // Create notification for user registration
    try {
      if (user.user_id) {
        await createNotificationHendlar(
          user.user_id,
          3, // Notification type ID: 3 = Account/User related
          `Welcome to Mr. Vibes! Your account has been created successfully.`,
          req.userId || user.user_id
        );
      }
    } catch (notificationError) {
      // Log notification error but don't fail the user creation
      console.error('Failed to create user registration notification:', notificationError);
    }

    const syncedUser = await syncProfileCompletionStatus(user, req.userId || null);
    sendSuccess(res, syncedUser || user, 'User created successfully', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all users with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      zip_code,
      Govt_id_type,
      sortBy = 'created_on',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { business_name: { $regex: search, $options: 'i' } },
        { business_description: { $regex: search, $options: 'i' } },
        { business_address: { $regex: search, $options: 'i' } },
        { bank_account_holder_name: { $regex: search, $options: 'i' } },
        { zip_code: { $regex: search, $options: 'i' } },
        { postal_code: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { Authorized_Person_Name: { $regex: search, $options: 'i' } },
        { ID_Number: { $regex: search, $options: 'i' } }
      ];
    }

    // Add zip_code filter
    if (zip_code) {
      filter.zip_code = zip_code;
    }

    // Add Govt_id_type filter
    if (Govt_id_type) {
      filter.Govt_id_type = Govt_id_type;
    }

    // Add status filter


    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
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

    sendPaginated(res, users, pagination, 'Users retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({ user_id: parseInt(id) })
      .select('-password');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params || req.body;

    // Add update metadata
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_on: new Date()
    };

    // Remove Fixed_role_id from update data to prevent it from being changed
    delete updateData.Fixed_role_id;

    const user = await User.findOneAndUpdate(
      { user_id: parseInt(id) },
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Create notification for user update
    try {
      if (user.user_id) {
        await createNotificationHendlar(
          user.user_id,
          3, // Notification type ID: 3 = Account/User related
          `Your account profile has been updated successfully.`,
          req.userId || user.user_id
        );
      }
    } catch (notificationError) {
      console.error('Failed to create user update notification:', notificationError);
    }

    const syncedUser = await syncProfileCompletionStatus(user, req.userId || null);

    sendSuccess(res, syncedUser || user, 'User updated successfully');
  } catch (error) {

    throw error;
  }
});

/**
 * Delete user by ID (soft delete by setting status to false)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndUpdate(
      { user_id: parseInt(id) },
      {
        status: false,
        updated_by: req.userId,
        updated_on: new Date()
      },
      { new: true, select: '-password' }
    );

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    sendSuccess(res, user, 'User deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * User login - Now redirects to OTP flow
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User not found with this email address', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }
    console.log(req.body, "------------------", user.password, password)
    if (user.password != password) {
      return sendError(res, 'Password does not match.', 403);
    }
    // Generate new OTP
    const otpCode = generateOTP();

    // Deactivate any existing OTPs for this email and login type
    await OTP.updateMany(
      {
        email: email.toLowerCase(),
        otp_type: 1, // Login OTP type
        status: true
      },
      {
        status: false,
        updated_at: new Date()
      }
    );

    // Create new OTP
    const otpData = {
      otp: otpCode,
      email: email.toLowerCase(),
      otp_type: 1, // Login OTP type
      status: true,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      created_by: null // No user created this OTP
    };

    const otp = await OTP.create(otpData);

    // Send OTP via email with HTML template
    // const emailSent = await emailService.sendOTPEmail(email, otpCode, user.name || 'User');
    // if (!emailSent) {
    // If email fails, deactivate the OTP
    // await OTP.findOneAndUpdate({ otp_id: otp.otp_id });
    //   return sendError(res, 'Failed to send OTP email. Please try again.', 500);
    // }
    await emailService.sendOTPEmail(email, otpCode, user.name || 'User');
    sendSuccess(res, {
      message: 'OTP sent successfully to your email address. Please verify to complete login.',
      expiresIn: '10 minutes',
      nextStep: 'verify-otp',
      otp: otpCode,
    }, 'OTP sent successfully');
  } catch (error) {

    throw error;
  }
});

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendNotFound(res, 'User not found');
    }
    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    throw error;
  }
});
const getStaffWorkingPrice = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return sendNotFound(res, 'User not found');
    }
    const staffWorkingPrices = await StaffWorkingPrice.find({ staff_id: user.user_id, status: true }).sort({ created_at: -1 });



    sendSuccess(res, staffWorkingPrices, 'Profile retrieved successfully');
  } catch (error) {
    throw error;
  }
});
/**
 * Update current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const targetId = id !== undefined && id !== null ? id : req.userId;
    console.log("530------------------", req.body)
    if (!targetId) {
      return sendError(res, 'User ID is required to update profile', 400);
    }

    const normalizedId = parseInt(targetId, 10);
    if (Number.isNaN(normalizedId)) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_on: new Date()
    };

    // delete updateData.id;

    // Remove password from update data if present (use separate endpoint for password change)
    // delete updateData.password;
    // Remove Fixed_role_id from update data to prevent it from being changed
    // delete updateData.Fixed_role_id;

    const user = await User.findOneAndUpdate(
      { user_id: normalizedId },
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Create notification for profile update
    try {
      if (user.user_id) {
        await createNotificationHendlar(
          user.user_id,
          3, // Notification type ID: 3 = Account/User related
          `Your profile has been updated successfully.`,
          req.userId || user.user_id
        );
      }
    } catch (notificationError) {
      console.error('Failed to create profile update notification:', notificationError);
    }

    const syncedUser = await syncProfileCompletionStatus(user, req.userId || normalizedId);

    sendSuccess(res, syncedUser || user, 'Profile updated successfully');
  } catch (error) {

    throw error;
  }
});

/**
 * Update user by ID with ID in request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateUserByIdBody = asyncHandler(async (req, res) => {
  try {
    const { id, ...updateData } = req.body;

    // Add update metadata
    const finalUpdateData = {
      ...updateData,
      updated_by: req.userId,
      updated_on: new Date()
    };

    // Remove Fixed_role_id from update data to prevent it from being changed
    delete finalUpdateData.Fixed_role_id;

    const user = await User.findOneAndUpdate(
      { user_id: parseInt(id) },
      finalUpdateData,
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    const syncedUser = await syncProfileCompletionStatus(user, req.userId || parseInt(id));

    sendSuccess(res, syncedUser || user, 'User updated successfully');
  } catch (error) {

    throw error;
  }
});

/**
 * Change user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = asyncHandler(async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password
    const user = await User.findById(req.userId).select('+password');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Verify current password (simple string comparison)
    if (user.password !== currentPassword) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    user.updated_by = req.userId;
    user.updated_on = new Date();
    await user.save();

    sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {

    throw error;
  }
});

/**
 * Send OTP for login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendOTP = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User not found with this email address', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Generate new OTP
    const otpCode = generateOTP();

    // Deactivate any existing OTPs for this email and login type
    await OTP.updateMany(
      {
        email: email.toLowerCase(),
        otp_type: 1, // Assuming 1 is login OTP type
        status: true
      },
      {
        status: false,
        updated_at: new Date()
      }
    );

    // Create new OTP
    const otpData = {
      otp: otpCode,
      email: email.toLowerCase(),
      otp_type: 1, // Login OTP type
      status: true,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      created_by: null // No user created this OTP
    };

    const otp = await OTP.create(otpData);

    // Send OTP via email with HTML template
    const emailSent = await emailService.sendOTPEmail(email, otpCode, user.name || 'User');
    if (!emailSent) {
      // If email fails, deactivate the OTP
      await OTP.findOneAndUpdate({ otp_id: otp.otp_id }, { status: false });
      return sendError(res, 'Failed to send OTP email. Please try again.', 500);
    }

    sendSuccess(res, {
      message: 'OTP sent successfully to your email address',
      expiresIn: '10 minutes'
    }, 'OTP sent successfully');
  } catch (error) {

    throw error;
  }
});

/**
 * Verify OTP and login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const verifyOTP = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp: otp,
      otp_type: 1, // Login OTP type
      status: true
    }).sort({ created_at: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return sendError(res, 'Invalid OTP', 400);
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      await OTP.findOneAndUpdate({ otp_id: parseInt(otpRecord.otp_id) }, {
        status: false,
        updated_at: new Date()
      });
      return sendError(res, 'OTP has expired. Please request a new one.', 400);
    }

    // Check if OTP is already used
    if (otpRecord.is_used) {
      return sendError(res, 'OTP has already been used', 400);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Mark OTP as used
    await OTP.findOneAndUpdate({ otp_id: parseInt(otpRecord.otp_id) }, {
      is_used: true,
      updated_at: new Date()
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Remove password from user object
    const userResponse = user.toObject();
    delete userResponse.password;

    sendSuccess(res, {
      user: userResponse,
      ...tokens
    }, 'Login successful');
  } catch (error) {

    throw error;
  }
});

/**
 * Get users by role_id with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsersByRoleId = asyncHandler(async (req, res) => {
  try {
    const { role_id } = req.params;
    const {
      page = 1,
      limit = 10,
      search = '',
      status,
      zip_code,
      Govt_id_type,
      sortBy = 'created_on',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {
      role_id: parseInt(role_id)
    };

    // Add search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { business_name: { $regex: search, $options: 'i' } },
        { business_description: { $regex: search, $options: 'i' } },
        { business_address: { $regex: search, $options: 'i' } },
        { bank_account_holder_name: { $regex: search, $options: 'i' } },
        { zip_code: { $regex: search, $options: 'i' } },
        { postal_code: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { Authorized_Person_Name: { $regex: search, $options: 'i' } },
        { ID_Number: { $regex: search, $options: 'i' } }
      ];
    }

    // Add zip_code filter
    if (zip_code) {
      filter.zip_code = zip_code;
    }

    // Add Govt_id_type filter
    if (Govt_id_type) {
      filter.Govt_id_type = Govt_id_type;
    }

    // Add status filter
    if (status !== undefined) {
      filter.status = status === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password'),
      User.countDocuments(filter)
    ]);

    // Populate all user references with complete data
    const usersWithPopulatedData = await Promise.all(
      users.map(async (user) => {
        // First populate all basic references
        const populatedUser = await populateUserReferences(user);

        // If role_id is 4 (staff), include staff-related details
        if (parseInt(role_id) === 4) {
          // Get staff working prices for this user
          const staffWorkingPrices = await StaffWorkingPrice.find({
            staff_id: user.user_id,
            status: true
          }).sort({ created_at: -1 });

          // Get staff categories for the working prices with full details
          const staffCategories = await Promise.all(
            staffWorkingPrices.map(async (price) => {
              const category = await StaffCategory.findOne({
                staff_category_id: price.staff_category_id,
                status: true
              });
              return {
                ...price.toObject(),
                category_details: category
              };
            })
          );

          // Get recent staff event bookings (last 10)
          const recentBookings = await StaffEventBook.find({
            staff_id: user.user_id,
            status: true
          })
            .sort({ created_at: -1 })
            .limit(10);

          // Add staff details to user object
          populatedUser.staff_details = {
            working_prices: staffCategories,
            recent_bookings: recentBookings,
            total_working_prices: staffWorkingPrices.length,
            total_bookings: await StaffEventBook.countDocuments({
              staff_id: user.user_id,
              status: true
            })
          };
        }

        return populatedUser;
      })
    );

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

    const message = parseInt(role_id) === 4
      ? `Staff users with role ID ${role_id} retrieved successfully with complete details`
      : `Users with role ID ${role_id} retrieved successfully with complete details`;

    sendPaginated(res, usersWithPopulatedData, pagination, message);
  } catch (error) {
    throw error;
  }
});

/**
 * Forgot password - Send OTP to email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'User not found with this email address', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Generate new OTP
    const otpCode = generateOTP();

    // Deactivate any existing OTPs for this email and forgot password type
    await OTP.updateMany(
      {
        email: email.toLowerCase(),
        otp_type: 2, // Forgot password OTP type
        status: true
      },
      {
        status: false,
        updated_at: new Date()
      }
    );

    // Create new OTP
    const otpData = {
      otp: otpCode,
      email: email.toLowerCase(),
      otp_type: 2, // Forgot password OTP type
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      created_by: null // No user created this OTP
    };

    const otp = await OTP.create(otpData);

    // Send OTP via email with HTML template
    const emailSent = await emailService.sendForgotPasswordOTPEmail(email, otpCode, user.name || 'User');
    if (!emailSent) {
      // If email fails, deactivate the OTP
      await OTP.findOneAndUpdate({ otp_id: otp.otp_id }, { status: false });
      return sendError(res, 'Failed to send OTP email. Please try again.', 500);
    }

    sendSuccess(res, {
      message: 'OTP sent successfully to your email address for password reset.',
      expiresIn: '10 minutes',
      nextStep: 'reset-password'
    }, 'OTP sent successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Reset password with OTP verification
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find the OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp: otp,
      otp_type: 2, // Forgot password OTP type
      status: true
    }).sort({ created_at: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return sendError(res, 'Invalid OTP', 400);
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      await OTP.findByIdAndUpdate(otpRecord._id, {
        status: false,
        updated_at: new Date()
      });
      return sendError(res, 'OTP has expired. Please request a new one.', 400);
    }

    // Check if OTP is already used
    if (otpRecord.is_used) {
      return sendError(res, 'OTP has already been used', 400);
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Check if user is active
    if (!user.status) {
      return sendError(res, 'Account is deactivated', 401);
    }

    // Update password
    user.password = newPassword;
    user.updated_by = user.user_id; // User updating their own password
    user.updated_on = new Date();
    await user.save();

    // Mark OTP as used
    await OTP.findByIdAndUpdate(otpRecord._id, {
      is_used: true,
      updated_at: new Date()
    });

    sendSuccess(res, {
      message: 'Password reset successfully'
    }, 'Password reset successful');
  } catch (error) {
    throw error;
  }
});

/**
 * User logout
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logout = asyncHandler(async (req, res) => {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage. However, we can provide
    // a server-side endpoint for logging purposes or to invalidate
    // refresh tokens if needed in the future.

    sendSuccess(res, {
      message: 'Logged out successfully'
    }, 'Logout successful');
  } catch (error) {
    throw error;
  }
});

/**
 * Test sendForgotPasswordOTPEmail function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const testSendForgotPasswordOTPEmail = asyncHandler(async (req, res) => {
  try {
    const { email, otp, userName } = req.body;

    // Validate required fields
    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    // Generate OTP if not provided
    const otpCode = otp || generateOTP();
    const user = userName || 'Test User';

    // Send forgot password OTP email
    const emailSent = await emailService.sendForgotPasswordOTPEmail(email, otpCode, user);

    if (!emailSent) {
      return sendError(res, 'Failed to send forgot password OTP email', 500);
    }

    sendSuccess(res, {
      message: 'Forgot password OTP email sent successfully',
      email: email,
      otp: otpCode, // Include OTP in response for testing purposes
      userName: user
    }, 'Email sent successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Process platform fee payment
 * Creates a transaction with transactionType = "PlatformFee"
 * Updates user's PlatFormFee_status and trangaction_id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const PlatFormFeePayment = asyncHandler(async (req, res) => {
  try {
    const {
      payment_method_id,
      billingDetails,
      amount,
      description = 'Platform fee payment'
    } = req.body;

    // Validate required fields
    if (!payment_method_id || !amount) {
      return sendError(res, 'payment_method_id and amount are required', 400);
    }

    // Get user information for Stripe customer creation
    const user = await User.findOne({ user_id: req.userId });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Create or get Stripe customer
    let customerId = null;
    try {
      const customerData = {
        email: user.email,
        name: user.name,
        phone: user.mobile,
        metadata: {
          user_id: req.userId,
          payment_type: 'platform_fee'
        }
      };

      const customer = await createCustomer(customerData);
      customerId = customer.customerId;
    } catch (customerError) {
      console.error('Customer creation error:', customerError);
      // Continue without customer if creation fails
    }

    // Create Stripe payment intent
    let paymentIntent = null;
    try {
      const paymentOptions = {
        amount: Math.round(amount * 100), // Convert to cents
        billingDetails: billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          customer_id: customerId,
          payment_type: 'platform_fee',
          description: description
        }
      };

      paymentIntent = await createPaymentIntent(paymentOptions);
    } catch (paymentError) {
      console.error('Payment intent creation error:', paymentError);
      return sendError(res, `Payment intent creation failed: ${paymentError.message}`, 400);
    }

    // Create transaction data
    const transactionData = {
      user_id: req.userId,
      amount: amount,
      currency: 'USD',
      status: paymentIntent.status,
      payment_method_id: payment_method_id,
      transactionType: 'PlatformFee',
      transaction_date: new Date(),
      reference_number: paymentIntent.paymentIntentId,
      coupon_code_id: null,
      CGST: 0,
      SGST: 0,
      TotalGST: 0,
      metadata: JSON.stringify({
        stripe_payment_intent_id: paymentIntent.paymentIntentId,
        stripe_client_secret: paymentIntent.clientSecret,
        customer_id: customerId,
        description: description
      }),
      created_by: req.userId
    };

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Update the user with platform fee payment details
    const updatedUser = await User.findOneAndUpdate(
      { user_id: req.userId },
      {
        PlatFormFee_status: transaction.status,
        PlatFormFee: amount.toString(),
        trangaction_id: transaction.transaction_id,
        updated_by: req.userId,
        updated_on: new Date()
      },
      { new: true }
    );

    const syncedUser = await syncProfileCompletionStatus(updatedUser, req.userId || null);
    const userForResponse = syncedUser || updatedUser;

    sendSuccess(res, {
      transaction_id: transaction.transaction_id,
      payment_intent_id: paymentIntent.paymentIntentId,
      client_secret: paymentIntent.clientSecret,
      amount: amount,
      currency: 'USD',
      status: paymentIntent.status,
      customer_id: customerId,
      user: {
        user_id: userForResponse.user_id,
        name: userForResponse.name,
        email: userForResponse.email,
        PlatFormFee_status: userForResponse.PlatFormFee_status,
        PlatFormFee: userForResponse.PlatFormFee,
        trangaction_id: userForResponse.trangaction_id,
        isProfileComplete: userForResponse.isProfileComplete
      },
      message: 'Platform fee payment intent created successfully and user updated'
    }, 'Platform fee payment intent created successfully and user updated');

  } catch (error) {
    console.error('Platform fee payment error:', error);
    throw error;
  }
});

/**
 * Update staff profile - Only allows updating specific fields
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStaffProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    const candidateUserId = id || req.userId;

    if (!candidateUserId) {
      return sendError(res, 'User ID is required', 400);
    }

    const normalizedUserId = parseInt(candidateUserId, 10);
    if (Number.isNaN(normalizedUserId)) {
      return sendError(res, 'Invalid user ID', 400);
    }

    const existingUser = await User.findOne({ user_id: normalizedUserId }).select('-password');

    if (!existingUser) {
      return sendNotFound(res, 'User not found');
    }

    const numericFields = new Set(['country_id', 'state_id', 'city_id']);

    // Define allowed fields that can be updated
    const allowedFields = [
      'mobile',
      'address',
      'country_id',
      'state_id',
      'city_id',
      'zip_code',
      'Authorized_Person_Name',
      'DOB',
      'Govt_id_type',
      'ID_Number',
      'id_proof_owner_img',
      'user_img'
    ];

    let hasValidUpdate = false;

    // Build update data object with only allowed fields
    const updateData = {
      updated_by: req.userId || existingUser.user_id,
      updated_on: new Date()
    };

    // Only include fields that are in the allowed list and present in req.body
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (numericFields.has(field)) {
          const rawValue = req.body[field];
          if (rawValue === '' || rawValue === null) {
            updateData[field] = null;
          } else {
            const numericValue = Number(rawValue);
            if (Number.isNaN(numericValue)) {
              return sendError(res, `${field} must be a numeric value`, 400);
            }
            updateData[field] = numericValue;
          }
        } else if (field === 'DOB' && req.body[field]) {
          const dateValue = new Date(req.body[field]);
          if (Number.isNaN(dateValue.getTime())) {
            return sendError(res, 'Invalid DOB format', 400);
          }
          updateData[field] = dateValue;
        } else {
          updateData[field] = req.body[field];
        }
        hasValidUpdate = true;
      }
    }

    // Handle bank details section
    const bankDetailsInput = (req.body.bankDetails && typeof req.body.bankDetails === 'object')
      ? req.body.bankDetails
      : (req.body.bank_details && typeof req.body.bank_details === 'object' ? req.body.bank_details : null);

    if (bankDetailsInput) {
      const bankFieldWhitelist = [
        'bank_branch_name',
        'bank_name_id',
        'holderName',
        'upi',
        'ifsc',
        'accountNo',
        'address',
        'cardNo',
        'zipcode',
        'emoji'
      ];

      const bankData = {};

      bankFieldWhitelist.forEach((field) => {
        if (bankDetailsInput[field] !== undefined && bankDetailsInput[field] !== null && bankDetailsInput[field] !== '') {
          bankData[field] = bankDetailsInput[field];
        }
      });

      if (bankData.bank_name_id !== undefined) {
        const parsedBankNameId = parseInt(bankData.bank_name_id, 10);
        if (Number.isNaN(parsedBankNameId)) {
          return sendError(res, 'bank_name_id must be a numeric value', 400);
        }
        bankData.bank_name_id = parsedBankNameId;
      }

      let bankRecordId = bankDetailsInput.bank_branch_name_id || existingUser.bank_branch_id || null;
      bankRecordId = bankRecordId !== undefined && bankRecordId !== null && bankRecordId !== ''
        ? parseInt(bankRecordId, 10)
        : null;

      let bankRecord = null;
      const hasBankData = Object.keys(bankData).length > 0;

      if (bankRecordId && hasBankData) {
        const bankUpdatePayload = {
          ...bankData,
          updated_by: req.userId || existingUser.user_id,
          updated_at: new Date()
        };

        bankRecord = await BankBranchName.findOneAndUpdate(
          { bank_branch_name_id: bankRecordId, created_by: existingUser.user_id },
          bankUpdatePayload,
          { new: true, runValidators: true }
        );

        if (!bankRecord) {
          const requiredBankFields = ['bank_branch_name', 'bank_name_id', 'holderName', 'accountNo', 'address', 'zipcode'];
          const missingFields = requiredBankFields.filter((field) => bankData[field] === undefined);

          if (missingFields.length) {
            return sendError(
              res,
              `Bank details not found for update. Missing required fields to create new record: ${missingFields.join(', ')}`,
              400
            );
          }

          bankRecord = await BankBranchName.create({
            ...bankData,
            created_by: existingUser.user_id,
            updated_by: req.userId || existingUser.user_id,
            updated_at: new Date()
          });
        }
      } else if (bankRecordId && !hasBankData) {
        bankRecord = await BankBranchName.findOne({
          bank_branch_name_id: bankRecordId,
          created_by: existingUser.user_id
        });

        if (!bankRecord) {
          return sendError(res, 'Bank details not found for the provided bank_branch_name_id', 404);
        }
      } else if (!bankRecordId && hasBankData) {
        const requiredBankFields = ['bank_branch_name', 'bank_name_id', 'holderName', 'accountNo', 'address', 'zipcode'];
        const missingFields = requiredBankFields.filter((field) => bankData[field] === undefined);

        if (missingFields.length) {
          return sendError(
            res,
            `Missing required bank fields: ${missingFields.join(', ')}`,
            400
          );
        }

        bankRecord = await BankBranchName.create({
          ...bankData,
          created_by: existingUser.user_id,
          updated_by: req.userId || existingUser.user_id,
          updated_at: new Date()
        });
      }

      if (bankRecord) {
        updateData.bank_branch_id = bankRecord.bank_branch_name_id;
        updateData.bank_name_id = bankRecord.bank_name_id;
        updateData.bank_account_holder_name = bankRecord.holderName;
        updateData.bank_account_no = bankRecord.accountNo;
        hasValidUpdate = true;
      }
    }

    if (!hasValidUpdate) {
      return sendError(res, 'No valid fields to update', 400);
    }

    const user = await User.findOneAndUpdate(
      { user_id: normalizedUserId },
      updateData,
      {
        new: true,
        runValidators: true,
        select: '-password'
      }
    );

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Create notification for profile update
    try {
      if (user.user_id) {
        await createNotificationHendlar(
          user.user_id,
          3, // Notification type ID: 3 = Account/User related
          `Your staff profile has been updated successfully.`,
          req.userId || user.user_id
        );
      }
    } catch (notificationError) {
      console.error('Failed to create profile update notification:', notificationError);
    }

    const syncedUser = await syncProfileCompletionStatus(user, req.userId || normalizedUserId);

    sendSuccess(res, syncedUser || user, 'Staff profile updated successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserByIdBody,
  deleteUser,
  login,
  logout,
  getProfile,
  getStaffWorkingPrice,
  updateProfile,
  changePassword,
  sendOTP,
  verifyOTP,
  getUsersByRoleId,
  forgotPassword,
  resetPassword,
  PlatFormFeePayment,
  updateStaffProfile,
  testSendForgotPasswordOTPEmail
};

