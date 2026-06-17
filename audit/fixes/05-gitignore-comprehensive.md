# Fix 05 — Comprehensive .gitignore

**Severity:** 🟡 HIGH
**File:** `.gitignore` (was 2 lines, now 38 lines)
**Status:** ✅ FIXED

## The problem

`.gitignore` contained only `tmp/`. This meant:
- `.env` files would be committed (the `backend/.env.example` template exists, but a real `.env` is not excluded).
- `node_modules/` would be committed if anyone cleared `.gitignore` thinking it was a placeholder.
- `.DS_Store` (10 KB) is already committed at the project root.
- Editor configs, build artifacts, and the heavy `toolhub/backend/` stuff (downloads, archived, cookies) would all be tracked.

## The fix

Wrote a comprehensive `.gitignore` covering:
- `node_modules/` (all variants)
- `.env`, `.env.*` (except `.env.example` templates)
- OS files: `.DS_Store`, `Thumbs.db`
- Editor configs: `.vscode/`, `.idea/`, swap files
- Build artifacts: `dist/`, `build/`, `.cache/`
- Logs: `*.log`, npm-debug, etc.
- Local scratch: `tmp/`, `audit/screenshots/`, `agent-browser-tmp/`, `.agent-browser/`
- Tooling caches: `.eslintcache`, `.stylelintcache`, `.parcel-cache/`
- The previously-tracked heavy stuff in `toolhub/backend/`

## Note

`.DS_Store` is already tracked at the project root. To remove it from git:
```bash
git rm --cached .DS_Store
git commit -m "chore: remove tracked .DS_Store"
```

Not done in this fix to avoid mixing concerns.

## Files changed

- `.gitignore` (2 lines → 38 lines).
