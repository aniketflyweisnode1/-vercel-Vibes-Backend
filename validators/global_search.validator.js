const Joi = require('joi');

const createGlobalSearchSchema = Joi.object({
  Page_Name: Joi.string().trim().max(200).required().messages({
    'any.required': 'Page name is required',
    'string.empty': 'Page name is required'
  }),
  Page_Routes: Joi.string().trim().max(500).required().messages({
    'any.required': 'Page route is required',
    'string.empty': 'Page route is required'
  }),
  Page_content: Joi.string().trim().required().messages({
    'any.required': 'Page content is required',
    'string.empty': 'Page content is required'
  }),
  Status: Joi.boolean().optional()
});

const updateGlobalSearchSchema = Joi.object({
  GlobalSearch_id: Joi.number().integer().required().messages({
    'any.required': 'Global search ID is required',
    'number.base': 'Global search ID must be a number'
  }),
  Page_Name: Joi.string().trim().max(200).optional(),
  Page_Routes: Joi.string().trim().max(500).optional(),
  Page_content: Joi.string().trim().optional(),
  Status: Joi.boolean().optional()
});

const getGlobalSearchByIdSchema = Joi.object({
  id: Joi.number().integer().required().messages({
    'any.required': 'ID is required',
    'number.base': 'ID must be a number'
  })
});

const queryGlobalSearchSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  Status: Joi.boolean().optional(),
  search: Joi.string().optional().allow('', null)
});

const searchGlobalContentSchema = Joi.object({
  q: Joi.string().trim().required().messages({
    'any.required': 'Search query is required',
    'string.empty': 'Search query cannot be empty'
  })
});

module.exports = {
  createGlobalSearchSchema,
  updateGlobalSearchSchema,
  getGlobalSearchByIdSchema,
  queryGlobalSearchSchema,
  searchGlobalContentSchema
};

