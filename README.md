# Oasis Answers Playwright checks

Small Playwright suite that sanity-checks https://oasisanswers.com, captures above-the-fold screenshots, and can email failures via Mailgun.

## Setup
- Node 18+ and npm.
- Install deps: `npm ci`
- (First run) Install Playwright browsers: `npx playwright install --with-deps`

## Running
- All tests: `npx playwright test`
- Single file/project: `npx playwright test tests/oasisanswers.spec.js --project=chromium`
- Update snapshots after intentional visual changes: `npx playwright test --update-snapshots`

## Reports & artifacts
- HTML report: `npx playwright show-report` (writes to `playwright-report`)
- Per-test attachments (screens, videos, traces): `test-results/`

## Optional: Mailgun failure emails
Set these env vars to enable `reporters/mailgun-reporter.ts`:
- `MAILGUN_DOMAIN`, `MAILGUN_API_KEY`, `MAILGUN_TO`
- Optional: `MAILGUN_FROM` (default: `Playwright <postmaster@MAILGUN_DOMAIN>`), `REPORT_URL` (link in the email; default `http://localhost:9323`)
