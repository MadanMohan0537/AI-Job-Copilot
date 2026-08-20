# Custom Career-Ops Rules

These rules override conflicting defaults in the Career Ops modes. They apply to `auto-pipeline`, `pdf`, `latex`, `latex-tex`, `oferta`, `pipeline`, `batch`, and any other mode that generates or proposes resume content.

## Resume Tailoring Strategy — JD First

Treat the **job description as the primary writing specification** for every tailored resume.

Do **not** begin tailoring by mapping each JD requirement to an existing resume bullet or by requiring literal resume evidence for every JD phrase before rewriting the resume. Do not use `existing`, `supportedByResume`, or `gap` classification as the writing plan for the resume. A skill-gap utility may still be used as a diagnostic, but it must not control the structure or wording of the tailored resume.

The tailoring flow is:

1. Read the complete JD and identify the role's core responsibilities, required capabilities, recurring terminology, success measures, seniority, and the 10-20 most important ATS/recruiter keywords.
2. Build an internal picture of the ideal candidate for this specific JD.
3. Use the candidate's resume/profile only to preserve factual identity and factual boundaries.
4. Write a fresh Professional Summary for the target JD.
5. Rebuild the presentation of each relevant role around the JD's responsibilities and terminology.
6. Rewrite, reorder, expand, condense, or combine bullets so the experience reads naturally for the target role rather than like a lightly edited source resume.
7. Select and reorder projects and skills according to JD relevance.
8. Run the existing fact-verification gate before PDF rendering.

### What `cv.md` is for

`cv.md` is a **fact source**, not the writing template.

Preserve factual anchors such as:
- employer/company names
- actual job titles
- employment dates and duration
- education and certifications
- real projects
- verified technologies/tools
- verified metrics, percentages, revenue, user counts, team sizes, and other numbers
- factual scope that would materially change the truth of the candidate's experience

Do not preserve weak wording merely because it appears in `cv.md`. The wording, emphasis, order, bullet construction, section balance, and narrative should be rebuilt for the JD.

### Experience bullets

For each relevant role, create bullets **from the target JD outward**.

- Identify the JD responsibilities that should be visible in that role.
- Express the candidate's real work using the JD's vocabulary and framing.
- Prefer concrete, human-written bullets with action + context + outcome when verified outcomes exist.
- It is acceptable for the tailored bullets to look substantially different from the source bullets.
- Do not require a source bullet to contain the same keyword before using the JD concept.
- Do not produce a requirement-to-resume-evidence table as a prerequisite for writing the resume.
- Do not mechanically mirror every JD bullet; synthesize overlapping responsibilities into natural resume bullets.
- Avoid AI-sounding filler and inflated verbs such as `spearheaded`, `orchestrated`, `leveraged`, `championed`, `results-driven`, `visionary`, or `dynamic` unless they are genuinely natural in context.

Example behavior:

- JD emphasizes fraud monitoring, SQL analysis, risk metrics, dashboards, experimentation, and cross-functional product work.
- A relevant Product Manager role should be rewritten so its bullets foreground those themes where consistent with the candidate's actual scope.
- The system should not first search for an exact pre-existing bullet that says `fraud monitoring` before deciding whether the role can be framed around risk/product analytics work.

### Professional Summary

Write the summary fresh from the JD rather than editing the old summary line by line.

- Keep the existing 120-140 word requirement unless another explicit user rule overrides it.
- State the target role and domain clearly.
- Use the JD's highest-value terminology naturally.
- Use factual candidate anchors for years/scope, industries, products, outcomes, or technical depth.
- Make the summary read like a thoughtful human wrote it, not an ATS keyword paragraph.

### Skills and projects

- Order skills according to the JD.
- Use the JD's terminology for genuinely possessed skills, even if `cv.md` used a synonymous phrase.
- Select the 3-4 projects that best support the target role.
- Reframe project descriptions around the JD's problem space and responsibilities while preserving project facts.
- Do not invent a technology, credential, project, metric, employer, title, or domain experience solely because the JD mentions it.

## Truth Boundary

JD-first tailoring does **not** mean fabricating experience.

Never invent or alter:
- company/employer
- job title
- dates/duration
- degree/certification
- project existence
- tool/technology actually used
- metric or numerical result
- team size
- customer count
- revenue/value
- ownership or responsibility that would materially misrepresent what the candidate actually did

The JD controls **how the experience is written and prioritized**. The candidate data controls **what facts may be claimed**.

If a JD asks for something the candidate clearly did not do, do not manufacture the missing fact. Instead, leave the unsupported hard fact out of the resume and make the rest of the resume as aligned as possible.

## Story-Bank Provenance Gate

`interview-prep/story-bank.md` is useful context, but AI-generated or accumulated interview stories are **not automatically equivalent to user-authored facts**.

Before reusing a quantified claim from the story bank in a resume, cover letter, recruiter email, application answer, or interview talk track, run:

```bash
node story-provenance-check.mjs --summary
```

For a strict check, use:

```bash
node story-provenance-check.mjs --strict
```

Interpret the statuses as follows:

- `existing` — safe to reuse as a quantified claim, subject to normal fact verification.
- `supportedByResume` — the surrounding experience is supported, but the exact numeric precision is not verified. Use narrative wording unless the user confirms the number.
- `derived-unverified` — do not present the number as fact. Ask the user to confirm/correct it or remove the quantification.
- `user-cannot-confirm` — durable do-not-promote state. Never turn the number back into a factual claim just because it appears in later generated material.

The confirmation UX must not pressure the user into guessing. Offer four neutral outcomes: confirm as stated, provide the correct figure, keep it narrative-only, or mark `user-cannot-confirm`.

This provenance gate complements `verify-cv-facts.mjs`; it does not weaken the JD-first resume strategy.

## Evaluation / Customization Output

When `oferta` or `auto-pipeline` produces a resume customization plan, replace the default literal `JD requirement -> exact CV line` approach with a **JD-first construction plan**.

Preferred table:

| JD priority | Resume section to emphasize | Tailoring direction |
|---|---|---|
| Highest-priority responsibility | Summary / relevant role / project | How the resume should be written to foreground it |

Focus on:
- what the company is hiring for
- which themes must dominate the resume
- which roles/projects should carry those themes
- which keywords should appear naturally
- which sections should be reordered or rewritten

Do not make literal evidence matching the center of the tailoring process.

## Final Quality Gate

Before rendering the PDF, verify:

1. The resume reads as if it was written for this exact JD.
2. The top third makes the target role and strongest JD alignment obvious within seconds.
3. Bullet wording is natural and varied.
4. JD terminology is distributed across Summary, Experience, Projects, and Skills without keyword stuffing.
5. The resume is not merely the source CV with synonyms swapped in.
6. Immutable factual anchors remain correct.
7. Any quantified claim originating in the interview story bank has passed the provenance gate or has been rewritten without unverified quantification.
8. `verify-cv-facts.mjs` still passes before final PDF generation.
