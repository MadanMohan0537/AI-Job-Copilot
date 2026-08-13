#!/usr/bin/env node
/**
 * report-html.mjs — Self-contained offline HTML application-tracker dashboard.
 *
 * Adapted from ai-job-search's `/html-report` command
 * (github.com/MadsLorentzen/ai-job-search, MIT) — same design goal (one
 * offline HTML file, inline SVG charts, no CDN, no server) — but reading
 * career-ops's own tracker (`data/applications.md`, states.yml's canonical
 * statuses) instead of ai-job-search's `job_search_tracker.csv`. Included as
 * a dependency-free alternative to the Go/Bubble Tea TUI dashboard
 * (`npm run serve:dashboard`) for anyone who doesn't have Go installed.
 *
 * Reuses the SAME status roll-up and funnel math the TUI dashboard uses
 * (`computeTrackerStats` / `computeFunnel` from stats.mjs — see
 * dashboard/internal/data/career.go's own comment pointing back at
 * computeFunnel()), so the two dashboards can never silently disagree about
 * what a "response rate" or "interview rate" means.
 *
 * Usage:
 *   node report-html.mjs                       # -> reports/application-dashboard.html
 *   node report-html.mjs path/to/output.html    # custom output path
 *
 * Read-only: never writes to the tracker or archive. Idempotent: re-running
 * overwrites the previous report at the same path.
 *
 * `buildDashboardHtml` below is a pure function (tracker text in, HTML string
 * out) so it can be unit-tested without touching the filesystem; only the
 * CLI guard at the bottom does file I/O.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { resolveColumns, parseTrackerRow } from './tracker-parse.mjs';
import { normalizeStatus } from './followup-cadence.mjs';
import { computeTrackerStats, computeFunnel } from './stats.mjs';
import { resolveTrackerPath, resolveWorkspaceRoot } from './tracker-utils.mjs';

const CAREER_OPS = dirname(fileURLToPath(import.meta.url));

// Canonical id -> chart/pill color. Falls back to a neutral gray for any
// status text normalizeStatus() can't fold to a known id (e.g. free-text
// entered before states.yml added an alias) — shown, never hidden.
export const STATUS_COLORS = {
  evaluated: '#64748b',
  applied: '#3b82f6',
  responded: '#06b6d4',
  interview: '#f59e0b',
  offer: '#8b5cf6',
  hired: '#22c55e',
  rejected: '#ef4444',
  discarded: '#94a3b8',
  skip: '#cbd5e1',
};
export const UNKNOWN_COLOR = '#475569';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function statusColorId(rawStatus) {
  const norm = normalizeStatus(String(rawStatus ?? ''));
  return STATUS_COLORS[norm] ? norm : null;
}

/**
 * Parse a tracker Report cell's markdown link, if present, into a
 * dashboard-relative href. The dashboard file itself lives in reports/, so a
 * tracker-relative "reports/NNN-....md" link needs that prefix stripped to
 * resolve as a same-directory sibling. Only correct for the default reports/
 * output path — a custom output path elsewhere would need its own relative
 * math, which this intentionally doesn't attempt (no fabricated path guess).
 */
export function reportCellToLink(cell) {
  const raw = String(cell ?? '').trim();
  const match = raw.match(/^\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) return null;
  const [, label, target] = match;
  const href = target.startsWith('reports/') ? target.slice('reports/'.length) : target;
  return { label, href };
}

export function doughnutSvg(entries) {
  const total = entries.reduce((sum, [, c]) => sum + c, 0);
  if (total === 0) {
    return `<svg viewBox="0 0 200 200" role="img" aria-label="No applications tracked yet"><circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" stroke-width="28"/></svg>`;
  }
  const r = 80;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const label = entries.map(([status, count]) => `${count} ${status}`).join(', ');
  const segments = entries.map(([status, count]) => {
    const norm = normalizeStatus(status);
    const color = STATUS_COLORS[norm] || UNKNOWN_COLOR;
    const frac = count / total;
    const dash = frac * circumference;
    const seg = `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${color}" stroke-width="28" stroke-dasharray="${dash.toFixed(2)} ${(circumference - dash).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 100 100)"/>`;
    offset += dash;
    return seg;
  }).join('');
  return `<svg viewBox="0 0 200 200" role="img" aria-label="Status breakdown: ${escapeHtml(label)}">${segments}<text x="100" y="95" text-anchor="middle" font-size="28" font-weight="700" fill="var(--text)">${total}</text><text x="100" y="118" text-anchor="middle" font-size="12" fill="var(--subtext)">total</text></svg>`;
}

export function horizontalBarSvg(items, { width = 480, barHeight = 26, gap = 10, color = '#3b82f6', formatLabel = (l) => l } = {}) {
  const max = Math.max(1, ...items.map(([, v]) => v));
  const height = items.length * (barHeight + gap) + gap;
  const labelWidth = 110;
  const chartWidth = width - labelWidth - 40;
  const label = items.map(([k, v]) => `${formatLabel(k)}: ${v}`).join(', ');
  const bars = items.map(([k, v], i) => {
    const y = gap + i * (barHeight + gap);
    const w = (v / max) * chartWidth;
    return `
      <text x="${labelWidth - 8}" y="${y + barHeight / 2 + 4}" text-anchor="end" font-size="12" fill="var(--text)">${escapeHtml(formatLabel(k))}</text>
      <rect x="${labelWidth}" y="${y}" width="${Math.max(w, 2).toFixed(1)}" height="${barHeight}" rx="4" fill="${color}"/>
      <text x="${labelWidth + Math.max(w, 2) + 8}" y="${y + barHeight / 2 + 4}" font-size="12" fill="var(--subtext)">${v}</text>`;
  }).join('');
  return `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(label)}">${bars}</svg>`;
}

/**
 * Parse applications.md content into display-ready row objects, sorted
 * newest-first by date then alphabetically by company (ties).
 */
export function buildTableRows(trackerContent) {
  const lines = String(trackerContent ?? '').replace(/\r/g, '').split('\n');
  const colmap = resolveColumns(lines);
  const rows = [];
  for (const line of lines) {
    const row = parseTrackerRow(line, colmap);
    if (row) rows.push(row);
  }
  return rows.map((row) => {
    const statusLabel = String(row.status || '').replace(/\*\*/g, '').trim() || 'Unknown';
    const colorId = statusColorId(row.status);
    const score = parseFloat(String(row.score || '').replace(/\*/g, ''));
    const hasPdf = (row.pdf || '').includes('✅');
    const reportLink = reportCellToLink(row.report);
    return {
      num: row.num,
      date: String(row.date || '').trim(),
      company: String(row.company || '').trim(),
      role: String(row.role || '').trim(),
      score: Number.isNaN(score) ? null : score,
      statusLabel,
      colorId,
      hasPdf,
      reportLink,
    };
  }).sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.company.localeCompare(b.company));
}

const SCORE_BUCKETS = ['0.0-0.9', '1.0-1.9', '2.0-2.9', '3.0-3.9', '4.0-5.0'];

/** Score distribution across the (up to) 5 half-decade buckets above. */
export function buildScoreDistribution(tableRows) {
  const dist = SCORE_BUCKETS.map(() => 0);
  for (const r of tableRows) {
    if (r.score == null) continue;
    const idx = r.score >= 4 ? 4 : Math.min(3, Math.max(0, Math.floor(r.score)));
    dist[idx]++;
  }
  return dist;
}

/** Count per YYYY-MM from the date column, chronological, trailing 12 months with data. */
export function buildMonthlyActivity(tableRows) {
  const monthCounts = new Map();
  for (const r of tableRows) {
    const m = /^(\d{4}-\d{2})/.exec(r.date)?.[1];
    if (m) monthCounts.set(m, (monthCounts.get(m) || 0) + 1);
  }
  const months = [...monthCounts.keys()].sort().slice(-12);
  return { monthCounts, months };
}

/**
 * Build the complete dashboard HTML from raw applications.md text. Pure —
 * no filesystem access, so it's directly unit-testable.
 */
export function buildDashboardHtml(trackerContent) {
  const trackerStats = computeTrackerStats(trackerContent);
  const funnel = computeFunnel(trackerStats.byStatus);
  const tableRows = buildTableRows(trackerContent);

  const statusEntries = Object.entries(trackerStats.byStatus).filter(([, count]) => count > 0);
  const scoreDist = buildScoreDistribution(tableRows);
  const { monthCounts, months } = buildMonthlyActivity(tableRows);

  const statusChart = doughnutSvg(statusEntries);
  const scoreChart = horizontalBarSvg(SCORE_BUCKETS.map((b, i) => [b, scoreDist[i]]), { color: '#8b5cf6' });
  const monthChart = months.length
    ? horizontalBarSvg(months.map((m) => [m, monthCounts.get(m)]), { color: '#3b82f6' })
    : '<p class="empty-note">No dated rows yet.</p>';
  const funnelChart = horizontalBarSvg(
    [
      ['Applied', funnel.everApplied],
      ['Responded', funnel.everResponded],
      ['Interview', funnel.everInterview],
      ['Offer', funnel.everOffer],
    ],
    { color: '#f59e0b' },
  );

  const tableRowsHtml = tableRows.map((r) => {
    const color = r.colorId ? STATUS_COLORS[r.colorId] : UNKNOWN_COLOR;
    const scoreText = r.score == null ? '—' : r.score.toFixed(1);
    const reportCell = r.reportLink
      ? `<a href="${escapeHtml(r.reportLink.href)}">${escapeHtml(r.reportLink.label)}</a>`
      : '—';
    return `<tr data-status="${escapeHtml(r.statusLabel)}" data-search="${escapeHtml(`${r.company} ${r.role}`.toLowerCase())}">
    <td>${escapeHtml(r.date) || '—'}</td>
    <td>${escapeHtml(r.company) || '—'}</td>
    <td>${escapeHtml(r.role) || '—'}</td>
    <td>${scoreText}</td>
    <td><span class="pill" style="background:${color}22;color:${color};border-color:${color}55">${escapeHtml(r.statusLabel)}</span></td>
    <td>${r.hasPdf ? '✅' : '—'}</td>
    <td>${reportCell}</td>
  </tr>`;
  }).join('\n');

  const statusOptions = [...new Set(tableRows.map((r) => r.statusLabel))].sort()
    .map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');

  const generatedAt = new Date().toISOString().slice(0, 10);

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>career-ops Application Dashboard</title>
<style>
  :root {
    --bg: #f8fafc; --card: #ffffff; --text: #0f172a; --subtext: #64748b;
    --border: #e2e8f0; --shadow: 0 1px 3px rgba(15,23,42,.08);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
    background: var(--bg); color: var(--text);
  }
  header {
    display: flex; justify-content: space-between; align-items: baseline;
    padding: 20px 24px; background: var(--card); border-bottom: 1px solid var(--border);
    flex-wrap: wrap; gap: 8px;
  }
  header h1 { font-size: 20px; margin: 0; }
  header .meta { color: var(--subtext); font-size: 13px; }
  main { max-width: 1100px; margin: 0 auto; padding: 24px; }
  .cards {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 12px; margin-bottom: 24px;
  }
  .card {
    background: var(--card); border: 1px solid var(--border); border-left: 4px solid var(--card-color, #3b82f6);
    border-radius: 8px; padding: 14px 16px; box-shadow: var(--shadow);
  }
  .card .num { font-size: 26px; font-weight: 700; line-height: 1.1; }
  .card .label { color: var(--subtext); font-size: 12px; margin-top: 4px; }
  .charts {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
    gap: 16px; margin-bottom: 24px;
  }
  .chart-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 8px;
    padding: 16px; box-shadow: var(--shadow);
  }
  .chart-card h3 { margin: 0 0 12px; font-size: 14px; color: var(--subtext); text-transform: uppercase; letter-spacing: .04em; }
  .chart-card svg { max-width: 100%; height: auto; }
  .empty-note { color: var(--subtext); font-size: 13px; }
  .table-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 8px;
    box-shadow: var(--shadow); overflow: hidden;
  }
  .table-controls {
    display: flex; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border);
    flex-wrap: wrap; align-items: center;
  }
  .table-controls input, .table-controls select {
    padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px;
  }
  .table-controls input { flex: 1; min-width: 160px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid var(--border); white-space: nowrap; }
  th { color: var(--subtext); font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: .03em; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  tbody tr.hidden-row { display: none; }
  .pill {
    display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px;
    font-weight: 600; border: 1px solid;
  }
  .overflow-wrap { overflow-x: auto; }
  footer { text-align: center; color: var(--subtext); font-size: 12px; padding: 24px; }
  @media (max-width: 700px) {
    .charts { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<header>
  <h1>career-ops Application Dashboard</h1>
  <div class="meta">Generated: ${generatedAt}</div>
</header>
<main>
  <section class="cards">
    ${Object.entries(trackerStats.byStatus).map(([status, count]) => {
      const norm = normalizeStatus(status);
      const color = STATUS_COLORS[norm] || UNKNOWN_COLOR;
      return `<div class="card" style="--card-color:${color}"><div class="num">${count}</div><div class="label">${escapeHtml(status)}</div></div>`;
    }).join('\n    ')}
    <div class="card" style="--card-color:#0f172a"><div class="num">${trackerStats.total}</div><div class="label">Total</div></div>
  </section>

  <section class="charts">
    <div class="chart-card">
      <h3>Status Breakdown</h3>
      ${statusChart}
    </div>
    <div class="chart-card">
      <h3>Score Distribution</h3>
      ${scoreChart}
    </div>
    <div class="chart-card">
      <h3>Monthly Activity</h3>
      ${monthChart}
    </div>
    <div class="chart-card">
      <h3>Funnel (ever reached this stage)</h3>
      ${funnelChart}
      <p class="empty-note">Response rate ${funnel.responseRate}% &middot; Interview rate ${funnel.interviewRate}% &middot; Offer rate ${funnel.offerRate}%${funnel.smallSample ? ' &middot; small sample (&lt;10 applied)' : ''}</p>
    </div>
  </section>

  <section class="table-card">
    <div class="table-controls">
      <input type="text" id="search" placeholder="Search company or role...">
      <select id="statusFilter">
        <option value="">All statuses</option>
        ${statusOptions}
      </select>
      <span id="shownCount" class="empty-note"></span>
    </div>
    <div class="overflow-wrap">
      <table>
        <thead>
          <tr><th>Date</th><th>Company</th><th>Role</th><th>Score</th><th>Status</th><th>PDF</th><th>Report</th></tr>
        </thead>
        <tbody id="tbody">
          ${tableRowsHtml || '<tr><td colspan="7" class="empty-note">No applications tracked yet.</td></tr>'}
        </tbody>
      </table>
    </div>
  </section>
</main>
<footer>Generated by career-ops (US fork) &middot; offline dashboard adapted from ai-job-search &middot; ${generatedAt}</footer>
<script>
(function () {
  var search = document.getElementById('search');
  var statusFilter = document.getElementById('statusFilter');
  var rows = Array.prototype.slice.call(document.querySelectorAll('#tbody tr[data-search]'));
  var shownCount = document.getElementById('shownCount');
  function applyFilters() {
    var q = (search.value || '').toLowerCase().trim();
    var status = statusFilter.value;
    var shown = 0;
    rows.forEach(function (row) {
      var matchesSearch = !q || row.getAttribute('data-search').indexOf(q) !== -1;
      var matchesStatus = !status || row.getAttribute('data-status') === status;
      var visible = matchesSearch && matchesStatus;
      row.classList.toggle('hidden-row', !visible);
      if (visible) shown++;
    });
    shownCount.textContent = shown + ' shown';
  }
  search.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  applyFilters();
})();
</script>
</body>
</html>
`;

  return { html, trackerStats, funnel, tableRows };
}

// --- CLI (guarded so the module is safely importable for tests) ---
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const trackerPath = resolveTrackerPath(CAREER_OPS);
  const workspaceRoot = resolveWorkspaceRoot(trackerPath);
  const outputPath = process.argv[2]
    ? join(process.cwd(), process.argv[2])
    : join(workspaceRoot, 'reports', 'application-dashboard.html');

  const trackerContent = existsSync(trackerPath) ? readFileSync(trackerPath, 'utf-8') : '';
  const { html, trackerStats, funnel } = buildDashboardHtml(trackerContent);

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, html, 'utf-8');

  const relOut = relative(process.cwd(), outputPath) || outputPath;
  console.log(`Dashboard generated: ${relOut}`);
  console.log(`Open it in any browser — no server needed.`);
  console.log('');
  console.log(`Summary: ${trackerStats.total} tracked · Applied ${funnel.everApplied} · Interview ${funnel.everInterview} · Offer ${funnel.everOffer} · Hired ${trackerStats.byStatus.Hired || 0}`);
  console.log('Re-run `node report-html.mjs` (or `npm run report:html`) any time after tracker updates to refresh the dashboard.');
}
