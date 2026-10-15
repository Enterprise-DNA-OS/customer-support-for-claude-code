# Verification

15 October 2026, Linux, Node 22.23.1.

- npm install completed with no reported vulnerabilities.
- npm test passed 99 command and integration checks on embedded PGlite.
- npm test passed the same 99 checks on a separate disposable PostgreSQL server.
- All 27 CLI commands were exercised, including rejected changes, rollback, conflicting imports, timezone edge cases, archive output and HTML rendering.
- 29 slash-command recipes ship, including customise and new-view.
- npm run demo, npm run view and npm run docs passed. The demo produces three dashboards and nine documents across three document types.
- Brand lint found no errors in README.md, CLAUDE.md, compliance.md and replace-zendesk.md. The prose scan found no remaining author placeholders or banned terms.

The Windows and Ubuntu Node 20/22 matrix and PostgreSQL 17 job are configured in GitHub Actions. This note records local execution, not an unobserved CI result.
