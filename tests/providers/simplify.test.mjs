// tests/providers/simplify.test.mjs — direct provider-contract tests.
// Simplify.jobs is a board-wide aggregator feed (SimplifyJobs open-source
// listings JSON): no detect(), a dataset-selected feed URL (new-grad by
// default, internship opt-in), and two independent usability gates —
// `active` (currently open) and `is_visible` (not moderation-flagged) both
// must hold. These tests pin the id/fetch contract with a deterministic mock
// ctx (no network).
import { pass, fail, ROOT } from '../helpers.mjs';
import { join } from 'path';
import { pathToFileURL } from 'url';

console.log('\nProvider — simplify');

try {
  const simplifyModule = await import(pathToFileURL(join(ROOT, 'providers/simplify.mjs')).href);
  const simplify = simplifyModule.default;

  if (simplify.id === 'simplify') pass('simplify.id is "simplify"');
  else fail(`simplify.id is ${JSON.stringify(simplify.id)}`);

  // Board-wide feed: no detect() — wired in explicitly via `provider: simplify`.
  if (simplify.detect === undefined && typeof simplify.fetch === 'function') {
    pass('simplify exposes fetch() only (no detect — explicit provider: wiring)');
  } else {
    fail(`simplify surface: detect=${typeof simplify.detect}, fetch=${typeof simplify.fetch}`);
  }

  const sample = [
    {
      title: 'Software Engineer, New Grad',
      url: 'https://jobs.ashbyhq.com/acme/abc123',
      company_name: 'Acme Corp',
      locations: ['San Francisco, CA', 'New York, NY'],
      active: true,
      is_visible: true,
      date_posted: 1735689600, // 2025-01-01T00:00:00Z
    },
    {
      title: '  Platform Engineer  ',                 // whitespace → trimmed
      url: '  https://boards.greenhouse.io/beta/jobs/9 ',
      company_name: '   ',                            // whitespace-only → falls back to entry.name
      locations: null,                                 // non-array → ''
      active: true,
      is_visible: true,
      date_posted: null,
      date_updated: 1735776000, // falls back to date_updated
    },
    { title: 'Closed Role', url: 'https://x.test/closed', active: false, is_visible: true },       // inactive — skip
    { title: 'Hidden Role', url: 'https://x.test/hidden', active: true, is_visible: false },        // flagged — skip
    null,                                                                                            // null row — skip
    'not-an-object',                                                                                 // non-object row — skip
    { title: '', url: 'https://x.test/empty', active: true, is_visible: true },                     // empty title — skip
    { title: 'Relative URL Role', url: '/relative', active: true, is_visible: true },               // non-absolute url — skip
    { title: 'No URL Role', active: true, is_visible: true },                                        // missing url — skip
  ];

  let capturedUrl = null;
  let capturedOpts = null;
  const fetched = await simplify.fetch(
    { name: 'Simplify Board', provider: 'simplify' },
    { fetchJson: async (url, opts) => { capturedUrl = url; capturedOpts = opts; return sample; } },
  );

  if (capturedUrl === 'https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json')
    pass('simplify.fetch() defaults to the new-grad feed URL');
  else fail(`simplify.fetch() requested ${JSON.stringify(capturedUrl)}`);

  if (capturedOpts && capturedOpts.redirect === 'error')
    pass('simplify.fetch() passes redirect:"error" to fetchJson (SSRF guard)');
  else fail(`simplify.fetch() should pass redirect:"error", got: ${JSON.stringify(capturedOpts)}`);

  if (fetched.length === 2)
    pass('simplify.fetch() keeps 2 valid jobs (drops inactive, hidden, null, non-object, empty-title, bad-url rows)');
  else fail(`simplify.fetch() returned ${fetched.length} jobs (expected 2): ${JSON.stringify(fetched)}`);

  if (fetched[0] && Object.keys(fetched[0]).sort().join(',') === 'company,location,postedAt,title,url')
    pass('simplify.fetch() returns the normalized { title, url, company, location, postedAt } shape');
  else fail(`simplify.fetch() row 0 keys = ${JSON.stringify(fetched[0] && Object.keys(fetched[0]))}`);

  if (fetched[0]?.title === 'Software Engineer, New Grad'
      && fetched[0]?.company === 'Acme Corp'
      && fetched[0]?.location === 'San Francisco, CA; New York, NY'
      && fetched[0]?.postedAt === 1735689600 * 1000)
    pass('simplify.fetch() maps title/company/locations/date_posted for a full row');
  else fail(`simplify.fetch() row 0 = ${JSON.stringify(fetched[0])}`);

  if (fetched[1]?.title === 'Platform Engineer'
      && fetched[1]?.url === 'https://boards.greenhouse.io/beta/jobs/9')
    pass('simplify.fetch() trims whitespace from title and url');
  else fail(`simplify.fetch() row 1 title/url = ${JSON.stringify({ title: fetched[1]?.title, url: fetched[1]?.url })}`);

  if (fetched[1]?.company === 'Simplify Board')
    pass('simplify.fetch() falls back to entry.name when company_name is whitespace-only');
  else fail(`simplify.fetch() row 1 company = ${JSON.stringify(fetched[1]?.company)}`);

  if (fetched[1]?.location === '')
    pass('simplify.fetch() yields empty location for a non-array locations value');
  else fail(`simplify.fetch() row 1 location = ${JSON.stringify(fetched[1]?.location)}`);

  if (fetched[1]?.postedAt === 1735776000 * 1000)
    pass('simplify.fetch() falls back to date_updated when date_posted is missing');
  else fail(`simplify.fetch() row 1 postedAt = ${JSON.stringify(fetched[1]?.postedAt)}`);

  // dataset: "internship" switches the feed URL.
  let internshipUrl = null;
  await simplify.fetch(
    { name: 'X', provider: 'simplify', dataset: 'internship' },
    { fetchJson: async (url) => { internshipUrl = url; return []; } },
  );
  if (internshipUrl === 'https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json')
    pass('simplify.fetch() switches to the internship feed URL when entry.dataset is "internship"');
  else fail(`simplify.fetch() internship dataset requested ${JSON.stringify(internshipUrl)}`);

  // company default when both row company_name and entry.name are missing → 'Simplify'.
  const noName = await simplify.fetch(
    {},
    { fetchJson: async () => [{ title: 'Role', url: 'https://x.test/role', active: true, is_visible: true }] },
  );
  if (noName[0]?.company === 'Simplify')
    pass('simplify.fetch() defaults company to "Simplify" when company_name and entry.name are both missing');
  else fail(`simplify.fetch() default company = ${JSON.stringify(noName[0]?.company)}`);

  // Non-array feed response → typed error, not a silent empty result.
  let badResponseThrew = false;
  try {
    await simplify.fetch(
      { name: 'X', provider: 'simplify' },
      { fetchJson: async () => ({ jobs: [] }) },
    );
  } catch (e) {
    badResponseThrew = /unexpected feed response/.test(e.message);
  }
  if (badResponseThrew) pass('simplify.fetch() throws on a non-array feed response');
  else fail('simplify.fetch() should throw when the response is not an array');

  // null response → the error message must say "null", not "object".
  let nullResponseMsg = '';
  try {
    await simplify.fetch({ name: 'X' }, { fetchJson: async () => null });
  } catch (e) {
    nullResponseMsg = e.message;
  }
  if (/unexpected feed response/.test(nullResponseMsg) && /got null/.test(nullResponseMsg))
    pass('simplify.fetch() reports "null" (not "object") for a null feed response');
  else fail(`simplify.fetch() null-response error = ${JSON.stringify(nullResponseMsg)}`);

} catch (e) {
  fail(`simplify provider tests crashed: ${e.message}`);
}
