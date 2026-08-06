'use strict';

/**
 * Capture — wires up per-page failure instrumentation onto a Playwright page.
 * Collects console errors, pageerrors, failed requests, HTTP >=400 responses
 * and main-frame navigations (used to detect swup-SPA vs full-page reloads).
 */

function createCapture(page) {
  const cap = {
    console: [],
    pageErrors: [],
    failed: [],
    http: [],
    navigations: [],
  };

  page.on('console', (m) => {
    if (m.type() === 'error') cap.console.push(String(m.text() || '').slice(0, 400));
  });

  page.on('pageerror', (err) =>
    cap.pageErrors.push(String((err && err.message) || err).slice(0, 400))
  );

  page.on('requestfailed', (req) =>
    cap.failed.push({
      url: req.url().slice(0, 200),
      err: String((req.failure() && req.failure().errorText) || 'failed').slice(0, 80),
    })
  );

  page.on('response', (res) => {
    if (res.status() >= 400) cap.http.push({ status: res.status(), url: res.url().slice(0, 200) });
  });

  // Real main-frame navigations (full page loads). Swup SPA transitions use
  // history.pushState and do NOT produce a navigation request, so this reliably
  // distinguishes full reloads from SPA swaps. (frame 'navigated' events also
  // fire on same-document pushState changes, so they are NOT a reliable signal.)
  page.on('request', (req) => {
    if (req.resourceType() === 'document' && req.isNavigationRequest()) {
      cap.navigations.push(Date.now());
    }
  });

  cap.reset = function reset() {
    cap.console = [];
    cap.pageErrors = [];
    cap.failed = [];
    cap.http = [];
    cap.navigations = [];
  };

  return cap;
}

/** Any failed HTTP requests of 4xx/5xx that are NOT external bot-blocked noise. */
function httpFailures(cap, ignoreThese) {
  const ignore = ignoreThese || [];
  return cap.http.filter((r) => !ignore.some((re) => re.test(r.url)));
}

module.exports = { createCapture };
