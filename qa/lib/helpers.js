'use strict';

/**
 * Test helper object handed to every scenario.
 *   t.check(ok, stepName, detail)      -> records a PASS/FAIL assertion
 *   t.warn(name, detail)               -> records a note (non-failing)
 *   t.goto(url)                        -> navigate + settle
 *   t.cap                              -> page instrumentation for current page
 *   t.page                             -> current Playwright page
 *   t.measureNav(asyncAction)          -> run an in-page navigation click and report
 *                                         whether it was a full reload or swup SPA
 */
function makeT(ctx) {
  const t = {
    page: null,
    cap: null,
    base: ctx.base,
    steps: [],
    warnings: [],
    screenshotOnFail: ctx.screenshotOnFail,

    attach() {
      const { createCapture } = require('./capture');
      this.page = ctx.page;
      this.cap = createCapture(this.page);
      ctx._cap = this.cap;
    },

    async goto(url, wait = 1400) {
      await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
      await this.page.waitForTimeout(wait);
    },

    check(ok, name, detail) {
      this.steps.push({ ok: !!ok, name, detail: detail || '' });
      return ok;
    },

    warn(name, detail) {
      this.warnings.push({ name, detail: detail || '' });
    },

    async measureNav(action) {
      const before = this.cap.navigations.length;
      await action();
      await this.page.waitForTimeout(1800);
      const reload = this.cap.navigations.length > before;
      return { reload };
    },
  };
  return t;
}

module.exports = { makeT };
