const User = require('../models/user.model');
const OTP = require('../models/otp.model');
const { createWalletForUser } = require('./wallet.controller');
const { generateTokens } = require('../../utils/jwt');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { generateOTP } = require('../../utils/helpers');
const emailService = require('../../utils/emailService');

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
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      created_by: null // No user created this OTP
    };

    const otp = await OTP.create(otpData);

    // Send OTP via email
    const emailSent = await emailService.sendOTPEmail(email, otpCode, user.name);
    
    if (!emailSent) {
      // If email fails, deactivate the OTP
      await OTP.findOneAndUpdate({ otp_id: otp.otp_id }, { status: false });
      return sendError(res, 'Failed to send OTP email. Please try again.', 500);
    }

    sendSuccess(res, { 
      message: 'OTP sent successfully to your email address. Please verify to complete login.',
      expiresIn: '10 minutes',
      nextStep: 'verify-otp',
      otp: otpCode
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
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      created_by: null // No user created this OTP
    };

    const otp = await OTP.create(otpData);

    // Send OTP via email
    const emailSent = await emailService.sendOTPEmail(email, otpCode, user.name);
    
    if (!emailSent) {
      // If email fails, deactivate the OTP
      await OTP.findOneAndUpdate({ otp_id: otp.otp_id }, { status: false });
      return sendError(res, 'Failed to send OTP email. Please try again.', 500);
    }

    sendSuccess(res, { 
      message: 'OTP sent successfully to your email address',
      expiresIn: '10 minutes',
      otp: otpCode
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

    // Mark OTP as used
    await OTP.findByIdAndUpdate(otpRecord._id, {
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

    sendPaginated(res, users, pagination, `Users with role ID ${role_id} retrieved successfully`);
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
  getUsersByRoleId
};

