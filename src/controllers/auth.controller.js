const { supabaseAuth } = require("../config/supabase.auth");
const logger = require("../utils/logger");

async function signUp(req, res) {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAuth.auth.signUp({
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

  return res.json({
    message: "Login successful",
    data: {
      token,
      email: data.user.email,
    },
  });
}

module.exports = { signUp, login };
