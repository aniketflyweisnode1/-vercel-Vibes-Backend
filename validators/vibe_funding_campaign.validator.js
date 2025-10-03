const Joi = require('joi');

const commonValidations = {
  vibe_fund_campaign_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Vibe Fund Campaign ID must be a number',
      'number.integer': 'Vibe Fund Campaign ID must be an integer',
      'number.positive': 'Vibe Fund Campaign ID must be a positive number',
      'any.required': 'Vibe Fund Campaign ID is required'
    }),

  fund_amount: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Fund amount must be a number',
      'number.min': 'Fund amount must be a positive number',
      'any.required': 'Fund amount is required'
    }),

  fundby_user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Fund by user ID must be a number',
      'number.integer': 'Fund by user ID must be an integer',
      'number.positive': 'Fund by user ID must be a positive number',
      'any.required': 'Fund by user ID is required'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createVibeFundingCampaignSchema = Joi.object({
  vibe_fund_campaign_id: commonValidations.vibe_fund_campaign_id,
  fund_amount: commonValidations.fund_amount,
  fundby_user_id: commonValidations.fundby_user_id,
  status: commonValidations.status
});

const updateVibeFundingCampaignSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Funding Campaign ID must be a number',
      'number.integer': 'Funding Campaign ID must be an integer',
      'number.positive': 'Funding Campaign ID must be a positive number',
      'any.required': 'Funding Campaign ID is required'
    }),
  vibe_fund_campaign_id: commonValidations.vibe_fund_campaign_id.optional(),
  fund_amount: commonValidations.fund_amount.optional(),
  fundby_user_id: commonValidations.fundby_user_id.optional(),
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getVibeFundingCampaignByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Funding Campaign ID must be a number',
      'number.integer': 'Funding Campaign ID must be an integer',
      'number.positive': 'Funding Campaign ID must be a positive number'
    })
});

const getAllVibeFundingCampaignSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  vibe_fund_campaign_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Vibe Fund Campaign ID must be a number',
      'number.integer': 'Vibe Fund Campaign ID must be an integer',
      'number.positive': 'Vibe Fund Campaign ID must be a positive number'
    }),
  fundby_user_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Fund by user ID must be a number',
      'number.integer': 'Fund by user ID must be an integer',
      'number.positive': 'Fund by user ID must be a positive number'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('fund_amount', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: fund_amount, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
  createVibeFundingCampaignSchema,
  updateVibeFundingCampaignSchema,
  getVibeFundingCampaignByIdSchema,
  getAllVibeFundingCampaignSchema
};

