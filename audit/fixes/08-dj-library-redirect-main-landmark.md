# Fix 08 — dj-library.html redirect stub: add <main> landmark

**Severity:** ⚪ LOW (accessibility)
**File:** `dj-library.html` (20-line redirect to `./dj-library/`)
**Status:** ✅ FIXED

## The problem

`dj-library.html` is a 20-line stub that immediately redirects to the pre-rendered static page at `./dj-library/`. The body had no `<main>` landmark, which means screen readers and SEO crawlers couldn't identify the (brief) main content. The stub also offered no manual fallback if JavaScript is disabled.

```html
<!-- BEFORE -->
<body>
  <p>Redirigiendo a la nueva DJ Library…</p>
  <script>window.location.replace('dj-library/');</script>
</body>
```

## The fix

```html
<!-- AFTER -->
<body>
  <main>
    <p>
      Redirigiendo a la nueva DJ Library…<br />
      <a href="./dj-library/">Continuar manualmente</a>
    </p>
  </main>
  <script>
    window.location.replace('./dj-library/');
  </script>
</body>
```

## Why keep the stub at all?

The stub exists because the canonical URL is `dj-library.html` (for nav consistency with the old single-page design), but the content is in `/dj-library/`. Two options:
1. Update all internal nav links to point to `./dj-library/` (cleaner)
2. Keep the stub redirecting (what we have)

Option 1 is the right long-term fix, but it's a much bigger change (touches every nav across 16 pages + 51 DJ profiles). The stub is fine as an interim solution — search engines will eventually pick up the canonical link and treat the redirect as expected.

## Files changed

- `dj-library.html` (rewritten with `<main>` + fallback link).
