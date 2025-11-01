const VibeBusinessPlanSubscribed = require('../models/vibe_business_plan_subscribed.model');
const VibeBusinessSubscription = require('../models/vibe_business_subscription.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const { createNotificationHendlar } = require('../../utils/notificationHandler');
const { createPaymentIntent, createCustomer } = require('../../utils/stripe');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * Create a new vibe business plan subscribed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createVibeBusinessPlanSubscribed = asyncHandler(async (req, res) => {
  try {
    const { plan_id, payment_method_id, billingDetails } = req.body;

    // Get plan details first
    const plan = await VibeBusinessSubscription.findOne({ plan_id: parseInt(plan_id) });
    if (!plan) {
      return sendError(res, 'Subscription plan not found', 404);
    }

    // Validate required fields for payment
    if (!payment_method_id) {
      return sendError(res, 'payment_method_id is required for subscription payment', 400);
    }

    // Get user information for Stripe customer creation
    const user = await User.findOne({ user_id: req.userId });
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Get amount from plan
    const amount = plan.price;
    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid plan price', 400);
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
          plan_id: plan_id,
          payment_type: 'subscription'
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
        amount: Math.round(amount), // Convert to cents
        billingDetails: billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          customer_id: customerId,
          plan_id: plan_id,
          payment_type: 'subscription',
          description: `Subscription payment for ${plan.plan_name || 'Plan'}`
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
      transactionType: 'Package_Buy',
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
        plan_id: plan_id,
        description: `Subscription payment for ${plan.plan_name || 'Plan'}`
      }),
      created_by: req.userId
    };

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Create vibe business plan subscribed data
    const planSubscribedData = {
      user_id: req.userId || req.body.user_id,
      plan_id: parseInt(plan_id),
      transaction_id: transaction.transaction_id,
      transaction_status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
      createdBy: req.userId
    };

    // Set start_plan_date and calculate end_plan_date (only if payment succeeded)
    if (paymentIntent.status === 'succeeded') {
      planSubscribedData.start_plan_date = new Date();
      
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      if (plan.planDuration === 'Monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.planDuration === 'Annually') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      planSubscribedData.end_plan_date = endDate;
    }

    // Create vibe business plan subscribed
    const planSubscribed = await VibeBusinessPlanSubscribed.create(planSubscribedData);

    // Create notification for subscription creation
    try {
      if (req.userId) {
        await createNotificationHendlar(
          req.userId,
          4, // Notification type ID: 4 = Subscription related
          `Your subscription to "${plan.plan_name || 'Plan'}" has been created successfully. Payment status: ${paymentIntent.status}`,
          req.userId
        );
      }
    } catch (notificationError) {
      console.error('Failed to create subscription notification:', notificationError);
    }

    sendSuccess(res, {
      planSubscribed: planSubscribed,
      transaction: {
        transaction_id: transaction.transaction_id,
        amount: amount,
        status: paymentIntent.status
      },
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      customer_id: customerId,
      message: 'Vibe business plan subscription created successfully with payment intent'
    }, 'Vibe business plan subscribed created successfully with payment intent', 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Get all vibe business plans subscribed with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllVibeBusinessPlansSubscribed = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, transaction_status, user_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { transaction_status: { $regex: search, $options: 'i' } }
      ];
    }
  
    if (transaction_status) {
      filter.transaction_status = transaction_status;
    }
    if (user_id) {
      filter.user_id = user_id;
    }

    // Get vibe business plans subscribed with pagination
    const [plansSubscribed, total] = await Promise.all([
      VibeBusinessPlanSubscribed.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      VibeBusinessPlanSubscribed.countDocuments(filter)
    ]);

    const pagination = {
      current: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total,
      limit: parseInt(limit)
    };

    sendPaginated(res, plansSubscribed, pagination, 'Vibe business plans subscribed retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vibe business plan subscribed by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getVibeBusinessPlanSubscribedById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const planSubscribed = await VibeBusinessPlanSubscribed.findOne({ vibe_business_plan_subscribed_id: parseInt(id) });

    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found');
    }

    sendSuccess(res, planSubscribed, 'Vibe business plan subscribed retrieved successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vibe business plan subscribed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateVibeBusinessPlanSubscribed = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    // Add updatedBy to request body
    req.body.updatedBy = req.userId;

    // Get the existing plan subscribed to check current plan_id
    const existingPlanSubscribed = await VibeBusinessPlanSubscribed.findOne({ vibe_business_plan_subscribed_id: parseInt(id) });
    if (!existingPlanSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found');
    }

    const planId = req.body.plan_id || existingPlanSubscribed.plan_id;
    const plan = await VibeBusinessSubscription.findOne({ plan_id: parseInt(planId) });
    if (!plan) {
      return sendError(res, 'Subscription plan not found', 404);
    }

    // If transaction_id is provided, validate it exists
    if (req.body.transaction_id) {
      const transaction = await Transaction.findOne({ transaction_id: parseInt(req.body.transaction_id) });
      if (!transaction) {
        return sendError(res, 'Transaction not found', 404);
      }
      req.body.transaction_status = transaction.status;
    }

    // Remove id from req.body before updating
    const { id: _, ...updateData } = req.body;
    
    const planSubscribed = await VibeBusinessPlanSubscribed.findOneAndUpdate(
      { vibe_business_plan_subscribed_id: parseInt(id) },
      updateData,
      { new: true, runValidators: true }
    );

    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found');
    }

    // Create notification for subscription update
    try {
      if (req.userId) {
        await createNotificationHendlar(
          planSubscribed.user_id || req.userId,
          4, // Notification type ID: 4 = Subscription related
          `Your subscription has been updated successfully.`,
          req.userId
        );
      }
    } catch (notificationError) {
      console.error('Failed to create subscription update notification:', notificationError);
    }

    sendSuccess(res, planSubscribed, 'Vibe business plan subscribed updated successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Update vibe business plan subscribed after transaction completion
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateAfterTransaction = asyncHandler(async (req, res) => {
  try {
    const { transaction_id } = req.body;

    // Find the transaction
    const transaction = await Transaction.findOne({ transaction_id: parseInt(transaction_id) });
    if (!transaction) {
      return sendError(res, 'Transaction not found', 404);
    }

    // Find the plan subscribed by transaction_id
    const planSubscribed = await VibeBusinessPlanSubscribed.findOne({ transaction_id: parseInt(transaction_id) });
    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found for this transaction');
    }

    // Get the subscription plan details
    const subscriptionPlan = await VibeBusinessSubscription.findOne({ plan_id: parseInt(planSubscribed.plan_id) });
    if (!subscriptionPlan) {
      return sendError(res, 'Subscription plan not found', 404);
    }

    // Prepare update data
    const updateData = {
      transaction_status: transaction.status,
      updatedBy: req.userId,
      updatedAt: new Date()
    };

    // If transaction is completed, update dates
    if (transaction.status === 'completed') {
      updateData.start_plan_date = new Date();
      
      // Calculate end date based on plan duration
      const startDate = new Date();
      const endDate = new Date(startDate);
      
      if (subscriptionPlan.planDuration === 'Monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (subscriptionPlan.planDuration === 'Annually') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
      
      updateData.end_plan_date = endDate;
    }

    // Update the plan subscribed
    const updatedPlanSubscribed = await VibeBusinessPlanSubscribed.findOneAndUpdate(
      { vibe_business_plan_subscribed_id: planSubscribed.vibe_business_plan_subscribed_id },
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, updatedPlanSubscribed, 'Vibe business plan subscribed updated after transaction completion');
  } catch (error) {
    throw error;
  }
});

/**
 * Get vibe business plan subscribed by authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getByAuthPlanSubscribed = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status, transaction_status } = req.query;

    // Build filter object
    const filter = {
      user_id: req.userId
    };

    if (status !== undefined) {
      filter.status = status === 'true';
    }

    if (transaction_status) {
      filter.transaction_status = transaction_status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get total count
    const total = await VibeBusinessPlanSubscribed.countDocuments(filter);

    // Get plans with pagination
    const plans = await VibeBusinessPlanSubscribed.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Populate plan details and transaction details
    const populatedPlans = await Promise.all(
      plans.map(async (plan) => {
        // Get plan details
        const planDetails = await VibeBusinessSubscription.findOne({ plan_id: plan.plan_id });
        
        // Get transaction details
        let transactionDetails = null;
        if (plan.transaction_id) {
          transactionDetails = await Transaction.findOne({ transaction_id: plan.transaction_id });
        }

        return {
          ...plan.toObject(),
          plan_details: planDetails ? {
            plan_id: planDetails.plan_id,
            plan_name: planDetails.plan_name,
            description: planDetails.description,
            price: planDetails.price,
            duration_days: planDetails.duration_days,
            features: planDetails.features,
            status: planDetails.status
          } : null,
          transaction_details: transactionDetails ? {
            transaction_id: transactionDetails.transaction_id,
            amount: transactionDetails.amount,
            currency: transactionDetails.currency,
            status: transactionDetails.status,
            transaction_date: transactionDetails.transaction_date,
            reference_number: transactionDetails.reference_number,
            payment_method_id: transactionDetails.payment_method_id
          } : null
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

    sendPaginated(res, populatedPlans, 'User plan subscriptions retrieved successfully', paginationInfo);
  } catch (error) {
    throw error;
  }
});

/**
 * Delete vibe business plan subscribed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteVibeBusinessPlanSubscribed = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const planSubscribed = await VibeBusinessPlanSubscribed.findOneAndDelete({ vibe_business_plan_subscribed_id: parseInt(id) });

    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscribed not found');
    }

    // Create notification for subscription deletion
    try {
      if (req.userId && planSubscribed.user_id) {
        await createNotificationHendlar(
          planSubscribed.user_id,
          4, // Notification type ID: 4 = Subscription related
          `Your subscription has been deleted successfully.`,
          req.userId
        );
      }
    } catch (notificationError) {
      console.error('Failed to create subscription deletion notification:', notificationError);
    }

    sendSuccess(res, null, 'Vibe business plan subscribed deleted successfully');
  } catch (error) {
    throw error;
  }
});

/**
 * Process payment for vibe business plan subscription
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const paymentSubscription = asyncHandler(async (req, res) => {
  try {
    const {
      vibe_business_plan_subscribed_id,
      payment_method_id,
      billingDetails,
      description = 'Subscription payment'
    } = req.body;

    // Validate required fields
    if (!vibe_business_plan_subscribed_id || !payment_method_id) {
      return sendError(res, 'vibe_business_plan_subscribed_id and payment_method_id are required', 400);
    }

    // Get the subscription to find details
    const planSubscribed = await VibeBusinessPlanSubscribed.findOne({
      vibe_business_plan_subscribed_id: parseInt(vibe_business_plan_subscribed_id)
    });

    if (!planSubscribed) {
      return sendNotFound(res, 'Vibe business plan subscription not found');
    }

    // Get the subscription plan details
    const plan = await VibeBusinessSubscription.findOne({ plan_id: parseInt(planSubscribed.plan_id) });
    if (!plan) {
      return sendError(res, 'Subscription plan not found', 404);
    }

    // Get amount from plan
    const amount = plan.price;
    if (!amount || amount <= 0) {
      return sendError(res, 'Invalid plan price', 400);
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
          vibe_business_plan_subscribed_id: vibe_business_plan_subscribed_id,
          payment_type: 'subscription'
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
        amount: Math.round(amount), // Convert to cents
        billingDetails: billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          customer_id: customerId,
          vibe_business_plan_subscribed_id: vibe_business_plan_subscribed_id,
          payment_type: 'subscription',
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
      transactionType: 'Package_Buy',
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
        vibe_business_plan_subscribed_id: vibe_business_plan_subscribed_id,
        description: description
      }),
      created_by: req.userId
    };

    // Create transaction
    const transaction = await Transaction.create(transactionData);

    // Update the subscription with transaction details
    const updatedPlanSubscribed = await VibeBusinessPlanSubscribed.findOneAndUpdate(
      { vibe_business_plan_subscribed_id: parseInt(vibe_business_plan_subscribed_id) },
      {
        transaction_id: transaction.transaction_id,
        transaction_status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
        updatedBy: req.userId,
        updatedAt: new Date()
      },
      { new: true }
    );

    // If payment succeeded, update subscription dates
    if (paymentIntent.status === 'succeeded') {
      const startDate = new Date();
      const endDate = new Date(startDate);

      if (plan.planDuration === 'Monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.planDuration === 'Annually') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      await VibeBusinessPlanSubscribed.findOneAndUpdate(
        { vibe_business_plan_subscribed_id: parseInt(vibe_business_plan_subscribed_id) },
        {
          start_plan_date: startDate,
          end_plan_date: endDate,
          updatedBy: req.userId,
          updatedAt: new Date()
        }
      );
    }

    // Create notification for subscription payment
    try {
      if (req.userId) {
        await createNotificationHendlar(
          req.userId,
          4, // Notification type ID: 4 = Subscription related
          `Your subscription payment for "${plan.plan_name || 'Plan'}" has been processed. Amount: $${amount.toFixed(2)}, Status: ${paymentIntent.status}`,
          req.userId
        );
      }
    } catch (notificationError) {
      console.error('Failed to create subscription payment notification:', notificationError);
    }

    sendSuccess(res, {
      planSubscribed: updatedPlanSubscribed,
      transaction: {
        transaction_id: transaction.transaction_id,
        amount: amount,
        status: paymentIntent.status
      },
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      customer_id: customerId
    }, 'Subscription payment processed successfully');
  } catch (error) {
    throw error;
  }
});

module.exports = {
  createVibeBusinessPlanSubscribed,
  getAllVibeBusinessPlansSubscribed,
  getVibeBusinessPlanSubscribedById,
  updateVibeBusinessPlanSubscribed,
  updateAfterTransaction,
  deleteVibeBusinessPlanSubscribed,
  getByAuthPlanSubscribed,
  paymentSubscription
};
