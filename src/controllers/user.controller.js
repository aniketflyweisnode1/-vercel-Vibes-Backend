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

    sendSuccess(res, user, 'User created successfully', 201);
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
        { bank_account_holder_name: { $regex: search, $options: 'i' } }
      ];
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

    const user = await User.findOne({user_id: parseInt(id)})
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
      {user_id: parseInt(id)},
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

    sendSuccess(res, user, 'User updated successfully');
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
      {user_id: parseInt(id)},
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
    const emailSent = await emailService.sendOTPEmail(email, otpCode, user.name || 'User');
    if (!emailSent) {
      // If email fails, deactivate the OTP
      await OTP.findOneAndUpdate({ otp_id: otp.otp_id }, { status: false });
      return sendError(res, 'Failed to send OTP email. Please try again.', 500);
    }

    sendSuccess(res, { 
      message: 'OTP sent successfully to your email address. Please verify to complete login.',
      expiresIn: '10 minutes',
      nextStep: 'verify-otp'
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
    const user = await User.findById(req.userId)
      .select('-password');

    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    sendSuccess(res, user, 'Profile retrieved successfully');
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
    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_on: new Date()
    };

    // Remove password from update data if present (use separate endpoint for password change)
    delete updateData.password;
    // Remove Fixed_role_id from update data to prevent it from being changed
    delete updateData.Fixed_role_id;

    const user = await User.findOneAndUpdate(
      {user_id: id},
      updateData
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

    sendSuccess(res, user, 'Profile updated successfully');
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
      {user_id: parseInt(id)},
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

    sendSuccess(res, user, 'User updated successfully');
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
        { bank_account_holder_name: { $regex: search, $options: 'i' } }
      ];
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

    sendSuccess(res, {
      transaction_id: transaction.transaction_id,
      payment_intent_id: paymentIntent.paymentIntentId,
      client_secret: paymentIntent.clientSecret,
      amount: amount,
      currency: 'USD',
      status: paymentIntent.status,
      customer_id: customerId,
      user: {
        user_id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        PlatFormFee_status: updatedUser.PlatFormFee_status,
        PlatFormFee: updatedUser.PlatFormFee,
        trangaction_id: updatedUser.trangaction_id
      },
      message: 'Platform fee payment intent created successfully and user updated'
    }, 'Platform fee payment intent created successfully and user updated');

  } catch (error) {
    console.error('Platform fee payment error:', error);
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
  updateProfile,
  changePassword,
  sendOTP,
  verifyOTP,
  getUsersByRoleId,
  forgotPassword,
  resetPassword,
  PlatFormFeePayment
};

