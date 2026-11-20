// EcoThread AI endpoint (Vercel serverless function).
// Needs the environment variable ANTHROPIC_API_KEY. Optional: AI_MODEL.
// Two tools: "buy" (should I buy it?) and "stylist" (upcycle ideas from a photo).

const MODEL = process.env.AI_MODEL || "claude-haiku-5-5";
const GUIDE_IDS = ["g1", "g2", "g3", "g4", "g5", "g6"];
const TYPES = ["tee", "jeans", "hoodie", "jacket", "kurta", "knit", "skirt", "bag", "dress", "shoes", "other"];

const RULES = `You are EcoThread's sustainable-fashion helper for Indian teenagers (13-19) and a school SDG 12 project.
Stay strictly on clothing, thrifting, mending, upcycling and sustainable fashion. If the input is about anything else, or is unsafe, set "off_topic": true and leave the other fields short.
Be warm, practical and honest; never shame. Use rupees (₹) and things Indian teens can find (thrift markets, tailors, hand-me-downs, school swaps).
Never invent statistics. Do not give carbon or water numbers: the website calculates those from its own sourced table.
Reply with ONLY one JSON object, no markdown.`;

const BUY_FORMAT = `{"off_topic":false,"garment_type":"one of ${TYPES.join("|")}","fibre_guess":"short, e.g. 'likely polyester blend'","verdict":"skip|wait|go","headline":"max 12 words","reasons":["3 short reasons"],"alternatives":["3 specific secondhand, swap or mend alternatives"],"care_tip":"one sentence"}`;
const STYLIST_FORMAT = `{"off_topic":false,"not_clothing":false,"garment":"what you see, max 8 words","condition":"max 12 words","ideas":[{"title":"max 6 words","difficulty":"Beginner|Intermediate","time":"e.g. 20 min","steps":["3 to 5 short steps"],"guide_id":"one of ${GUIDE_IDS.join("|")} if it closely matches, else null"}]}`;
const GUIDES = "g1 tee to boxy crop (no-sew); g2 sashiko knee patch; g3 60-second thrift check; g4 sweatshirt to tote bag; g5 raw-edge hem for jeans; g6 kurta to cropped jacket";

// Best-effort rate limit per warm instance.
const hits = new Map();
function limited(ip) {
  const now = Date.now(), win = 60 * 60 * 1000, max = 25;
  const list = (hits.get(ip) || []).filter((t) => now - t < win);
  list.push(now); hits.set(ip, list);
  return list.length > max;
}

function clean(s, n) { return String(s || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n); }

function extractJSON(text) {
  const a = text.indexOf("{"), b = text.lastIndexOf("}");
  if (a < 0 || b < a) throw new Error("no json");
  return JSON.parse(text.slice(a, b + 1));
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "not_configured" });
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0] || "anon";
  if (limited(ip)) return res.status(429).json({ error: "rate_limited" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const lang = body.lang === "hi" ? "Write every text value in simple Hindi (Devanagari). Keep JSON keys and enum values in English." : "Write in simple English.";
  let content;

  if (body.mode === "buy") {
    const item = clean(body.item, 140);
    if (item.length < 3) return res.status(400).json({ error: "bad_input" });
    const price = Math.max(0, Math.min(100000, Number(body.price) || 0));
    const wears = Math.max(0, Math.min(1000, Number(body.wears) || 0));
    content = [{ type: "text", text: `${RULES}\n${lang}\nTask: a teen is thinking of buying this. Help them decide using the 30-wear test (would they wear it 30+ times?), the fibre, and secondhand alternatives.\nItem: "${item}"\nPrice: ${price ? "₹" + price : "not given"}\nTimes they expect to wear it: ${wears || "not given"}\nFormat: ${BUY_FORMAT}` }];
  } else if (body.mode === "stylist") {
    const media = ["image/jpeg", "image/png", "image/webp"].includes(body.mediaType) ? body.mediaType : null;
    const data = typeof body.image === "string" ? body.image : "";
    if (!media || data.length < 100 || data.length > 2_000_000) return res.status(400).json({ error: "bad_image" });
    const note = clean(body.note, 140);
    content = [
      { type: "image", source: { type: "base64", media_type: media, data } },
      { type: "text", text: `${RULES}\n${lang}\nTask: look at this photo of an old garment and suggest exactly 3 realistic upcycling or restyling ideas a teen can do at home with basic tools. If the photo shows no clothing, set "not_clothing": true and return an empty ideas list. Never describe or comment on any person in the photo.\nTheir note: "${note || "none"}"\nSite guides you can link: ${GUIDES}\nFormat: ${STYLIST_FORMAT}` }
    ];
  } else {
    return res.status(400).json({ error: "bad_mode" });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, messages: [{ role: "user", content }] })
    });
    if (!r.ok) return res.status(502).json({ error: "upstream", status: r.status });
    const j = await r.json();
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    return res.status(200).json(extractJSON(text));
  } catch (e) {
    return res.status(502).json({ error: "failed" });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: "3mb" } } };
