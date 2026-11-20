// Tells the page whether the shared Supabase board is switched on.
// The Supabase "anon" key is designed to be public; Row Level Security in supabase/schema.sql protects the data.
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "public, max-age=300");
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_ANON_KEY || "";
  res.status(200).json({
    supabaseUrl: url && key ? url.replace(/\/$/, "") : null,
    supabaseKey: url && key ? key : null,
    ai: !!process.env.ANTHROPIC_API_KEY
  });
};
