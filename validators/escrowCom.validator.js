const Joi = require('joi');

const nonEmptyObject = Joi.object().min(1).messages({
  'object.min': 'Payload must contain at least one field'
}).unknown(true);

const customerIdParamsSchema = Joi.object({
  customerId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required()
});

const listCustomerQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  offset: Joi.number().integer().min(0).optional(),
  email: Joi.string().email().optional(),
  name: Joi.string().optional()
}).unknown(true);

const transactionIdParamsSchema = Joi.object({
  transactionId: Joi.alternatives().try(Joi.number().integer(), Joi.string()).required()
});

const listTransactionQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).optional(),
  offset: Joi.number().integer().min(0).optional(),
  status: Joi.string().optional(),
  role: Joi.string().valid('buyer', 'seller', 'broker', 'lender', 'agent').optional()
}).unknown(true);

const actionSchema = Joi.object({
  action: Joi.string().required(),
  comments: Joi.string().optional(),
  metadata: Joi.object().optional()
}).unknown(true);

const messageSchema = Joi.object({
  subject: Joi.string().required(),
  body: Joi.string().required(),
  attachments: Joi.array().items(Joi.object()).optional()
}).unknown(true);

module.exports = {
  createTransactionSchema: nonEmptyObject,
  updateTransactionSchema: nonEmptyObject,
  transactionIdParamsSchema,
  listTransactionQuerySchema,
  actionSchema,
  messageSchema,
  createCustomerSchema: nonEmptyObject,
  customerIdParamsSchema,
  listCustomerQuerySchema
};


