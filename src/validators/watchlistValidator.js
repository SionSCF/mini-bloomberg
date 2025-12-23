const Joi = require("joi");

// Validator for watchlist entry
const watchlistSchema = Joi.object({
  symbol: Joi.string().uppercase().min(1).max(10).required(),
  active: Joi.boolean().default(true),
});

// Validator for adding to watchlist
const addToWatchlistSchema = Joi.object({
  symbol: Joi.string().uppercase().min(1).max(10).required(),
});

function validateWatchlist(data) {
  return watchlistSchema.validate(data, { abortEarly: false });
}

function validateAddToWatchlist(data) {
  return addToWatchlistSchema.validate(data, { abortEarly: false });
}

module.exports = {
  watchlistSchema,
  addToWatchlistSchema,
  validateWatchlist,
  validateAddToWatchlist,
};
