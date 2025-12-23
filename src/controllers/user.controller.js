const { formatError } = require("../utils/errorFormatter");
const { supabase, authMiddleware } = require("../config/supabase");

async function signUp(req, res) {
  try {
    // Implementation for user sign-up
    const { data, error } = await supabase.auth.signUp({
      email: req.body.email,
      password: req.body.password,
    });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json(formatError(err));
  }
}

async function login(req, res) {
  // Implementation for user login
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: req.body.email,
      password: req.body.password,
    });
    if (error) {
      res.status(401).json(formatError(error));
      return;
    }

    const token = data.session.access_token;

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }); // 7 days
    return res.json({
      message: "Login successful",
      data: {
        email: data.user.email,
        full_name: data.user.user_metadata.full_name,
      },
    });
  } catch (err) {
    res.status(500).json(formatError(err));
  }
}

module.exports = { signUp, login };
