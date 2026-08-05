'use strict';

/**
 * journey-sim — runs the behavioural scenario suite.
 * Usage:
 *   node qa/journey-sim.js [--url <origin>] [--only <id>] [--timeout <ms>]
 * Returns exit code 1 if any scenario fails.
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { makeT } = require('./lib/helpers');
const { SCENARIOS } = require('./scenarios');

const BASE =
  process.env.BASE_URL ||
  process.argv.find((a) => a.startsWith('--url='))?.split('=')[1] ||
  'https://3tres6records.albto.me';
const ONLY = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1] || '';
const ONLY_SET = ONLY ? new Set(ONLY.split(',').map((s) => s.trim())) : null;
const NAV_TIMEOUT = 45000;

const reportDir = path.join(__dirname, 'report');
const shotDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(reportDir, { recursive: true });
fs.mkdirSync(shotDir, { recursive: true });

function run(cmd) {
  return require('child_process').execSync(cmd, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}
run(`mkdir -p "${reportDir}" "${shotDir}"`);

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const sc of SCENARIOS) {
    if (ONLY_SET && !ONLY_SET.has(sc.id)) continue;
    const res = {
      id: sc.id,
      name: sc.name,
      viewport: sc.viewport,
      steps: [],
      warnings: [],
      errors: { console: [], pageErrors: [], failed: [], http: [] },
      thrown: null,
      pass: true,
    };
    const context = await browser.newContext({
      viewport: sc.viewport,
      ignoreHTTPSErrors: true,
      locale: 'es-MX',
    });
    const page = await context.newPage();
    const t = makeT({ base: BASE, page, screenshotOnFail: true });
    t.attach();

    try {
      await sc.run(t);
    } catch (e) {
      res.thrown = String((e && e.message) || e).slice(0, 500);
      const shot = path.join(shotDir, `${sc.id}-thrown.png`);
      await page.screenshot({ path: shot, fullPage: false }).catch(() => {});
      res.screenshot = shot;
    } finally {
      res.steps = t.steps;
      res.warnings = t.warnings;
      res.errors.console = t.cap.console.slice(0, 20);
      res.errors.pageErrors = t.cap.pageErrors.slice(0, 20);
      res.errors.failed = t.cap.failed.slice(0, 30);
      res.errors.http = t.cap.http.slice(0, 30);
      res.pass = !t.steps.some((s) => !s.ok) && !res.thrown;
      results.push(res);
      await context.close();

      const stepStatus = t.steps.every((s) => s.ok) && !res.thrown ? 'PASS' : 'FAIL';
      const short = res.thrown ? ` THREW: ${res.thrown.slice(0, 120)}` : '';
      console.log(`[${stepStatus}] ${sc.id} ${sc.name}${short}`);
    }
  }

  await browser.close();
  writeReport(results);
  const failed = results.filter((r) => !r.pass);
  console.log(`\n== QA: ${results.length} scenarios, ${failed.length} failed ==`);
  process.exit(failed.length ? 1 : 0);
}

function writeReport(results) {
  const now = new Date().toISOString();
  const lines = [];
  lines.push('# 3TRES6 QA — Journey Simulation Report', '');
  lines.push(`- **Date:** ${now}`);
  lines.push(`- **Target:** \`${BASE}\``);
  lines.push(
    `- **Scenarios:** ${results.length} run, ${results.filter((r) => r.pass).length} passed, ${results.filter((r) => !r.pass).length} failed`
  );
  lines.push('');

  lines.push('## Results', '');
  lines.push('| # | Scenario | Result | Checks |');
  lines.push('|---|----------|--------|--------|');
  for (const r of results) {
    const fail = r.steps.filter((s) => !s.ok).length;
    lines.push(
      `| ${r.id} | ${r.name} | ${r.pass ? '✅ PASS' : '❌ FAIL'} | ${r.steps.length - fail}/${r.steps.length} |`
    );
  }
  lines.push('');

  lines.push('## Step-by-step', '');
  for (const r of results) {
    lines.push(`### ${r.id} — ${r.name}`);
    if (r.thrown) lines.push(`> 💥 Uncaught: \`${r.thrown}\``);
    for (const s of r.steps) {
      lines.push(`- ${s.ok ? '✅' : '❌'} \`${s.name}\`${s.detail ? ` — ${s.detail}` : ''}`);
    }
    for (const w of r.warnings) lines.push(`- ⚠️ \`${w.name}\` — ${w.detail}`);
    if (r.errors.pageErrors.length)
      lines.push(`- 🛑 page errors: ${r.errors.pageErrors.join('; ')}`);
    if (r.errors.console.length) lines.push(`- 📝 console errors: ${r.errors.console.join('; ')}`);
    if (r.errors.failed.length)
      lines.push(
        `- 🌐 failed requests: ${r.errors.failed.map((f) => `${f.url} (${f.err})`).join('; ')}`
      );
    if (r.errors.http.length)
      lines.push(`- ⚠️ HTTP ${r.errors.http.map((h) => `[${h.status}] ${h.url}`).join('; ')}`);
    if (r.screenshot)
      lines.push(`- 📸 screenshot: \`${path.relative(process.cwd(), r.screenshot)}\``);
    lines.push('');
  }

  const file = path.join(reportDir, 'journey-report.md');
  fs.writeFileSync(file, lines.join('\n'));
  console.log(`Report written: ${file}`);
}

main();
