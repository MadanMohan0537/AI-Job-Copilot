# my-career-ops

An AI-powered job search pipeline, scoped to the **United States** job market. This is a personal fork of [career-ops](https://github.com/santifer/career-ops) by [santifer](https://github.com/santifer), with an offline dashboard adapted from [ai-job-search](https://github.com/MadsLorentzen/ai-job-search) by [Mads Lorentzen](https://github.com/MadsLorentzen). Both originals are MIT-licensed; see [Credits & lineage](#credits--lineage) below.

It runs on any AI coding CLI that follows the [open agent skill standard](https://agentskills.io) — Claude Code, Codex, OpenCode, Antigravity CLI, Grok Build CLI, Qwen, Kimi, GitHub Copilot — and handles the full loop: scanning job boards, evaluating fit, generating a tailored CV/cover letter, tracking applications, and prepping for interviews. Nothing is ever auto-submitted — every application is reviewed by you before it goes out.

## What's different from upstream career-ops

- **US-only by default.** The 16 non-English market-vocabulary mode sets (`modes/{lang}/`), non-English README translations, and non-US rows in the jurisdiction reference tables (restrictive covenants, protected-grounds interview questions, agency licensing, immigration-status overreach, prohibited content) have been removed. Non-US companies pre-seeded in `templates/portals.example.yml` are disabled by default (not deleted — flip `enabled: true` if you want them back).
- **Two more US job sources:**
  - [**Simplify.jobs**](https://simplify.jobs) — a new `provider: simplify` reads the [SimplifyJobs](https://github.com/SimplifyJobs) open-source new-grad/internship listings feed (zero-auth, public JSON).
  - **Indeed** — wired through the existing `plugins/apify` bridge (`misceres/indeed-scraper` actor), since Indeed has no public API and its ToS prohibit direct scraping. Requires your own [Apify](https://apify.com) token; see the example in `templates/portals.example.yml`.
  - Greenhouse, Ashby, Lever, Workday, and arbitrary company career pages were already fully supported upstream — no changes needed there.
- **An offline HTML dashboard** (`node report-html.mjs` / `npm run report:html`) as a dependency-free alternative to the Go/Bubble Tea TUI dashboard, for anyone who doesn't have Go installed. Same status/funnel math as the TUI, just rendered to a single self-contained `reports/application-dashboard.html` file — inline SVG charts, no CDN, no server.
- The Go dashboard's `--lang` flag and Turkish/Spanish UI catalogs were removed (English-only).

Everything else — the evaluation rubric, CV/cover-letter generation, application tracker, interview prep, batch processing — is unchanged from upstream.

## Setup

```bash
git clone https://github.com/MadanMohan0537/my-career-ops.git
cd my-career-ops
npm install
npx playwright install chromium   # if the postinstall step didn't already do this
```

Then open the project with your AI CLI of choice (e.g. `claude` for Claude Code) and it will walk you through onboarding: importing your CV, setting your profile (name, location, target roles, salary range), and seeding `portals.yml` from the template. See [`AGENTS.md`](AGENTS.md) for the full onboarding flow and [`docs/SETUP.md`](docs/SETUP.md) for manual setup details.

**Using Codex?** Root [`CODEX.md`](CODEX.md) is a thin wrapper importing `AGENTS.md`, same as every other supported CLI. Start it in the repo root with `codex`; Codex may not expose a native `/career-ops` slash command, so ask for the workflow in plain language instead (e.g. "Run the career-ops scan mode and summarize new matches"). For one-shot or batch runs, use `codex exec "Evaluate this JD with career-ops auto-pipeline: https://company.com/jobs/123"`. Full guide: [`docs/CODEX.md`](docs/CODEX.md).

To scan for new roles: ask your CLI to run `scan` mode, or `node scan.mjs` directly. To generate the offline dashboard at any point: `npm run report:html`.

## Job sources

See [`docs/SUPPORTED_JOB_BOARDS.md`](docs/SUPPORTED_JOB_BOARDS.md) for the full list of supported ATS platforms and job boards. Highlights for a US search: Greenhouse, Ashby, Lever, Workday, SmartRecruiters, iCIMS, Rippling, and the two additions above (Simplify.jobs, Indeed via Apify).

## Credits & lineage

- **[career-ops](https://github.com/santifer/career-ops)** by Santiago Fernández de Valderrama ([santifer](https://santifer.io)) — the base this fork is built on. MIT licensed; original copyright notice preserved in [`LICENSE`](LICENSE).
- **[ai-job-search](https://github.com/MadsLorentzen/ai-job-search)** by Mads Lorentzen — `report-html.mjs`'s offline dashboard design is adapted from its `/html-report` command. MIT licensed.

If you want full multi-market coverage (not just the US) or career-ops's latest upstream features, use [santifer/career-ops](https://github.com/santifer/career-ops) directly.

## License

MIT — see [`LICENSE`](LICENSE).
