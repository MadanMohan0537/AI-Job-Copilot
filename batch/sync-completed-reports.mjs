// Writes tracker TSVs and marks pipeline.md entries as processed for reports 008-022
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { existsSync } from 'fs';

const today = '2026-08-14';

const completed = [
  { num: '008', company: 'Anthropic', role: 'Forward Deployed Engineer', score: '4.3', status: 'Evaluated', url: 'https://job-boards.greenhouse.io/anthropic/jobs/5302966008', slug: 'anthropic-fde', note: 'Apply now — sponsor confirmed, strong FDE+AI fit' },
  { num: '009', company: 'Anthropic', role: 'PM, New Markets and Monetization', score: '3.3', status: 'SKIP', url: 'https://job-boards.greenhouse.io/anthropic/jobs/5386182008', slug: 'anthropic-pm-new-markets', note: 'Do not apply — experience gap too significant' },
  { num: '010', company: 'Real Chemistry', role: 'Senior AI Project Manager', score: '3.7', status: 'Evaluated', url: 'https://job-boards.greenhouse.io/realchemistry/jobs/5287103008', slug: 'real-chemistry-senior-ai-pm', note: 'Conditional — healthcare sector, verify comp' },
  { num: '011', company: 'Nace AI', role: 'Technical Program Manager', score: '3.6', status: 'Evaluated', url: 'https://jobs.ashbyhq.com/nace.ai/86873a46-b684-4cdf-8cd9-d0170249c649', slug: 'nace-ai-tpm', note: 'Conditional — verify company details first' },
  { num: '012', company: 'Excelerate', role: 'TPM, AI Strategy & Org Transformation', score: '3.4', status: 'SKIP', url: 'https://jobs.ashbyhq.com/Excelerate/ae801e7b-6968-4b03-aefb-51be235f6664', slug: 'excelerate-tpm-ai-strategy', note: 'Conditional — consulting placement, check client' },
  { num: '013', company: 'RainFocus', role: 'Technical Project Manager', score: '3.5', status: 'Evaluated', url: 'https://jobs.lever.co/rainfocus/200dcee8-68ae-42f8-a55f-84ae79669115', slug: 'rainfocus-technical-pm', note: 'Worth applying (low priority) — verify active' },
  { num: '014', company: 'Handshake', role: 'TPM, Central Operations', score: '3.8', status: 'Evaluated', url: 'https://jobs.ashbyhq.com/handshake/e7830575-c0c7-4529-99dc-7abeadcf31cc', slug: 'handshake-tpm-central-ops', note: 'Worth applying — highlight Citi multi-workstream delivery' },
  { num: '015', company: 'Blooming Health', role: 'Senior TPM', score: '3.9', status: 'Evaluated', url: 'https://jobs.ashbyhq.com/blooming-health/070cb5b4-176c-45cb-b0e1-5d9fa44c5211', slug: 'blooming-health-sr-tpm', note: 'Worth applying — AI platform delivery, good portfolio fit' },
  { num: '016', company: 'Toptal', role: 'TPM, AI & Data Products (Databricks)', score: '3.5', status: 'Evaluated', url: 'https://weworkremotely.com/remote-jobs/toptal-technical-project-manager-ai-data-products-databricks-remote', slug: 'toptal-tpm-ai-data-databricks', note: 'Conditional — verify active, check Databricks req' },
  { num: '017', company: 'OneReach.ai', role: 'Technical Project Manager', score: '3.8', status: 'Evaluated', url: 'https://himalayas.app/companies/onereach-ai/jobs/technical-project-manager', slug: 'onereach-ai-technical-pm', note: 'Worth applying — highlight LLM eval + client delivery' },
  { num: '018', company: 'Capital Rx', role: 'Senior Scrum Master', score: '3.0', status: 'SKIP', url: 'https://job-boards.greenhouse.io/capitalrx/jobs/5200456008', slug: 'capital-rx-senior-scrum-master', note: 'Do not apply — below comp target + archetype mismatch' },
  { num: '019', company: 'SmartAsset', role: 'Senior PM, AI/LLM', score: '3.5', status: 'Evaluated', url: 'https://boards.greenhouse.io/smartasset/jobs/7655421002', slug: 'smartasset-sr-pm-ai-llm', note: 'Conditional — verify active, check experience req' },
  { num: '020', company: 'Sekai', role: 'AI Product Manager', score: '3.7', status: 'Evaluated', url: 'https://jobs.ashbyhq.com/sekai/534298cc-7123-4062-b2d0-061c41ff319f', slug: 'sekai-ai-pm', note: 'Worth applying — lead with Briefly + SprintForge portfolio' },
  { num: '021', company: 'Ketryx', role: 'GenAI Product Manager', score: '3.3', status: 'SKIP', url: 'https://job-boards.greenhouse.io/ketryx/jobs/5202809008', slug: 'ketryx-genai-pm', note: 'Conditional — only if open to healthcare/Boston relocation' },
  { num: '022', company: 'Casper Studios', role: 'AI PM', score: '3.9', status: 'Evaluated', url: 'https://jobs.ashbyhq.com/CasperStudios/f3d02b31-a5b1-4c85-bf78-36976d1881f4', slug: 'casper-studios-ai-pm', note: 'Worth applying — FinTech AI delivery + Briefly proof point' },
];

// 1. Write tracker TSVs
mkdirSync('batch/tracker-additions', { recursive: true });
for (const r of completed) {
  const tsvPath = `batch/tracker-additions/${r.num}-${r.slug}.tsv`;
  if (!existsSync(tsvPath)) {
    const link = `[${r.num}](reports/${r.num}-${r.slug}-${today}.md)`;
    const row = [r.num, today, r.company, r.role, r.status, `${r.score}/5`, '❌', link, r.note].join('\t');
    writeFileSync(tsvPath, row + '\n');
    console.log(`Wrote TSV: ${tsvPath}`);
  }
}

// 2. Update pipeline.md: replace [ ] entries with [x] for evaluated URLs, move to Processed
let pipeline = readFileSync('data/pipeline.md', 'utf8');

const processedLines = [];
for (const r of completed) {
  // Find the pending line containing this URL
  const pattern = new RegExp(`^- \\[ \\] ${r.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\n]*`, 'm');
  const match = pipeline.match(pattern);
  if (match) {
    const processedLine = `- [x] #${r.num} | ${r.url} | ${r.company} | ${r.role} | ${r.score}/5 | PDF ❌`;
    pipeline = pipeline.replace(match[0], ''); // remove from pending
    processedLines.push(processedLine);
    console.log(`Marked processed: #${r.num} ${r.company} — ${r.role} (${r.score}/5)`);
  } else {
    console.log(`Warning: could not find pending entry for ${r.url}`);
  }
}

// Insert processed lines before "## Processed"
if (processedLines.length > 0) {
  pipeline = pipeline.replace('## Processed', processedLines.join('\n') + '\n\n## Processed');
}

// Clean up blank lines in Pending section
pipeline = pipeline.replace(/(\n){3,}/g, '\n\n');
writeFileSync('data/pipeline.md', pipeline);
console.log(`\nUpdated pipeline.md: marked ${processedLines.length} entries as processed`);

// Count remaining pending
const remaining = (pipeline.match(/^- \[ \]/gm) || []).length;
console.log(`Remaining pending: ${remaining}`);
