# Customer Support for Claude Code

Read README.md and docs/compliance.md before operating. This is a single-business support desk for trusted operators. Ask for the operator identity, business name and agreed service rules during setup. The demo is fictional.

## Working rules

Read before writing. Every answer about records starts with the support CLI, never memory. Use --json for exact data. Do not invent a customer, status, deadline, sent reply or approval. Match names case-insensitively or by UUID prefix. If a match is ambiguous, show candidates and resolve it.

Mutations require the real operator's --actor label and support --dry-run. The label is attribution, not authentication. Never impersonate a person. No command sends a message. Drafts stay in drafts. log-reply records an actual reply sent elsewhere, never a draft. Never delete records without an explicit operator instruction. Closed tickets need a new follow-up case. Resolve escalations before solving a ticket.

## Routing

- List customer owners and retention reviews: `/customers`.
- Triage open tickets by inactivity: `/queue`.
- Read a full ticket and recorded history: `/ticket`.
- Review agreed reply, resolution and task dates: `/deadlines`.
- Chase customer and third-party waits: `/waiting`.
- Balance the support desk: `/workload`.
- Find recurring tags and reopened issues: `/repeat-issues`.
- Review customer outcomes: `/service-review`.
- Review open owner actions: `/escalations`.
- Check record gaps and privacy review dates: `/compliance`.
- Review unassigned, quiet and overdue cases: `/attention`.
- Read the change history: `/activity`.
- Write the Monday support review: `/weekly-review`.
- Register a customer and retention purpose: `/add-customer`.
- Record a new support request: `/add-ticket`.
- Name the responsible operator: `/assign`.
- Change a ticket status with a reason: `/set-status`.
- Record agreed service targets: `/set-deadlines`.
- Record an internal case note: `/log-note`.
- Record a reply already sent elsewhere: `/log-reply`.
- Assign an escalation and due date: `/escalate`.
- Record an escalation outcome: `/resolve-escalation`.
- Record the purpose and next review date: `/review-retention`.
- Draft a reply without sending: `/draft-reply`.
- Bring in a Zendesk CSV export: `/import`.
- Write a complete private database archive: `/export`.
- Show the CLI command syntax: `/help`.
- Change a field or rule: `/customise`.
- Add a read-only report: `/new-view`.

## Data and outputs

scripts/support.mjs is the one CLI. scripts/lib/import-zendesk.mjs handles the supported CSV mapping. supabase/migrations contains plain PostgreSQL migrations. DATABASE_URL selects a PostgreSQL connection; otherwise PGlite uses .data/db. views.json and documents.json declare output, and brand.json sets the brand. No browser or public API should receive the database owner's credentials.

Read docs/replace-zendesk.md before importing. Confirm the exporting account's IANA timezone. CSV comments and descriptions are absent. Unknown service targets remain unknown. Set them from actual agreements, not a guessed vendor policy. Do not run seed against a real business database. Use private folders for exports, drafts, source exports and rendered documents.

Omni by Enterprise DNA installs and runs your version: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=zendesk
