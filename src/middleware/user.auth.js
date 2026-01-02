const { supabaseUser } = require("../config/supabase.user");

async function authMiddleware(req, res, next) {
  const token = req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ error: "Unauthenticated" });
  }

  const supabase = supabaseUser(token);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return res.status(401).json({ error: "Invalid session" });
  }

  req.user = data.user;
  req.supabaseUser = supabase;

  next();
}
module.exports = { authMiddleware };
