// @ts-check
/** @typedef {import('./_types.js').Provider} Provider */

// Simplify.jobs provider — board-wide aggregator feed maintained by the
// SimplifyJobs open-source community (github.com/SimplifyJobs), the same
// public JSON dataset that powers their widely-used "New-Grad-Positions" and
// "Summer-Internships" README tables. No auth, no rate limiting encountered
// in practice, and explicitly designed by its maintainers for third-party
// reuse (many other tools already consume this exact feed).
//
// Wire in via a `job_boards:` entry with `provider: simplify`. Optional
// `entry.dataset: "internship"` switches to the internship feed; default is
// "new-grad". scan.mjs applies the configured title_filter / location_filter
// to the returned rows — this provider does not pre-filter by geography, so
// a US-only portals.yml entry should set location_filter accordingly (the
// feed includes non-US listings).
//
// MAINTENANCE NOTE: the new-grad feed's repo name ("New-Grad-Positions") has
// been stable across cycles, but the internship repo is renamed every year
// (e.g. Summer2025-Internships -> Summer2026-Internships) to match the
// current hiring season. INTERNSHIP_REPO below will need a yearly bump —
// verify it still resolves (a 404 here means SimplifyJobs cut a new repo for
// the next cycle) and update the constant.

const NEW_GRAD_REPO = 'New-Grad-Positions';
const INTERNSHIP_REPO = 'Summer2026-Internships'; // bump yearly — see note above

const feedUrl = (repo) => `https://raw.githubusercontent.com/SimplifyJobs/${repo}/dev/.github/scripts/listings.json`;

// The feed's own field name for a currently-open listing; `is_visible` is a
// separate SimplifyJobs moderation flag (a listing can be `active: true` but
// `is_visible: false` when flagged, e.g. duplicate or reported bad) — both
// must hold for a row to be worth surfacing.
function isUsable(row) {
  return row && typeof row === 'object'
    && row.active === true
    && row.is_visible !== false
    && typeof row.title === 'string' && row.title.trim() !== ''
    && typeof row.url === 'string' && /^https?:\/\//i.test(row.url.trim());
}

function toEpochMs(epochSeconds) {
  return typeof epochSeconds === 'number' && Number.isFinite(epochSeconds)
    ? epochSeconds * 1000
    : undefined;
}

/** @type {Provider} */
export default {
  id: 'simplify',

  /**
   * @param {{ name?: string, dataset?: string }} entry
   * @param {{ fetchJson: (url: string, opts?: object) => Promise<any> }} ctx
   * @returns {Promise<Array<{title: string, url: string, company: string, location: string, postedAt?: number}>>}
   */
  async fetch(entry, ctx) {
    const repo = entry?.dataset === 'internship' ? INTERNSHIP_REPO : NEW_GRAD_REPO;
    // 12MB+ JSON from GitHub's raw CDN — comfortably fast in practice, but
    // well above what the shared 10s default timeout was tuned for, so this
    // provider asks for more room explicitly rather than tuning the shared
    // default up for every other (much smaller) provider.
    const data = await ctx.fetchJson(feedUrl(repo), { redirect: 'error', timeoutMs: 30_000 });
    if (!Array.isArray(data)) {
      throw new Error(`simplify: unexpected feed response — expected a JSON array, got ${data === null ? 'null' : typeof data}`);
    }

    return data.filter(isUsable).map((row) => ({
      title: row.title.trim(),
      url: row.url.trim(),
      company: typeof row.company_name === 'string' && row.company_name.trim()
        ? row.company_name.trim()
        : (entry.name || 'Simplify'),
      location: Array.isArray(row.locations) ? row.locations.filter((l) => typeof l === 'string' && l.trim()).join('; ') : '',
      postedAt: toEpochMs(row.date_posted) ?? toEpochMs(row.date_updated),
    }));
  },
};
