# Career Ops Upstream Parity

This repository is intentionally based on the Career Ops architecture while keeping AI Job Copilot's US-market positioning, standalone HTML analytics, and JD-first resume-tailoring rules.

## Parity audit — 2026-08-20

A fresh audit against `santifer/career-ops` confirmed that several capabilities previously thought to be missing are already present here, including:

- plugin framework and Gmail / Notion / Apify plugin implementations
- follow-up cadence and follow-up seeding
- application funnel statistics
- interview red-flag mode
- salary-gap analysis
- offer preparation
- repost detection
- funded-company discovery
- interview planning and debrief modes
- CV fact verification
- updater / rollback infrastructure

The remaining confirmed functional gaps from the comparison were implemented as part of this parity layer.

## Added capabilities

### Story provenance gate

`story-provenance-check.mjs` audits quantified claims in `interview-prep/story-bank.md` against the trusted `cv.md` source.

Statuses:

- `existing` — explicitly user-stated/source-marked or supported by matching quantified CV evidence
- `supportedByResume` — related CV context exists, but the exact numeric precision is not verified
- `derived-unverified` — quantified claim exists only in the story bank
- `user-cannot-confirm` — durable do-not-promote state

Commands:

```bash
npm run story:provenance
npm run story:provenance:strict
node story-provenance-check.mjs --summary
node story-provenance-check.mjs --json
node story-provenance-check.mjs --self-test
```

The strict form exits non-zero when unverified or unconfirmable quantified claims exist. Those numbers must never be promoted into a resume, cover letter, recruiter email, or interview answer as verified facts.

### Negotiation ROI

`negotiation-roi.mjs` turns a **verified quantified achievement** into a draft ROI-based negotiation talking point. It intentionally does not guess the wage basis or task frequency.

The safety boundary is conservative: a quantified story-bank claim is excluded unless the same figure and compatible unit are present in `cv.md`. For time-reduction claims, the script calculates:

`hours saved per occurrence × hourly wage × occurrences per year = estimated annual value`

Example:

```bash
npm run negotiation:roi -- --summary --wage 45 --frequency weekly
```

or supply an exact annual occurrence count:

```bash
npm run negotiation:roi -- --summary --wage 45 --occurrences 52
```

If the story itself contains a wage such as `$45/hr` or a cadence such as `weekly`, that source is used before the CLI fallback. Missing inputs remain uncalculable rather than being guessed. The output is a draft for human review; it does not claim that the achievement's business context automatically transfers to the target employer.

### Repository syntax lint

`scripts/check-syntax.mjs` recursively validates JavaScript module syntax using the active Node.js runtime while ignoring generated/vendor directories.

```bash
npm run lint
```

### Parity verification

```bash
npm run test:parity
```

This runs the provenance self-test, negotiation ROI self-test, and repository-wide JavaScript syntax validation.

## Intentional differences from upstream

These are not parity defects and should not be overwritten during future upstream synchronization:

1. **JD-first resume construction** — the job description is the primary writing specification; `cv.md` is the factual boundary rather than a wording template.
2. **120–140 word tailored professional summary** unless the user explicitly overrides it.
3. **Human-written resume language** with anti-buzzword constraints.
4. **Standalone HTML analytics dashboard** via `npm run report:html`.
5. **US-market focus** in project positioning and job-search defaults.

Future upstream imports should preserve `modes/_custom.md` and the fact-verification gate.
