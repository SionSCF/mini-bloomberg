const { supabaseUser } = require("../config/supabase.user");
const logger = require("../utils/logger");

function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  // Check cookies as fallback
  if (req.cookies?.auth_token) {
    return req.cookies.auth_token;
  }

  return null;
}

async function authMiddleware(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    logger.warn("No auth token provided");
    return res.status(401).json({ error: "Missing auth token" });
  }

  const supabase = supabaseUser(token);
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    logger.warn(`Invalid auth token: ${error?.message}`);
    return res.status(401).json({ error: "Invalid token" });
  }

  req.user = data.user;
  req.supabaseUser = supabase;
  next();
}

module.exports = { authMiddleware };
