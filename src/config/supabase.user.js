const { createClient } = require("@supabase/supabase-js");

const supabaseUser = (jwt) => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${jwt}` },
      },
      auth: { persistSession: false },
    }
  );
};

module.exports = { supabaseUser };
