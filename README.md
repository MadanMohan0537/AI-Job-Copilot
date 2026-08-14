# AI Job Copilot

An AI-powered job search pipeline built for the **United States** job market. It runs on any AI coding CLI that follows the [open agent skill standard](https://agentskills.io) — Claude Code, Codex, OpenCode, Antigravity CLI, Grok Build CLI, Qwen, Kimi, GitHub Copilot — and handles the full loop: scanning job boards, evaluating fit, generating a tailored CV/cover letter, tracking applications, and prepping for interviews. Nothing is ever auto-submitted — every application is reviewed by you before it goes out.

## What it does

- **Scans job boards for US roles**, including Greenhouse, Ashby, Lever, Workday, SmartRecruiters, iCIMS, Rippling, [Simplify.jobs](https://simplify.jobs) (new-grad/internship listings), and Indeed (via an [Apify](https://apify.com) actor bridge — bring your own token, since Indeed has no public API). See [`docs/SUPPORTED_JOB_BOARDS.md`](docs/SUPPORTED_JOB_BOARDS.md) for the full list.
- **Evaluates fit** against your profile and target roles before you spend time on an application.
- **Generates a tailored CV and cover letter** per role.
- **Tracks every application** in a markdown tracker, with an offline HTML dashboard (`npm run report:html`) — self-contained, inline charts, no server, no external dependencies.
- **Preps you for interviews** with company research and practice questions.

## Setup

```bash
git clone https://github.com/MadanMohan0537/AI-Job-Copilot.git
cd AI-Job-Copilot
npm install
npx playwright install chromium   # if the postinstall step didn't already do this
```

Then open the project with your AI CLI of choice (e.g. `claude` for Claude Code) and it will walk you through onboarding: importing your CV, setting your profile (name, location, target roles, salary range), and seeding `portals.yml` with companies to track. See [`AGENTS.md`](AGENTS.md) for the full onboarding flow and [`docs/SETUP.md`](docs/SETUP.md) for manual setup details.

**Using Codex?** Start it in the repo root with `codex`; if it doesn't expose a native slash command, ask for the workflow in plain language instead (e.g. "Run the scan mode and summarize new matches"). For one-shot or batch runs: `codex exec "Evaluate this JD: https://company.com/jobs/123"`. Full guide: [`docs/CODEX.md`](docs/CODEX.md).

To scan for new roles: ask your CLI to run scan mode, or `node scan.mjs` directly. To generate the offline dashboard at any point: `npm run report:html`.

## License

MIT — see [`LICENSE`](LICENSE).
