const Joi = require('joi');

const commonValidations = {
  title: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 2 characters long',
      'string.max': 'Title cannot exceed 200 characters'
    }),

  campaign_description: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Campaign description is required',
      'string.min': 'Campaign description must be at least 10 characters long',
      'string.max': 'Campaign description cannot exceed 2000 characters'
    }),

  campaign_story: Joi.string()
    .trim()
    .max(5000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Campaign story cannot exceed 5000 characters'
    }),

  business_category_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Business Category ID must be a number',
      'number.integer': 'Business Category ID must be an integer',
      'number.positive': 'Business Category ID must be a positive number',
      'any.required': 'Business Category ID is required'
    }),

  compaign_type_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Compaign Type ID must be a number',
      'number.integer': 'Compaign Type ID must be an integer',
      'number.positive': 'Compaign Type ID must be a positive number',
      'any.required': 'Compaign Type ID is required'
    }),

  funding_goal: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'Funding goal must be a number',
      'number.min': 'Funding goal must be a positive number',
      'any.required': 'Funding goal is required'
    }),

  campaign_duration: Joi.string()
    .trim()
    .max(100)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Campaign duration cannot exceed 100 characters'
    }),

  funding_model: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Funding model cannot exceed 200 characters'
    }),

  cover_image: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Cover image must be a valid URL'
    }),

  campaign_video: Joi.string()
    .trim()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Campaign video must be a valid URL'
    }),

  reward_tiers: Joi.array()
    .items(Joi.string().trim().max(500))
    .default([])
    .messages({
      'array.base': 'Reward tiers must be an array'
    }),

  milestones: Joi.array()
    .items(Joi.string().trim().max(500))
    .default([])
    .messages({
      'array.base': 'Milestones must be an array'
    }),

  approved_status: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Approved status must be a boolean value'
    }),

  emozi: Joi.string()
    .trim()
    .max(10)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Emoji cannot exceed 10 characters'
    }),

  status: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'Status must be a boolean value'
    })
};

const createVibeFundCampaignSchema = Joi.object({
  title: commonValidations.title,
  campaign_description: commonValidations.campaign_description,
  campaign_story: commonValidations.campaign_story,
  business_category_id: commonValidations.business_category_id,
  compaign_type_id: commonValidations.compaign_type_id,
  funding_goal: commonValidations.funding_goal,
  campaign_duration: commonValidations.campaign_duration,
  funding_model: commonValidations.funding_model,
  cover_image: commonValidations.cover_image,
  campaign_video: commonValidations.campaign_video,
  reward_tiers: commonValidations.reward_tiers,
  milestones: commonValidations.milestones,
  approved_status: commonValidations.approved_status,
  emozi: commonValidations.emozi,
  status: commonValidations.status
});

const updateVibeFundCampaignSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Campaign ID must be a number',
      'number.integer': 'Campaign ID must be an integer',
      'number.positive': 'Campaign ID must be a positive number',
      'any.required': 'Campaign ID is required'
    }),
  title: commonValidations.title.optional(),
  campaign_description: commonValidations.campaign_description.optional(),
  campaign_story: commonValidations.campaign_story,
  business_category_id: commonValidations.business_category_id.optional(),
  compaign_type_id: commonValidations.compaign_type_id.optional(),
  funding_goal: commonValidations.funding_goal.optional(),
  campaign_duration: commonValidations.campaign_duration,
  funding_model: commonValidations.funding_model,
  cover_image: commonValidations.cover_image,
  campaign_video: commonValidations.campaign_video,
  reward_tiers: commonValidations.reward_tiers,
  milestones: commonValidations.milestones,
  approved_status: commonValidations.approved_status,
  emozi: commonValidations.emozi,
  status: commonValidations.status.optional()
}).min(2).messages({
  'object.min': 'At least one field besides id must be provided for update'
});

const getVibeFundCampaignByIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Campaign ID must be a number',
      'number.integer': 'Campaign ID must be an integer',
      'number.positive': 'Campaign ID must be a positive number'
    })
});

const getAllVibeFundCampaignSchema = Joi.object({
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
  search: Joi.string()
    .trim()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    }),
  business_category_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Business Category ID must be a number',
      'number.integer': 'Business Category ID must be an integer',
      'number.positive': 'Business Category ID must be a positive number'
    }),
  compaign_type_id: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'Compaign Type ID must be a number',
      'number.integer': 'Compaign Type ID must be an integer',
      'number.positive': 'Compaign Type ID must be a positive number'
    }),
  status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Status must be a boolean value'
    }),
  approved_status: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Approved status must be a boolean value'
    }),
  sortBy: Joi.string()
    .valid('title', 'funding_goal', 'approved_status', 'created_at', 'updated_at')
    .default('created_at')
    .messages({
      'any.only': 'Sort by must be one of: title, funding_goal, approved_status, created_at, updated_at'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});

const changeApprovedStatusSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Campaign ID must be a number',
      'number.integer': 'Campaign ID must be an integer',
      'number.positive': 'Campaign ID must be a positive number',
      'any.required': 'Campaign ID is required'
    }),
  approved_status: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'Approved status must be a boolean value',
      'any.required': 'Approved status is required'
    })
});

module.exports = {
  createVibeFundCampaignSchema,
  updateVibeFundCampaignSchema,
  getVibeFundCampaignByIdSchema,
  getAllVibeFundCampaignSchema,
  changeApprovedStatusSchema
};

