# EcoThread — Teen Action & Sustainable Style

EcoThread is a website that helps teenagers see the hidden cost of fast fashion and switch to thrifting, mending and swapping. It's a youth project for **UN Sustainable Development Goal 12: Responsible Consumption and Production** (Targets 12.5 and 12.8).

The whole site is one file, `index.html`. It needs no install or build step.

## What's on the site

| Tab | What it does |
|---|---|
| **The reality** | A five-piece haul builder (switch each garment between new and secondhand), a new-vs-thrifted price-tag decoder, myth-or-reality flip cards, and what UN Target 12.5 means for your closet. |
| **Closet quiz** | Six questions with a live impact panel. You get a score, a yearly CO₂, water and spending estimate, three challenges and a shareable score card. |
| **Mend & make** | Six step-by-step upcycling and mending projects, a fabric-tag decoder and garment-care tips. |
| **Swap hub** | A swap board with listings and swap requests, school meet-ups, a pledge wall, a "Host a school swap" checklist and a slow-fashion manifesto certificate. |
| **My closet** | Log your clothes, tap +1 each time you wear one, and track cost per wear and the impact you've avoided. |
| **Sources** | Every source, the garment numbers and the assumptions behind them. |

## Honest numbers

- CO₂ and water only count as "avoided" when someone logs a secondhand piece or a finished swap. Quizzes, guides and pledges earn points but never count as savings.
- All figures come from one shared table in the code. Published figures are cited, and EcoThread's own estimates are labelled "estimate" on the site.
- Main sources: UNEP, World Resources Institute, Ellen MacArthur Foundation (*A New Textiles Economy*, 2017), WWF, the Levi Strauss & Co. 501 jeans life-cycle assessment (2015), IUCN (2017) and Fashion for Good (*Wealth in Waste*, 2022).

## Run it

Open `index.html` in any browser.

## Put it online

- **GitHub Pages:** in this repo, go to **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then save. The site appears at `https://<your-username>.github.io/<repo-name>/`.
- **Netlify:** drag `index.html` onto [app.netlify.com/drop](https://app.netlify.com/drop).

Progress is saved in each visitor's browser (`localStorage`). Outside Claude's hosting, the Swap Hub runs in demo mode, so posts stay on each person's own device. A shared board for a whole school would need a backend such as Supabase.

## Built with

Plain HTML, CSS and JavaScript, Google Fonts (Anybody and Atkinson Hyperlegible), and inline SVG illustrations. No frameworks.
