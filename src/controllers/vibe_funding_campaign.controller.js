const VibeFundingCampaign = require('../models/vibe_funding_campaign.model');
const User = require('../models/user.model');
const VibeFundCampaign = require('../models/vibe_fund_campaign.model');
const Transaction = require('../models/transaction.model');
const { sendSuccess, sendError, sendNotFound, sendPaginated } = require('../../utils/response');
const { asyncHandler } = require('../../middleware/errorHandler');
const { createPaymentIntent, createCustomer } = require('../../utils/stripe');

const createVibeFundingCampaign = asyncHandler(async (req, res) => {
  try {
    const fundingData = {
      ...req.body,
      created_by: req.userId || 1
    };
    const funding = await VibeFundingCampaign.create(fundingData);
    const fundbyUser = await User.findOne({ user_id: funding.fundby_user_id }).select('user_id name email mobile user_img');
    const campaign = await VibeFundCampaign.findOne({ vibe_fund_campaign_id: funding.vibe_fund_campaign_id }).select('vibe_fund_campaign_id title funding_goal');
    if (campaign) {
      await VibeFundCampaign.findByIdAndUpdate({ _id: campaign._id }, { $set: { fund_amount: campaign.fund_amount + funding.fund_amount, fund_still_Needed: campaign.funding_goal - (campaign.fund_amount + funding.fund_amount) } }, { new: true });
    }
    const fundingWithDetails = funding.toObject();
    fundingWithDetails.fundby_user = fundbyUser;
    fundingWithDetails.campaign = campaign;
    sendSuccess(res, fundingWithDetails, 'Funding contribution created successfully', 201);
  } catch (error) {
    throw error
  }
});
const getAllVibeFundingCampaign = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      vibe_fund_campaign_id,
      fundby_user_id,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};

    if (vibe_fund_campaign_id) {
      filter.vibe_fund_campaign_id = parseInt(vibe_fund_campaign_id);
    }

    if (fundby_user_id) {
      filter.fundby_user_id = parseInt(fundby_user_id);
    }



    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [fundings, total] = await Promise.all([
      VibeFundingCampaign.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      VibeFundingCampaign.countDocuments(filter)
    ]);

    // Manually populate fundby_user_id and vibe_fund_campaign_id
    const userIds = [...new Set(fundings.map(f => f.fundby_user_id).filter(Boolean))];
    const campaignIds = [...new Set(fundings.map(f => f.vibe_fund_campaign_id).filter(Boolean))];

    const [users, campaigns] = await Promise.all([
      User.find({ user_id: { $in: userIds } }).select('user_id name email mobile user_img'),
      VibeFundCampaign.find({ vibe_fund_campaign_id: { $in: campaignIds } }).select('vibe_fund_campaign_id title funding_goal')
    ]);

    const userMap = {};
    users.forEach(user => {
      userMap[user.user_id] = user;
    });

    const campaignMap = {};
    campaigns.forEach(campaign => {
      campaignMap[campaign.vibe_fund_campaign_id] = campaign;
    });

    const fundingsWithDetails = fundings.map(funding => {
      const fundingObj = funding.toObject();
      fundingObj.fundby_user = userMap[funding.fundby_user_id] || null;
      fundingObj.campaign = campaignMap[funding.vibe_fund_campaign_id] || null;
      return fundingObj;
    });

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



    sendPaginated(res, fundingsWithDetails, pagination, 'Funding contributions retrieved successfully');
  } catch (error) {
    throw error
  }
});
const getVibeFundingCampaignById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const funding = await VibeFundingCampaign.findOne({ vibe_funding_campaign_id: parseInt(id) });

    if (!funding) {
      return sendNotFound(res, 'Funding contribution not found');
    }

    // Manually populate fundby_user_id
    const fundbyUser = await User.findOne({ user_id: funding.fundby_user_id }).select('user_id name email mobile user_img');
    const campaign = await VibeFundCampaign.findOne({ vibe_fund_campaign_id: funding.vibe_fund_campaign_id }).select('vibe_fund_campaign_id title funding_goal');

    const fundingWithDetails = funding.toObject();
    fundingWithDetails.fundby_user = fundbyUser;
    fundingWithDetails.campaign = campaign;



    sendSuccess(res, fundingWithDetails, 'Funding contribution retrieved successfully');
  } catch (error) {

    throw error
  }
});
const updateVibeFundingCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.body;

    const updateData = {
      ...req.body,
      updated_by: req.userId,
      updated_at: new Date()
    };

    const funding = await VibeFundingCampaign.findOneAndUpdate(
      { vibe_funding_campaign_id: parseInt(id) },
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!funding) {
      return sendNotFound(res, 'Funding contribution not found');
    }

    // Manually populate fundby_user_id
    const fundbyUser = await User.findOne({ user_id: funding.fundby_user_id }).select('user_id name email mobile user_img');
    const campaign = await VibeFundCampaign.findOne({ vibe_fund_campaign_id: funding.vibe_fund_campaign_id }).select('vibe_fund_campaign_id title funding_goal');

    const fundingWithDetails = funding.toObject();
    fundingWithDetails.fundby_user = fundbyUser;
    fundingWithDetails.campaign = campaign;



    sendSuccess(res, fundingWithDetails, 'Funding contribution updated successfully');
  } catch (error) {

    throw error
  }
});
const deleteVibeFundingCampaign = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const funding = await VibeFundingCampaign.findOneAndUpdate(
      { vibe_funding_campaign_id: parseInt(id) },
      {
        status: false,
        updated_by: req.userId,
        updated_at: new Date()
      },
      { new: true }
    );

    if (!funding) {
      return sendNotFound(res, 'Funding contribution not found');
    }



    sendSuccess(res, funding, 'Funding contribution deleted successfully');
  } catch (error) {
    throw error
  }
});
const vibePayment = asyncHandler(async (req, res) => {
  try {
    const { payment_method_id, billingDetails, description = 'vibe payment', vibe_funding_campaign_id, amount } = req.body;
    if (!payment_method_id) {
      return sendError(res, 'payment_method_id is required', 400);
    }
    let vibeHostId = null, ownerId = null, fund_amount = 0;
    if (vibe_funding_campaign_id) {
      const vibe = await VibeFundingCampaign.findOne({ vibe_funding_campaign_id: parseInt(vibe_funding_campaign_id) });
      if (vibe) {
        const vibe34 = await VibeFundCampaign.findOne({ vibe_fund_campaign_id: vibe.vibe_fund_campaign_id });
        if (vibe34) {
          ownerId = vibe34.created_by;
        }
      }
      fund_amount= vibe ? vibe.fund_amount : 0;
      vibeHostId = vibe ? vibe.created_by : null;
    }
    const normalizedAmount = Number(amount);
    if (Number.isNaN(normalizedAmount)) {
      return sendError(res, 'Invalid amount. It must be a numeric value.', 400);
    }
    if (normalizedAmount <= 0) {
      return sendError(res, 'Amount must be greater than 0', 400);
    }
    const PLATFORM_FEE_PERCENTAGE = 0.07; // 7%
    const baseAmount = normalizedAmount; // Base amount (what vibe host should receive)
    const platformFeeAmount = baseAmount * PLATFORM_FEE_PERCENTAGE;
    const totalAmount = baseAmount + platformFeeAmount; // Customer pays: base + 7% platform fee
    const vibeHostAmount = baseAmount; // vibe host receives base amount only
    const user = await User.findOne({ user_id: req.userId }).select('email name');
    if (!user || !user.email) {
      return sendError(res, 'User email not found for Stripe receipt', 400);
    }
    const customerId = undefined;
    let paymentIntent = null;
    try {
      const paymentOptions = {
        amount: Math.round(totalAmount), // Customer pays total (base + platform fee)
        billingDetails,
        currency: 'usd',
        customerEmail: user.email,
        metadata: {
          user_id: req.userId,
          vibe_funding_campaign_id: vibe_funding_campaign_id || '',
          payment_type: 'vibe_payment',
          description
        }
      };

      paymentIntent = await createPaymentIntent(paymentOptions);
    } catch (paymentError) {
      return sendError(res, `Payment intent creation failed: ${paymentError.message}`, 400);
    }
    const transactionData = {
      user_id: ownerId,
      amount: totalAmount, // Customer pays total (base + platform fee)
      status: paymentIntent.status,
      payment_method_id: payment_method_id,
      transactionType: 'vibePayment',
      transaction_date: new Date(),
      reference_number: paymentIntent.paymentIntentId,
      coupon_code_id: null,
      CGST: 0,
      SGST: 0,
      TotalGST: 0,
      metadata: JSON.stringify({
        stripe_payment_intent_id: paymentIntent.paymentIntentId,
        stripe_client_secret: paymentIntent.clientSecret,
        vibe_funding_campaign_id: vibe_funding_campaign_id || null,
        vibe_host_id: vibeHostId,
        base_amount: baseAmount,
        platform_fee: platformFeeAmount,
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        vibe_host_amount: vibeHostAmount,
        description
      }),
      created_by: req.userId
    };

    const customerTransaction = await Transaction.create(transactionData);
    if (vibeHostId && vibeHostAmount > 0) {
      const vibeHostUser = await User.findOne({ user_id: vibeHostId, status: true });
      if (vibeHostUser) {
        const vibeHostTransactionData = {
          user_id: vibeHostId, // vibe host user ID
          amount: vibeHostAmount, // vibe host receives baseAmount only
          status: paymentIntent.status,
          payment_method_id: parseInt(payment_method_id, 10),
          transactionType: 'vibePayment',
          transaction_date: new Date(),
          reference_number: `vibe_HOST_PAYMENT_${paymentIntent.paymentIntentId}`,
          coupon_code_id: null,
          CGST: 0,
          SGST: 0,
          TotalGST: 0,
          metadata: JSON.stringify({
            payment_intent_id: paymentIntent.paymentIntentId,
            stripe_payment_intent_id: paymentIntent.paymentIntentId,
            vibe_funding_campaign_id: vibe_funding_campaign_id || null,
            vibe_host_id: vibeHostId,
            customer_user_id: req.userId,
            base_amount: baseAmount,
            platform_fee: platformFeeAmount,
            platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
            vibe_host_amount: vibeHostAmount, // vibe host receives baseAmount
            total_amount: totalAmount,
            customer_transaction_id: customerTransaction.transaction_id,
            description: 'vibe host receives base amount from vibe payment'
          }),
          created_by: req.userId
        };

        await Transaction.create(vibeHostTransactionData);
      }
    }
    // const adminUser = await User.findOne({ role_id: 1, status: true }).sort({ user_id: 1 });
    // if (adminUser && platformFeeAmount > 0) {
    //   const adminTransactionData = {
    //     user_id: adminUser.user_id,
    //     amount: platformFeeAmount, // Admin receives only platform fee (7%)
    //     status: paymentIntent.status,
    //     payment_method_id: parseInt(payment_method_id, 10),
    //     transactionType: 'vibePayment',
    //     transaction_date: new Date(),
    //     reference_number: `PLATFORM_FEE_${paymentIntent.paymentIntentId}`,
    //     coupon_code_id: null,
    //     CGST: 0,
    //     SGST: 0,
    //     TotalGST: 0,
    //     metadata: JSON.stringify({
    //       payment_intent_id: paymentIntent.paymentIntentId,
    //       stripe_payment_intent_id: paymentIntent.paymentIntentId,
    //       vibe_funding_campaign_id: vibe_funding_campaign_id || null,
    //       vibe_host_id: vibeHostId,
    //       customer_user_id: req.userId,
    //       base_amount: baseAmount,
    //       platform_fee: platformFeeAmount,
    //       platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
    //       vibe_host_amount: vibeHostAmount, // vibe host receives baseAmount
    //       total_amount: totalAmount,
    //       customer_transaction_id: customerTransaction.transaction_id,
    //       description: 'Platform fee (7%) from vibe payment - Admin receives platform fee'
    //     }),
    //     created_by: req.userId
    //   };

    //   await Transaction.create(adminTransactionData);
    // }
    return sendSuccess(res, {
      customer_transaction_id: customerTransaction.transaction_id,
      payment_intent_id: paymentIntent.paymentIntentId,
      client_secret: paymentIntent.clientSecret,
      payment_breakdown: {
        total_amount: totalAmount, // Customer pays this (baseAmount + platformFeeAmount)
        base_amount: baseAmount, // vibe host receives this
        platform_fee: platformFeeAmount, // Admin receives this (7%)
        platform_fee_percentage: PLATFORM_FEE_PERCENTAGE * 100,
        vibe_host_amount: vibeHostAmount // vibe host receives baseAmount only
      },
      transactions: {
        customer: {
          transaction_id: customerTransaction.transaction_id,
          user_id: req.userId,
          amount: totalAmount,
          description: 'Customer payment for vibe (baseAmount + platformFee)'
        },
        vibe_host: {
          user_id: vibeHostId,
          amount: vibeHostAmount, // baseAmount
          description: 'vibe host receives base amount'
        },
        // admin: {
        //   user_id: adminUser ? adminUser.user_id : null,
        //   amount: platformFeeAmount,
        //   description: 'Admin receives 7% platform fee'
        // }
      },
      currency: 'USD',
      status: paymentIntent.status,
      paymentIntent: {
        id: paymentIntent.paymentIntentId,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      },
      vibe_funding_campaign_id: vibe_funding_campaign_id || null
    }, 'vibe payment processed successfully. Three transactions created: Customer pays total amount, vibe host receives base amount, Admin receives 7% platform fee.');
  } catch (error) {
    throw error;
  }
});





module.exports = { createVibeFundingCampaign, getAllVibeFundingCampaign, getVibeFundingCampaignById, updateVibeFundingCampaign, deleteVibeFundingCampaign, vibePayment };