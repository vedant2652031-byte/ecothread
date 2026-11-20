# EcoThread — Teen Action & Sustainable Style

EcoThread is a website that helps teenagers see the hidden cost of fast fashion and switch to thrifting, mending and swapping. It's a youth project for **UN Sustainable Development Goal 12: Responsible Consumption and Production** (Targets 12.5 and 12.8).

**Live site: [ecothread-nine.vercel.app](https://ecothread-nine.vercel.app)**

## What's on the site

| Tab | What it does |
|---|---|
| **The reality** | A five-piece haul builder (switch each garment between new and secondhand), a new-vs-thrifted price-tag decoder, myth-or-reality flip cards, what UN Target 12.5 means for your closet, and a live counter of what everyone using the site has done. |
| **Closet quiz** | Six questions with a live impact panel. You get a score, a yearly CO₂, water and spending estimate, three challenges and a shareable score card. |
| **Ask AI** | **Should I buy it?** runs the 30-wear test on anything you're about to buy and suggests secondhand alternatives. **Upcycle my old clothes** turns a photo of an old garment into three upcycling ideas linked to the site's guides. |
| **Mend & make** | Six step-by-step upcycling and mending projects, a fabric-tag decoder and garment-care tips. |
| **Swap hub** | A shared swap board with listings and swap requests, school meet-ups, a pledge wall, a "Host a school swap" checklist and a slow-fashion manifesto certificate. |
| **My closet** | Log your clothes, tap +1 each time you wear one, and track cost per wear and the impact you've avoided. |
| **Sources** | Every source, the garment numbers and the assumptions behind them. |

The whole site also works in **Hindi** (toggle in the header), **installs as an app** on phones and laptops, and **works offline** after the first visit.

## Honest numbers

- CO₂ and water only count as "avoided" when someone logs a secondhand piece or a finished swap. Quizzes, guides and pledges earn points but never count as savings.
- All figures come from one shared table in the code. Published figures are cited, and EcoThread's own estimates are labelled "estimate" on the site.
- The AI never produces carbon or water numbers. Those always come from EcoThread's sourced table.
- Main sources: UNEP, World Resources Institute, Ellen MacArthur Foundation (*A New Textiles Economy*, 2017), WWF, the Levi Strauss & Co. 501 jeans life-cycle assessment (2015), IUCN (2017) and Fashion for Good (*Wealth in Waste*, 2022).

## Files

| File | What it is |
|---|---|
| `index.html` | The whole website: HTML, CSS and JavaScript in one file. |
| `api/ai.js` | Vercel serverless function for the two AI tools. Keeps the AI key on the server. |
| `api/config.js` | Tells the page whether the shared Supabase board and AI are switched on. |
| `supabase/schema.sql` | Database tables and security rules for the shared swap board, pledges and impact counter. |
| `manifest.webmanifest`, `sw.js`, `icon-*.png` | Make the site installable and work offline. |

## Switch on the AI and the shared board

Everything works without these. They're switched on by adding environment variables in **Vercel → your project → Settings → Environment Variables**, then redeploying.

**AI tools**
1. Get an API key from [console.anthropic.com](https://console.anthropic.com).
2. Add `ANTHROPIC_API_KEY` with that key. (Optional: `AI_MODEL` to choose a different Claude model.)

**Shared swap board and live impact counter**
1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste all of `supabase/schema.sql`, and click **Run**.
3. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.
4. Add them in Vercel as `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

The anon key is designed to be public. The database's own rules let visitors read and add posts, but never edit or delete other people's. Only the device that posted a listing can mark it swapped or remove it. Phone numbers, emails and links are blocked in posts.

## Safety

The audience is teenagers, so the site blocks contact details in every post, suggests school meet-up spots only, labels all sample content as "Example", and never stores photos sent to the AI.

## Built with

Plain HTML, CSS and JavaScript (no frameworks), Google Fonts (Anybody, Atkinson Hyperlegible, Mukta), inline SVG illustrations, Vercel serverless functions, Supabase (Postgres) and Claude.
