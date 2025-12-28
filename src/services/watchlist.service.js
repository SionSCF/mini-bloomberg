const WatchlistModel = require("../models/watchlist.model");

// User-specific watchlist operations
exports.checkExists = async (supabaseUser, symbol, user) => {
  const exists = await WatchlistModel.check(supabaseUser, symbol, user.id);
  return exists;
};

exports.addToList = async (supabaseUser, symbol, user) => {
  const checkExists = await WatchlistModel.check(supabaseUser, symbol, user.id);
  if (checkExists) {
    throw new Error("Oops! This symbol is already in your watchlist.");
  }

  const add = await WatchlistModel.add(supabaseUser, symbol, user.id);
  return add;
};

exports.removeSymbol = async (supabaseUser, symbol, user) => {
  const remove = await WatchlistModel.remove(supabaseUser, symbol, user.id);
  return remove;
};

exports.listActiveSymbols = async (supabaseUser, user) => {
  const list = await WatchlistModel.list(supabaseUser, user.id);
  return list;
};

// For auto sync service
exports.retrieveListForAutoSync = async (supabaseService) => {
  const list = await WatchlistModel.retrieveListForAutoSync(supabaseService);
  return list;
};
