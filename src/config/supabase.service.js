const { createClient } = require("@supabase/supabase-js");

const supabaseService = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
);

module.exports = { supabaseService };
