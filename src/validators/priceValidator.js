const Joi = require("joi");
const pricesBatchSchema = Joi.array().items(priceSchema).min(1).required();

// Validator for a single price record
const priceSchema = Joi.object({
  symbol: Joi.string().uppercase().min(1).max(10).required(),
  date: Joi.date().required(),
  open: Joi.number().positive().required(),
  high: Joi.number().positive().required(),
  low: Joi.number().positive().required(),
  close: Joi.number().positive().required(),
  volume: Joi.number().integer().min(0).required(),
});

function validatePrice(data) {
  return priceSchema.validate(data, { abortEarly: false });
}

function validatePricesBatch(data) {
  return pricesBatchSchema.validate(data, { abortEarly: false });
}

module.exports = {
  priceSchema,
  pricesBatchSchema,
  validatePrice,
  validatePricesBatch,
};
