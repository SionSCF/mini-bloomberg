const { createClient } = require("@supabase/supabase-js");
const { clean } = require("../utils/helpers");
const logger = require("../utils/logger");

const SUPABASE_URL = clean(
  process.env.SUPABASE_URL || process.env.SUPABASE_URL_RAW
);
const SUPABASE_KEY = clean(
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY
);

if (!SUPABASE_URL || !SUPABASE_KEY) {
  logger.warn(
    "\x1b[33mSupabase URL or Key not set. Supabase client will not be initialized.\x1b[0m"
  );
} else {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  logger.info("\x1b[32mSupabase client initialized.\x1b[0m");

  async function authMiddleware(req, res, next) {
    const token =
      req.headers["authorization"]?.replace("Bearer ", "") ||
      req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data.user;
    next();
  }
  module.exports = { supabase, authMiddleware };
}
