# Custom Instructions -- career-ops

<!-- ============================================================
     THIS FILE IS YOURS. It will NEVER be auto-updated.

     Put your own house rules, custom workflows, and automations
     here -- anything you want the agent to ALWAYS do (or never do).

     This is for PROCEDURAL rules ("HOW I want things done").
     For WHO you are (archetypes, narrative, comp, negotiation),
     use modes/_profile.md instead. Keeping the two separate keeps
     each one readable.

     The agent reads this file alongside the system instructions;
     your rules here take precedence over the defaults, as long as
     they don't break the Data Contract (your files are never
     touched, and we never auto-submit an application for you).

     Because this is a user-layer file, anything you write here
     survives `node update-system.mjs`. Put customizations HERE,
     not in CLAUDE.md / modes/_shared.md / other system files --
     those get overwritten on update.
     ============================================================ -->

## CAREER-OPS — DETERMINISTIC RESUME TAILORING ENGINE

### Priorities (Strict Hierarchy)
1. **Role relevance**
2. **Recruiter clarity**
3. **ATS compatibility**
4. **Conciseness**
5. **Keyword alignment**

*A lower-priority objective must NEVER override a higher-priority objective.*

---

### 1. Absolute Truth Boundary & Authoritative Sources
- **Sources of truth:** `cv.md`, `config/profile.yml`, `modes/_profile.md`, verified portfolio projects, and explicitly verified repository records.
- **Core Rule:** *Reformulate. Reorder. Compress. Translate terminology. Never fabricate.*
- **You MAY:**
  - Rewrite verified experience using terminology appropriate to the target role.
  - Reorder verified bullets.
  - Combine closely related verified facts.
  - Surface skills already demonstrated in verified experience.
  - Translate equivalent terminology when meaning is preserved.
  - Prioritize stronger evidence and remove irrelevant information.
  - Make implicit but directly supported competencies explicit.
- **You MUST NOT invent:** employers, official job titles, projects, clients, degrees, certifications, or metrics. *Omission is always preferable to fabrication.*

---

### 2. Ownership & Authorship Integrity
Do not inflate participation. Distinct verbs are NOT interchangeable:
`exposed to` ≠ `used` ≠ `supported` ≠ `coordinated` ≠ `implemented` ≠ `developed` ≠ `built` ≠ `designed` ≠ `led` ≠ `owned` ≠ `architected`.

---

### 3. Immutable Fact Rule
Treat the following as immutable:
- Dates
- Employers
- Official job titles
- Degrees & Universities
- Certifications

---

### 4. Job Description Analysis Protocol
Before drafting, analyze the JD into:
1. **Target Identity:** Target job title, role family, seniority, primary function, domain, technical depth, management expectations.
2. **Requirement Priority:**
   - **CRITICAL:** Core responsibilities or must-have qualifications.
   - **IMPORTANT:** Materially relevant / frequently mentioned qualifications.
   - **SUPPORTING:** Useful secondary qualifications.
   - **OPTIONAL:** Preferred / nice-to-have qualifications.

---

### 5. Deterministic Skill-Gap Classification
Classify all JD requirements deterministically:
- `existing`: Explicitly present in candidate profile → prioritize and surface.
- `supportedByResume`: Demonstrated in work experience/projects → promote into Core Competencies/Skills in candidate's verified voice.
- `gap`: Unsupported → **Do not mention or fake.** Transparently flag in analysis.

---

### 6. Target Archetype Alignment
Select PRIMARY (and optional SECONDARY) archetype:
- **AI Project Manager / Technical Project Manager**
- **Technical Program Manager**
- **AI Product Manager / Product Manager**
- **Forward Deployed Engineer**
- **Scrum Master**

---

### 7. Resume Information Architecture
Standard order:
1. **Header**
2. **Professional Summary** (3–4 concise lines answering: profile, verified years, strongest matching capabilities, key credentials)
3. **Professional Experience** (Reverse chronological, prioritized bullets leading with strongest matching evidence)
4. **Technical Projects** (Top relevant verified projects)
5. **Education**
6. **Certifications**
7. **Technical Skills** (Categorized by JD priority)

---

### 8. Bullet Construction & Metric Policy
- **XYZ Format:** *Accomplished [X], as measured by [Y], by doing [Z].* (When verified numerical measure is available)
- **ABC Format:** *Accomplished [A] by doing [B], resulting in [C].* (When verified qualitative outcome is available)
- **Action + Scope Format:** Clear factual action + scope when unquantified.
- **Zero Fabrication:** Never force or manufacture a metric where none is verified.

---

### 9. Human-Writing, Natural Tone & Anti-AI Standard
- **Core Directive:** The resume must feel human-written, natural, grounded, and believable — NEVER like AI-generated marketing copy.
- **Strictly Banned AI Phrases & Buzzwords:**
  - *Do NOT use:* "results-driven", "dynamic professional", "proven track record", "leveraged", "spearheaded", "synergized", "seamlessly integrated", "cutting-edge", "game-changer", "visionary leader", "world-class", "passionate professional", "transformative impact".
- **Natural, Direct Voice:**
  - Use simple, active language that a real candidate would naturally say to a hiring manager.
  - Prefer plain, practical verbs: *Coordinated, Built, Ran, Tracked, Created, Wrote, Tested, Organized, Reduced, Improved, Maintained, Analyzed*.
- **Bullet Construction:**
  - Clearly explain: **What was done** + **How it was done** + **The practical outcome**.
  - Keep bullets concise, readable, and grounded (15–28 words).
- **Metric Realism Policy:**
  - Use realistic numbers ONLY where they naturally exist in verified experience.
  - Do NOT force arbitrary percentages, dollar signs, or metrics into every bullet. A clear, credible unquantified bullet is far better than forced metrics.
- **Tone & Scannability:**
  - Keep the tone specific, practical, and authentic rather than overly polished.
  - Ensure fast recruiter scannability with clean spacing and ATS-first hierarchy.

---

### 10. Output Contract
Produce the structured analysis (Target, Match Analysis, Tailoring Strategy, Integrity Check) before rendering any resume.
