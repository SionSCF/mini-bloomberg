const { http } = require("winston");
const { supabaseAuth } = require("../config/supabase.auth");
const logger = require("../utils/logger");

async function signUp(req, res) {
  try {
    const { name, email, password } = req.body;

    const { data, error } = await supabaseAuth.auth.signUp({
      name,
      email,
      password,
    });

    if (error) throw error;

    return res.status(201).json({
      message: "Signup successful",
      data: { email: data.user.email },
    });
  } catch (err) {
    logger.error(`Signup error: ${err.message}`);
    return res.status(400).json(formatError(err));
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.warn(`Failed login attempt for ${email}: ${error.message}`);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = data.session.access_token;
  const isProd = process.env.NODE_ENV === "production";

  return res
    .cookie("auth_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(200)
    .json({
      message: "Login successful",
      data: {
        token,
        email: data.user.email,
      },
    });
}

module.exports = { signUp, login };
