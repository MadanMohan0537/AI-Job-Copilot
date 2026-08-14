# AI Job Copilot

AI Job Copilot is Madan's local-first workspace for running a focused, evidence-based job search in the United States. It brings job discovery, fit evaluation, application materials, tracking, and interview preparation into one auditable workflow that can be operated from Codex, Claude Code, OpenCode, and other AI coding CLIs.

The goal is not to submit the largest possible number of applications. AI Job Copilot helps a candidate find strong matches, understand the tradeoffs, tailor truthful materials, and make the final decision themselves. It never clicks Submit, Send, or Apply without manual review.

## What it does

- Scans public ATS feeds and configured company career pages.
- Prioritizes US roles using configurable titles, locations, salary targets, and candidate preferences.
- Evaluates each job against the candidate's actual CV and stored proof points.
- Produces structured reports, ATS-friendly CVs, cover letters, and interview preparation.
- Tracks applications, replies, follow-ups, interviews, offers, and outcomes in human-readable files.
- Builds an offline HTML dashboard with no account, hosted service, or external database.
- Supports both interactive workflows and repeatable Node.js commands.

## Madan's direction and customizations

Madan maintains AI Job Copilot as a US-focused product built from an MIT-licensed foundation and extended for his intended workflow. The repository currently includes these project-specific decisions and additions:

- US-first market vocabulary and defaults, with non-US market mode sets removed.
- A Simplify.jobs provider for public internship and new-grad listings.
- Indeed discovery through the optional Apify integration rather than direct scraping.
- A dependency-free, self-contained HTML application dashboard via `npm run report:html`.
- English-only dashboard behavior and US-oriented portal examples.
- Multi-CLI entrypoints, including materialized Windows-compatible skill files.

These are customizations and maintained product choices, not a claim that every file was authored from scratch. See [Lineage and attribution](#lineage-and-attribution).

## Architecture at a glance

AI Job Copilot separates the reusable system from the candidate's private working data:

```text
Job sources -> data/pipeline.md -> evaluation modes + candidate profile
                                      |
                                      +-> reports/ (fit and risk analysis)
                                      +-> output/  (tailored documents)
                                      +-> data/applications.md (tracker)
                                                        |
                                                        +-> dashboard / follow-ups / interview prep
```

- `modes/` contains the AI workflow instructions and scoring rules.
- `providers/` and the scan scripts collect public job listings.
- `cv.md`, `config/profile.yml`, and `modes/_profile.md` are the evidence base for personalization.
- `data/`, `reports/`, `jds/`, and `output/` hold pipeline state and generated artifacts.
- Node.js scripts enforce deduplication, status consistency, liveness checks, and safe updates.
- `dashboard/` provides the optional Go terminal UI; `report-html.mjs` provides the offline browser dashboard.

The files remain the source of truth, so the workflow is inspectable and easy to version or back up. See [ARCHITECTURE.md](ARCHITECTURE.md) and [DATA_CONTRACT.md](DATA_CONTRACT.md) for details.

## Typical workflow

1. Add a CV and configure target roles, location, compensation, and deal-breakers.
2. Configure job sources in `portals.yml` and scan for new US roles.
3. Triage the queue and discard weak or stale matches early.
4. Evaluate a promising role against the candidate's documented experience.
5. Review the report and generated CV or cover letter; correct anything unsupported.
6. Apply manually, then update the tracker as replies and interviews arrive.
7. Use pipeline patterns, follow-up reminders, and interview preparation to improve the next decision.

## Safety and manual review

- Job posts, websites, and incoming messages are treated as untrusted data, not instructions.
- Candidate claims must come from the CV, profile, portfolio digest, or confirmed user input.
- Keywords may be reframed for relevance, but achievements and skills are never invented.
- Low-fit roles are discouraged instead of being pushed into a high-volume application queue.
- Application forms and messages may be drafted or prepared, but final submission stays with the user.
- The user-data layer is kept separate from updateable system files.

## Setup

Requirements: Node.js 18+, Git, and an AI coding CLI such as Codex or Claude Code. Go 1.21+ is optional for the terminal dashboard.

```bash
git clone https://github.com/MadanMohan0537/AI-Job-Copilot.git
cd AI-Job-Copilot
npm install
npx playwright install chromium
```

Open the repository in your AI CLI. On first use, the onboarding workflow checks for:

- `cv.md`
- `config/profile.yml`
- `modes/_profile.md`
- `portals.yml`

Ask the agent to help create these files from your real information. For manual setup, see [docs/SETUP.md](docs/SETUP.md).

## Common commands

```bash
npm run doctor          # check configuration
npm run scan            # scan configured sources
npm run verify          # validate pipeline integrity
npm run report:html     # build the offline dashboard
npm run tracker         # summarize application status
```

In Codex, plain-language requests work well: “Run AI Job Copilot scan mode,” “Evaluate this job with the auto-pipeline,” or “Summarize my tracker.” Existing `/career-ops` command aliases remain for compatibility with the underlying agent-skill conventions.

## US job sources

Core support includes public ATS and career-site sources such as Greenhouse, Ashby, Lever, Workday, SmartRecruiters, iCIMS, Rippling, and configured company pages. This repository also adds Simplify.jobs support and an optional Apify path for Indeed. Availability and site terms can change; use only sources you are authorized to access. See [docs/SUPPORTED_JOB_BOARDS.md](docs/SUPPORTED_JOB_BOARDS.md).

## Lineage and attribution

AI Job Copilot is maintained by [MadanMohan0537](https://github.com/MadanMohan0537). It is derived from [career-ops](https://github.com/santifer/career-ops) by Santiago Fernández de Valderrama and includes an offline dashboard adapted from [ai-job-search](https://github.com/MadsLorentzen/ai-job-search) by Mads Lorentzen. Both upstream projects use the MIT License.

The original MIT copyright notice is preserved in [LICENSE](LICENSE). Upstream project names may remain in compatibility commands, historical changelogs, source comments, tests, or references where changing them would obscure provenance or break behavior.

## License

MIT. See [LICENSE](LICENSE).
