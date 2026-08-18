import { chromium } from 'playwright';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, join } from 'path';

const ROOT = 'C:/Users/madan/my-career-ops';
const OUTPUT_DIR = join(ROOT, 'output');
const HTML_TMP_DIR = join(OUTPUT_DIR, 'html_tmp');
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
if (!existsSync(HTML_TMP_DIR)) mkdirSync(HTML_TMP_DIR, { recursive: true });

const citiBullets = [
  "Managed delivery for three concurrent technology initiatives across engineering, machine learning, product, and QA teams, coordinating prompt testing, LLM evaluation, and RAG data workflows across all active project delivery teams.",
  "Built automated project dashboards in Jira and Slack for VP stakeholders, providing weekly updates on milestones, risks, and blockers, which reduced ad hoc status-check requests by 10% across active projects.",
  "Ran Agile Scrum ceremonies, sprint planning, and weekly backlog refinement sessions with development teams, resolving workflow bottlenecks and cutting overall project delivery timelines by 12% across our core software releases.",
  "Led cross-functional teams of up to 12 members across product, engineering, and QA, managing daily scope trade-offs and resolving schedule conflicts to keep delivery on schedule for key banking initiatives."
];

const antsBullets = [
  "Managed software development and cloud migration projects for consulting clients, taking client projects from initial requirements gathering and technical scoping through development, testing, release coordination, and final client project sign-off.",
  "Ran 6 sprints and co-facilitated 8 sprints with a senior project manager, tracking team velocity, burndown charts, and sprint backlog items to deliver 2 of 3 client releases on time.",
  "Created standard project intake templates and ran structured kickoff workshops to replace ad hoc email planning, which reduced new client project onboarding time from 2 weeks down to 8 days.",
  "Wrote SQL data validation queries and led user acceptance testing for data pipelines, checking database test results against business requirements to verify data accuracy before releasing to client production environments."
];

const navisiteBullets = [
  "Supported senior project managers in planning and tracking software development tasks, maintaining project schedules, monitoring team deadlines, and coordinating deliverables across engineering teams to keep client work on track daily.",
  "Facilitated daily sprint standups and retrospective meetings while writing user stories and clear acceptance criteria for technical infrastructure projects, helping the engineering team improve sprint predictability and milestone project delivery.",
  "Built weekly operational health reports from historical vendor performance data, giving senior management clear visibility into technical project KPIs and metrics to support ongoing staffing and resource allocation team decisions."
];

const resumes = [
  {
    slug: "cv-madan-mohan-ch-master",
    title: "Project Manager · AI & Data Initiatives",
    companyHeader: "",
    summary: "Project Manager with 3+ years of experience delivering customer-facing technology, AI, and data initiatives in enterprise and consulting environments. Currently supporting LLM evaluation, prompt testing frameworks, and RAG data workflows at Citi across engineering, ML, and product teams. Hands-on technical builder with a Master’s in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, experienced in developing full-stack AI tools, SQL data pipelines, and REST APIs. CAPM-certified with a track record of standardizing project intake, managing sprint cadences, and building automated Jira status dashboards for executive stakeholders.",
    competencyPillars: [
      { label: "Technical & AI Delivery", items: "LLM Evaluation, Prompt Testing, RAG Workflows, SQL Data Validation, Azure Data Engineering (DP-700), REST APIs, Full-Stack Prototyping" },
      { label: "Project & Program Management", items: "Agile Scrum, Sprint Planning, Backlog Refinement, RICE Prioritization, RAID Logs, Intake Standardization, Release Management" },
      { label: "Stakeholder & Operations", items: "Executive Status Dashboards, Jira & Slack Automation, Risk Mitigation, UAT Coordination, Vendor KPI Reporting" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-openai-tpm-ai-safety",
    title: "Technical Program Manager, AI Safety & Safeguards",
    companyHeader: "OpenAI",
    summary: "Technical Program Manager with 3+ years of experience delivering customer-facing technology, AI, and data initiatives in enterprise environments. Currently supporting production LLM evaluation, prompt testing frameworks, and RAG workflows at Citi across engineering, ML, product, and risk teams. Hands-on technical builder with a Master’s in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, experienced in model guardrails, evaluation pipelines, and REST APIs. CAPM-certified with expertise in managing sprint cadences, tracking complex cross-team dependencies, and building automated Jira status dashboards for executive stakeholders.",
    competencyPillars: [
      { label: "AI Safety & Technical Delivery", items: "LLM Evaluation, Prompt Testing, RAG Workflows, Model Safeguards, Azure Data Engineering (DP-700), REST APIs" },
      { label: "Program & Sprint Governance", items: "Agile Scrum, Sprint Planning, Backlog Refinement, Cross-Functional Execution, RAID Logs, Release Management" },
      { label: "Stakeholder & Risk Management", items: "Executive Status Dashboards, Jira & Slack Automation, Risk Mitigation, UAT Coordination, Technical Trade-Offs" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-anthropic-fde",
    title: "Forward Deployed Engineer",
    companyHeader: "Anthropic",
    summary: "Forward Deployed Engineer and Technical Project Manager with 3+ years of experience delivering customer-facing technology, AI, and data initiatives in enterprise and consulting environments. Currently supporting LLM evaluation, prompt testing, and RAG workflows at Citi across engineering, ML, and product teams. Hands-on technical builder with a Master’s in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, experienced in developing full-stack GenAI applications (Briefly PRD AI, SprintForge), SQL data validation, and cloud APIs. CAPM-certified with a track record at Ants Corp standardizing client intake and accelerating onboarding from 2 weeks down to 8 days.",
    competencyPillars: [
      { label: "Enterprise AI & Technical Delivery", items: "LLM Evaluation, Prompt Testing, RAG Workflows, SQL Data Validation, Azure Data Engineering (DP-700), Full-Stack Prototyping" },
      { label: "Client Engineering & Engagements", items: "Technical Discovery, Client Scoping, Intake Standardization, Rapid Prototyping, UAT Coordination, Release Delivery" },
      { label: "Project & Sprint Management", items: "Agile Scrum, Sprint Planning, Backlog Refinement, Jira Status Dashboards, Cross-Functional Team Leadership, RAID Logs" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-openai-tpm-enterprise",
    title: "Technical Program Manager, Enterprise",
    companyHeader: "OpenAI",
    summary: "Technical Program Manager with 3+ years of experience delivering customer-facing enterprise software, cloud migrations, and AI data initiatives. Currently supporting production LLM evaluation, prompt testing, and RAG data pipelines at Citi across engineering, product, and QA teams. Hands-on technical builder with an M.S. in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, experienced in backend data pipelines, REST APIs, and enterprise cloud systems. CAPM-certified with proven expertise in establishing structured project intake frameworks, managing cross-functional dependencies, and building automated Jira status dashboards for executive leadership.",
    competencyPillars: [
      { label: "Enterprise Platform & AI Delivery", items: "LLM Evaluation, RAG Data Pipelines, Azure Data Engineering (DP-700), SQL Data Validation, Cloud Migrations, REST APIs" },
      { label: "Program & Operations Management", items: "Agile Scrum, Project Intake Standardization, Multi-Team Dependency Mapping, Sprint Planning, Release Management" },
      { label: "Executive Stakeholder Governance", items: "Jira & Slack Dashboards (10% fewer status checks), Risk Mitigation, RAID Logs, VP Status Reporting, UAT Execution" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-microsoft-digital-pm2",
    title: "Product Manager II — Corporate Functions / AI",
    companyHeader: "Microsoft",
    summary: "Product Manager with 3+ years of experience delivering customer-facing technology, AI, and data initiatives in enterprise environments. Currently supporting LLM evaluation, prompt testing frameworks, and RAG workflows at Citi across cross-functional engineering, product, ML, and risk teams. Hands-on technical builder with an M.S. in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, who designed and deployed full-stack applications including Briefly PRD AI and SprintForge. CAPM-certified with a track record of translating business needs into clear technical roadmaps, applying RICE prioritization, and driving Agile delivery that cut release timelines by 12%.",
    competencyPillars: [
      { label: "AI Product Strategy & Execution", items: "PRD Specifications, LLM Evaluation, Prompt Testing, RAG Workflows, RICE Prioritization, Product Roadmaps" },
      { label: "Data & Cloud Architecture", items: "Azure Data Engineering (DP-700), Microsoft Fabric, SQL Data Validation, REST APIs, Full-Stack Prototyping (React/Python)" },
      { label: "Delivery & Stakeholder Alignment", items: "Agile Scrum, Sprint Planning, Executive KPI Dashboards, Risk Mitigation, Cross-Functional Team Leadership" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-arize-ai-fde",
    title: "Forward Deployed AI Engineer, West",
    companyHeader: "Arize AI",
    summary: "Forward Deployed AI Engineer and Project Manager with 3+ years of experience delivering customer-facing technology, AI, and data initiatives. Currently supporting LLM evaluation, prompt testing, and RAG data workflows at Citi, working with ML and engineering teams to ensure model reliability and pipeline performance. Hands-on technical builder with an M.S. in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, experienced in developing full-stack AI tools, data extraction pipelines, and SQL validation workflows. CAPM-certified with a consulting background at Ants Corp standardizing client intake and leading technical discovery.",
    competencyPillars: [
      { label: "LLM Evaluation & Technical Delivery", items: "LLM Evaluation, Prompt Testing, RAG Workflows, Model Observability, Azure Data Engineering (DP-700), SQL Validation" },
      { label: "Client Engineering & Deployment", items: "Technical Client Discovery, Customer Troubleshooting, Data Pipeline UAT, Intake Standardization, Rapid Prototyping" },
      { label: "Project Execution & Dashboards", items: "Agile Scrum, Sprint Planning, Jira Executive Reporting, Cross-Functional Leadership, RAID Logs, Release Management" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-casper-studios-ai-pm",
    title: "AI Product Manager",
    companyHeader: "Casper Studios",
    summary: "AI Product Manager with 3+ years of experience delivering customer-facing technology, AI, and data initiatives in fast-paced product environments. Currently supporting LLM evaluation, prompt testing frameworks, and RAG workflows at Citi across engineering, ML, and product teams. Hands-on technical builder with an M.S. in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, who conceptualized and deployed Briefly PRD AI (Next.js, DeepSeek) and SprintForge (React, Vite). CAPM-certified with experience in user discovery, product specification, wireframing, and structured Agile delivery.",
    competencyPillars: [
      { label: "AI Product Management", items: "PRDs & User Stories, Prompt Design & Testing, LLM Evaluation, Feature Specification, User Research, RICE Prioritization" },
      { label: "Technical & Cloud Prototyping", items: "Azure Data Engineering (DP-700), SQL Data Pipelines, Full-Stack Development (React, Vite, Python), REST APIs" },
      { label: "Execution & Metrics", items: "Agile Scrum, Sprint Planning, Backlog Refinement, KPI Tracking, Jira Status Dashboards, Cross-Functional Coordination" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-blooming-health-sr-tpm",
    title: "Senior Technical Program Manager",
    companyHeader: "Blooming Health",
    summary: "Senior Technical Program Manager with 3+ years of experience delivering complex customer-facing technology, AI, and data initiatives in enterprise environments. Currently supporting production LLM evaluation, prompt testing, and RAG data workflows at Citi, managing technical delivery across engineering, ML, product, and QA teams for three concurrent programs. Hands-on technical builder with an M.S. in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, experienced in backend data pipelines, cloud architectures, and APIs. CAPM-certified with proven expertise in multi-team dependency management, intake standardization, and executive reporting.",
    competencyPillars: [
      { label: "Technical Program Management", items: "Multi-Workstream Delivery, Cross-Team Dependency Tracking, Agile Scrum Execution, Release Management, RAID Logs" },
      { label: "Data & Cloud Architecture", items: "Azure Data Engineering (DP-700), SQL Data Validation, Data Pipeline UAT, REST APIs, LLM Evaluation Workflows" },
      { label: "Operational Governance", items: "Process Standardization, Project Intake Design (2 weeks to 8 days), Jira Executive Dashboards, VP Status Reporting" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-handshake-tpm-central-ops",
    title: "Technical Program Manager, Central Operations (Handshake AI)",
    companyHeader: "Handshake",
    summary: "Technical Program Manager with 3+ years of experience delivering customer-facing technology, AI, and operational data initiatives in enterprise environments. Currently supporting LLM evaluation, prompt testing, and RAG data workflows at Citi across three concurrent banking programs, coordinating cross-functional engineering, product, and QA teams. Hands-on technical builder with an M.S. in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, experienced in building full-stack AI tools, backend data pipelines, and REST APIs. CAPM-certified with proven expertise at Ants Corp standardizing central intake workflows, cutting client onboarding from 2 weeks down to 8 days.",
    competencyPillars: [
      { label: "Central Operations & Program Delivery", items: "Operational Process Standardization, Project Intake Design, Multi-Workstream Execution, Agile Scrum, RAID Logs", items: "Operational Process Standardization, Project Intake Design, Multi-Workstream Execution, Agile Scrum, RAID Logs" },
      { label: "SQL & Data Investigation", items: "Strong SQL Data Validation, Azure Data Engineering (DP-700), Data Pipeline UAT, Backend Schema Verification, REST APIs" },
      { label: "AI & Operational Tooling", items: "LLM Evaluation, Prompt Testing, RAG Data Workflows, Jira & Slack Automated Dashboards, Stakeholder Reporting" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-onereach-ai-technical-pm",
    title: "Technical Project Manager",
    companyHeader: "OneReach.ai",
    summary: "Technical Project Manager with 3+ years of experience delivering customer-facing technology, conversational AI, and data initiatives. Currently supporting LLM evaluation and RAG workflows at Citi across three concurrent technology initiatives, aligning engineering, product, and QA workstreams. Hands-on technical builder with an M.S. in Computer Science and Microsoft Certified Azure Data Engineer (DP-700) credential, experienced in building conversational tools, full-stack AI apps, and cloud APIs. CAPM-certified with consulting experience managing multi-sprint deliveries and standardizing project intake frameworks.",
    competencyPillars: [
      { label: "Conversational AI & Technical Delivery", items: "LLM Evaluation, Prompt Testing, RAG Workflows, Conversational UI/UX, Azure Data Engineering (DP-700), REST APIs" },
      { label: "Project Lifecycle Management", items: "Agile Scrum, Sprint Planning, Backlog Refinement, Client Scoping & Intake Standardization, Release Coordination" },
      { label: "Quality & Governance", items: "SQL Data Validation, UAT Testing, Jira Executive Dashboards, RAID Logs, Risk Mitigation, Cross-Functional Alignment" }
    ]
  },
  {
    slug: "cv-madan-mohan-ch-doppel-fde",
    title: "Forward Deployed Engineer",
    companyHeader: "Doppel",
    summary: "Forward Deployed Engineer and Project Manager with 3+ years of experience delivering customer-facing technology, AI, and data initiatives in enterprise environments. Currently supporting production LLM evaluation and RAG workflows at Citi across three concurrent initiatives, coordinating engineering and ML teams. Hands-on builder with experience developing full-stack AI tools, data pipelines, REST APIs, and cloud solutions. Microsoft Certified Azure Data Engineer (DP-700) and CAPM-certified with an M.S. in Computer Science. Proven consulting background at Ants Corp conducting client discovery, executing SQL database validation queries, and standardizing project intake to reduce onboarding turnaround from two weeks down to eight days. Skilled in Agile Scrum delivery, technical troubleshooting, client engagement, RAID logs, and executive status reporting for mission-critical enterprise security and AI platform deployments.",
    competencyPillars: [
      { label: "Client Engineering & Deployments", items: "Technical Discovery, Client Architecture Scoping, Custom Tool Development, Data Pipeline UAT, Client Intake Design" },
      { label: "AI & Data Systems", items: "LLM Evaluation, Prompt Testing, RAG Workflows, Azure Data Engineering (DP-700), SQL Data Validation, REST APIs" },
      { label: "Delivery & Governance", items: "Agile Scrum, Sprint Velocity Tracking, Jira & Slack Dashboards, Cross-Functional Team Leadership, RAID Logs, Release Management" }
    ]
  }
];

function generateHTML(resume) {
  const companySubtitle = resume.companyHeader ? ` | <span class="company-tag">${resume.companyHeader}</span>` : '';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${resume.title} — Madan Mohan CH</title>
<style>
  @page {
    size: letter;
    margin: 0.4in 0.45in 0.4in 0.45in;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-variant-ligatures: none;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 9.2pt;
    line-height: 1.35;
    color: #1a1e24;
    background: #ffffff;
  }
  .container {
    width: 100%;
  }
  
  /* Header */
  .header {
    border-bottom: 2px solid #1e3a8a;
    padding-bottom: 5px;
    margin-bottom: 8px;
  }
  .name {
    font-size: 20pt;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }
  .role-title {
    font-size: 10.5pt;
    font-weight: 700;
    color: #1e3a8a;
    margin-top: 2px;
    margin-bottom: 3px;
  }
  .company-tag {
    color: #0284c7;
    font-weight: 600;
  }
  .contact-bar {
    font-size: 8.5pt;
    color: #475569;
    display: flex;
    flex-wrap: wrap;
    gap: 4px 10px;
  }
  .contact-bar a {
    color: #1e3a8a;
    text-decoration: none;
    font-weight: 500;
  }
  .credentials-bar {
    margin-top: 3px;
    font-size: 8.5pt;
    font-weight: 600;
    color: #0f172a;
    background: #f1f5f9;
    padding: 2.5px 6px;
    border-radius: 3px;
    border-left: 3px solid #1e3a8a;
  }

  /* Section Styles */
  .section {
    margin-bottom: 7px;
  }
  .section-title {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #1e3a8a;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 1.5px;
    margin-bottom: 4px;
  }
  .summary-text {
    font-size: 8.8pt;
    color: #334155;
    text-align: justify;
    line-height: 1.32;
  }

  /* Core Competencies */
  .competency-grid {
    display: flex;
    flex-direction: column;
    gap: 2.5px;
  }
  .competency-row {
    font-size: 8.5pt;
    line-height: 1.28;
  }
  .competency-label {
    font-weight: 700;
    color: #0f172a;
  }
  .competency-items {
    color: #334155;
  }

  /* Experience */
  .job-block {
    margin-bottom: 5px;
  }
  .job-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 1.5px;
  }
  .job-title-company {
    font-size: 9.2pt;
    font-weight: 700;
    color: #0f172a;
  }
  .job-meta {
    font-size: 8.2pt;
    font-weight: 600;
    color: #64748b;
  }
  ul.bullets {
    list-style-type: disc;
    margin-left: 14px;
  }
  ul.bullets li {
    font-size: 8.6pt;
    color: #334155;
    margin-bottom: 2px;
    line-height: 1.3;
    text-align: justify;
  }

  /* Projects & Education & Skills Grid */
  .two-col {
    display: flex;
    gap: 12px;
  }
  .col {
    flex: 1;
  }
  .project-item {
    margin-bottom: 3.5px;
    font-size: 8.5pt;
  }
  .project-name {
    font-weight: 700;
    color: #0f172a;
  }
  .project-stack {
    font-size: 7.8pt;
    color: #64748b;
    font-style: italic;
  }
  .project-desc {
    font-size: 8.2pt;
    color: #334155;
    line-height: 1.25;
  }
  .edu-item {
    font-size: 8.5pt;
    margin-bottom: 2.5px;
  }
  .edu-degree {
    font-weight: 700;
    color: #0f172a;
  }
  .edu-school {
    color: #475569;
    font-size: 8pt;
  }
  .skills-list {
    font-size: 8.2pt;
    color: #334155;
    line-height: 1.26;
  }
  .skill-cat {
    font-weight: 700;
    color: #0f172a;
  }
</style>
</head>
<body>

<div class="container">
  <!-- Header -->
  <div class="header">
    <div class="name">Madan Mohan CH</div>
    <div class="role-title">${resume.title}${companySubtitle}</div>
    <div class="contact-bar">
      <span>Seattle, WA</span> &bull;
      <span>(512) 666-4898</span> &bull;
      <span>mmohanch12@gmail.com</span> &bull;
      <a href="https://linkedin.com/in/madanmohanch99">linkedin.com/in/madanmohanch99</a> &bull;
      <a href="https://github.com/MadanMohan0537">github.com/MadanMohan0537</a> &bull;
      <a href="https://portfolio.madanmohanlearning.workers.dev/">Live Portfolio</a>
    </div>
    <div class="credentials-bar">
      Credentials: Microsoft Certified: Azure Data Engineer (DP-700) &bull; Certified Associate in Project Management (CAPM) &bull; M.S. Computer Science &bull; Stanford d.school UIF
    </div>
  </div>

  <!-- Summary -->
  <div class="section">
    <div class="section-title">Professional Summary</div>
    <div class="summary-text">${resume.summary}</div>
  </div>

  <!-- Core Competencies -->
  <div class="section">
    <div class="section-title">Core Competencies</div>
    <div class="competency-grid">
      ${resume.competencyPillars.map(p => `
        <div class="competency-row">
          <span class="competency-label">${p.label}:</span>
          <span class="competency-items">${p.items}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Work Experience -->
  <div class="section">
    <div class="section-title">Work Experience</div>
    
    <div class="job-block">
      <div class="job-header">
        <span class="job-title-company">Project Manager &bull; Citi Bank</span>
        <span class="job-meta">Seattle, WA | May 2025 – Present</span>
      </div>
      <ul class="bullets">
        ${citiBullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>

    <div class="job-block">
      <div class="job-header">
        <span class="job-title-company">Project Manager &bull; Ants Corp</span>
        <span class="job-meta">Seattle, WA | Aug 2024 – May 2025</span>
      </div>
      <ul class="bullets">
        ${antsBullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>

    <div class="job-block">
      <div class="job-header">
        <span class="job-title-company">Business Analyst &bull; NaviSite</span>
        <span class="job-meta">Remote | Jan 2022 – Feb 2023</span>
      </div>
      <ul class="bullets">
        ${navisiteBullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- Projects & Education Grid -->
  <div class="section">
    <div class="section-title">Key Projects & Hands-On Engineering</div>
    <div class="two-col">
      <div class="col">
        <div class="project-item">
          <span class="project-name">Briefly — PRD AI</span> <span class="project-stack">(Next.js, DeepSeek, Upstash)</span>
          <div class="project-desc">AI-powered tool that transforms product concepts into structured PRDs with automated section drafting. <a href="https://portfolio.madanmohanlearning.workers.dev/" style="color:#1e3a8a; text-decoration:none;">[Live Demo]</a></div>
        </div>
        <div class="project-item">
          <span class="project-name">SprintForge</span> <span class="project-stack">(React, Vite, Recharts)</span>
          <div class="project-desc">Scrum intelligence workspace with velocity tracking, sprint analytics, and AI-assisted retrospectives. <a href="https://portfolio.madanmohanlearning.workers.dev/" style="color:#1e3a8a; text-decoration:none;">[Live Demo]</a></div>
        </div>
      </div>
      <div class="col">
        <div class="project-item">
          <span class="project-name">Local Dining Intelligence</span> <span class="project-stack">(Python, Apify, DeepSeek)</span>
          <div class="project-desc">Automated restaurant data pipeline with LLM sentiment analysis and review categorization. <a href="https://portfolio.madanmohanlearning.workers.dev/" style="color:#1e3a8a; text-decoration:none;">[Live Demo]</a></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Education & Skills Footer -->
  <div class="section">
    <div class="two-col">
      <div class="col">
        <div class="section-title">Education & Certifications</div>
        <div class="edu-item">
          <div class="edu-degree">M.S. in Computer Science</div>
          <div class="edu-school">Texas A&M University–Kingsville (2023 – 2025)</div>
        </div>
        <div class="edu-item">
          <div class="edu-degree">B.S. in Computer Science</div>
          <div class="edu-school">VVIT, Guntur (2019 – 2023)</div>
        </div>
        <div class="edu-item" style="margin-top:2px;">
          <span style="font-weight:600; color:#0f172a;">Certifications:</span> Azure Data Engineer (DP-700) &bull; PMI CAPM &bull; Stanford UIF
        </div>
      </div>
      <div class="col">
        <div class="section-title">Technical Skills</div>
        <div class="skills-list">
          <div><span class="skill-cat">PM & Methodologies:</span> Agile, Scrum, Kanban, RICE Prioritization, Sprint Planning, RAID Logs, Release Mgmt, OKRs</div>
          <div><span class="skill-cat">AI & ML Delivery:</span> LLM Evaluation, Prompt Testing, Prompt Engineering, RAG Workflows, A/B Testing</div>
          <div><span class="skill-cat">Data & Cloud:</span> Azure Data Engineer (DP-700), Microsoft Fabric, SQL, Python, AWS, Azure DevOps, Postman, Power BI</div>
        </div>
      </div>
    </div>
  </div>

</div>

</body>
</html>`;
}

async function renderAll() {
  console.log("🚀 Launching Playwright Chromium to render all PDF resumes...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const r of resumes) {
    const html = generateHTML(r);
    const htmlPath = join(HTML_TMP_DIR, `${r.slug}.html`);
    const pdfPath = join(OUTPUT_DIR, `${r.slug}.pdf`);
    
    writeFileSync(htmlPath, html, 'utf-8');
    
    await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle' });
    
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.35in',
        bottom: '0.35in',
        left: '0.4in',
        right: '0.4in'
      }
    });

    console.log(`✅ Generated PDF: ${pdfPath}`);
  }

  await browser.close();
  console.log(`\n🎉 Successfully generated all ${resumes.length} PDF resumes!`);
}

renderAll().catch(err => {
  console.error("❌ PDF generation failed:", err);
  process.exit(1);
});
