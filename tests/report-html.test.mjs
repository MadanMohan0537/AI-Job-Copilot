// tests/report-html.test.mjs — pure-function coverage for report-html.mjs's
// dashboard builder. Exercises escaping, status coloring, report-link
// rewriting, and the full buildDashboardHtml() pipeline against sample
// applications.md content — no filesystem I/O (that's CLI-only, guarded).
import { pass, fail, ROOT } from './helpers.mjs';
import { join } from 'path';
import { pathToFileURL } from 'url';

console.log('\nreport-html.mjs — offline HTML dashboard builder');
try {
  const mod = await import(pathToFileURL(join(ROOT, 'report-html.mjs')).href);

  // escapeHtml — the escaping rule the ported ai-job-search command mandates.
  if (mod.escapeHtml(`<b>Acme & "Sons" 'Co'</b>`) === '&lt;b&gt;Acme &amp; &quot;Sons&quot; &#39;Co&#39;&lt;/b&gt;') {
    pass('escapeHtml escapes &, <, >, ", \'');
  } else {
    fail(`escapeHtml wrong output: ${JSON.stringify(mod.escapeHtml(`<b>Acme & "Sons" 'Co'</b>`))}`);
  }

  // statusColorId — recognized canonical id vs. unrecognized free text.
  if (mod.statusColorId('Applied') === 'applied' && mod.statusColorId('Interview') === 'interview') {
    pass('statusColorId resolves canonical status labels to their color id');
  } else {
    fail(`statusColorId canonical mismatch: Applied=${mod.statusColorId('Applied')}, Interview=${mod.statusColorId('Interview')}`);
  }
  if (mod.statusColorId('some totally unrecognized text') === null) {
    pass('statusColorId returns null for unrecognized status text (falls back to UNKNOWN_COLOR)');
  } else {
    fail(`statusColorId should return null for unrecognized text, got ${JSON.stringify(mod.statusColorId('some totally unrecognized text'))}`);
  }

  // reportCellToLink — strips the reports/ prefix so links resolve as
  // same-directory siblings of the dashboard file (which lives in reports/).
  const link = mod.reportCellToLink('[1](reports/001-acme-2026-06-01.md)');
  if (link && link.label === '1' && link.href === '001-acme-2026-06-01.md') {
    pass('reportCellToLink strips the reports/ prefix from a markdown link target');
  } else {
    fail(`reportCellToLink wrong output: ${JSON.stringify(link)}`);
  }
  if (mod.reportCellToLink('❌') === null && mod.reportCellToLink('—') === null) {
    pass('reportCellToLink returns null for non-link sentinel cells');
  } else {
    fail('reportCellToLink should return null for ❌/— sentinel cells');
  }

  // buildTableRows — parses applications.md into display rows, sorted
  // newest-first by date (then company).
  const trackerMd = [
    '| # | Date | Company | Role | Score | Status | PDF | Report | Notes |',
    '|---|------|---------|------|-------|--------|-----|--------|-------|',
    '| 1 | 2026-06-01 | Acme | Eng | 4.5/5 | Applied | ✅ | [1](reports/001-acme-2026-06-01.md) | note |',
    '| 2 | 2026-06-15 | Beta | PM  | 3.0/5 | Interview | ❌ | [2](reports/002-beta-2026-06-15.md) | note |',
    '| 3 | 2026-06-10 | Gama | Eng | N/A | Evaluated | ❌ | ❌ | note |',
  ].join('\n');
  const rows = mod.buildTableRows(trackerMd);
  if (rows.length === 3 && rows[0].company === 'Beta' && rows[1].company === 'Gama' && rows[2].company === 'Acme') {
    pass('buildTableRows sorts newest-first by date');
  } else {
    fail(`buildTableRows sort order wrong: ${JSON.stringify(rows.map((r) => [r.date, r.company]))}`);
  }
  if (rows[2].hasPdf === true && rows[0].hasPdf === false) {
    pass('buildTableRows reads the PDF ✅/❌ badge correctly');
  } else {
    fail(`buildTableRows PDF flag wrong: Acme=${rows[2].hasPdf}, Beta=${rows[0].hasPdf}`);
  }
  const evaluated = rows.find((r) => r.company === 'Gama');
  if (evaluated.score === null) {
    pass('buildTableRows treats N/A score cell as null, not NaN or 0');
  } else {
    fail(`buildTableRows should treat N/A as null score, got ${JSON.stringify(evaluated.score)}`);
  }

  // buildScoreDistribution — half-decade buckets, N/A excluded.
  const dist = mod.buildScoreDistribution(rows);
  if (dist.reduce((a, b) => a + b, 0) === 2) {
    pass('buildScoreDistribution counts only scored rows (N/A excluded)');
  } else {
    fail(`buildScoreDistribution total should be 2 (one N/A row excluded), got ${dist.reduce((a, b) => a + b, 0)}`);
  }

  // buildMonthlyActivity — groups by YYYY-MM.
  const { months, monthCounts } = mod.buildMonthlyActivity(rows);
  if (months.length === 1 && months[0] === '2026-06' && monthCounts.get('2026-06') === 3) {
    pass('buildMonthlyActivity groups same-month rows together');
  } else {
    fail(`buildMonthlyActivity wrong: months=${JSON.stringify(months)}`);
  }

  // buildDashboardHtml — full pipeline, no filesystem access.
  const { html, trackerStats, funnel } = mod.buildDashboardHtml(trackerMd);
  if (typeof html === 'string' && html.startsWith('<!doctype html>') && html.includes('</html>')) {
    pass('buildDashboardHtml returns a complete, self-contained HTML document');
  } else {
    fail('buildDashboardHtml did not return a well-formed HTML document');
  }
  if (!/<script src=|https?:\/\/(?!.*constant)/i.test(html.replace(/aria-label="[^"]*"/g, ''))) {
    // Loose smoke check: no external <script src> tags and no bare http(s):// in
    // markup other than inside aria-label text (which is stripped above).
    pass('buildDashboardHtml pulls in no external script/resource URLs (fully offline)');
  } else {
    fail('buildDashboardHtml appears to reference an external resource — must stay fully offline');
  }
  if (trackerStats.total === 3 && funnel.everApplied >= 2) {
    pass('buildDashboardHtml reuses computeTrackerStats/computeFunnel from stats.mjs');
  } else {
    fail(`buildDashboardHtml stats mismatch: total=${trackerStats.total}, everApplied=${funnel.everApplied}`);
  }

  // HTML injection in company/role/notes must be escaped in the rendered table.
  const hostileMd = [
    '| # | Date | Company | Role | Score | Status | PDF | Report | Notes |',
    '|---|------|---------|------|-------|--------|-----|--------|-------|',
    '| 1 | 2026-06-01 | <script>alert(1)</script> | Eng | 4.5/5 | Applied | ✅ | ❌ | note |',
  ].join('\n');
  const hostile = mod.buildDashboardHtml(hostileMd);
  if (!hostile.html.includes('<script>alert(1)</script>') && hostile.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;')) {
    pass('buildDashboardHtml escapes hostile company/role text before interpolating into the table');
  } else {
    fail('buildDashboardHtml failed to escape hostile tracker content — XSS risk in the generated file');
  }

  // Empty tracker degrades gracefully (no crash, valid empty-state HTML).
  const empty = mod.buildDashboardHtml('');
  if (empty.trackerStats.total === 0 && empty.html.includes('No applications tracked yet')) {
    pass('buildDashboardHtml degrades gracefully on an empty/missing tracker');
  } else {
    fail('buildDashboardHtml should render a clean empty state for an empty tracker');
  }

} catch (e) {
  fail(`report-html.mjs tests crashed: ${e.message}`);
}
