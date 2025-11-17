const Joi = require('joi');

const nonEmptyObject = Joi.object().min(1).messages({
  'object.min': 'At least one field is required',
  'any.required': 'Payload is required'
}).unknown(true);

const asCustomerSchema = Joi.string().email().message('asCustomer must be a valid email address');

const customerIdParamsSchema = Joi.object({
  customerId: Joi.string().required()
});

const transactionIdParamsSchema = Joi.object({
  transactionId: Joi.string().required()
});

const createCustomerSchema = nonEmptyObject;
const updateCustomerSchema = nonEmptyObject;
const createTransactionSchema = nonEmptyObject;
const updateTransactionSchema = nonEmptyObject;

const listTransactionQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).optional(),
  offset: Joi.number().integer().min(0).optional(),
  status: Joi.string().optional(),
  asCustomer: asCustomerSchema.optional()
}).unknown(true);

const asCustomerQuerySchema = Joi.object({
  asCustomer: asCustomerSchema.optional()
}).unknown(true);

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamsSchema,
  createTransactionSchema,
  updateTransactionSchema,
  transactionIdParamsSchema,
  listTransactionQuerySchema,
  asCustomerQuerySchema
};


