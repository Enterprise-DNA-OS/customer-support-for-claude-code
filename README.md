# Customer Support for Claude Code

Your ticket history, support commitments and escalation reviews in a database you own. Built for a small customer operations desk that works through a coding agent. The demonstration is fictional.

## Three ways to own it

- **Do it yourself:** free MIT-licensed code. Install locally, import your Zendesk CSV and operate through Claude Code, Codex, OpenCode or Cursor. Hosting, agent subscriptions and your operating time remain your costs.
- **We customise it:** Enterprise DNA maps your data, adds your fields and service rules, and builds a web front end or a different technology stack when you need one.
- **We run it for you:** Omni by Enterprise DNA installs your version, connects your channels and operates it. One setup fee, then a monthly retainer.

[Book a 30-minute call with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=zendesk).

## Start with the fictional demo

Node 20 or newer. No database account required.

```bash
npm install
npm run demo
npm run support -- attention
npm run support -- weekly-review --json
npm run view
npm run docs
npm test
```

Embedded PGlite persists in .data/db. Set DATABASE_URL for PostgreSQL 15 or newer. Keep credentials out of version control. For a fresh business database, use a new DATA_DIR, run npm run migrate and import your records. Never seed a real business database.

## Daily and weekly work

- `/customers`: List customer owners and retention reviews.
- `/queue`: Triage open tickets by inactivity.
- `/ticket`: Read a full ticket and recorded history.
- `/deadlines`: Review agreed reply, resolution and task dates.
- `/waiting`: Chase customer and third-party waits.
- `/workload`: Balance the support desk.
- `/repeat-issues`: Find recurring tags and reopened issues.
- `/service-review`: Review customer outcomes.
- `/escalations`: Review open owner actions.
- `/compliance`: Check record gaps and privacy review dates.
- `/attention`: Review unassigned, quiet and overdue cases.
- `/activity`: Read the change history.
- `/weekly-review`: Write the Monday support review.
- `/add-customer`: Register a customer and retention purpose.
- `/add-ticket`: Record a new support request.
- `/assign`: Name the responsible operator.
- `/set-status`: Change a ticket status with a reason.
- `/set-deadlines`: Record agreed service targets.
- `/log-note`: Record an internal case note.
- `/log-reply`: Record a reply already sent elsewhere.
- `/escalate`: Assign an escalation and due date.
- `/resolve-escalation`: Record an escalation outcome.
- `/review-retention`: Record the purpose and next review date.
- `/draft-reply`: Draft a reply without sending.
- `/import`: Bring in a Zendesk CSV export.
- `/export`: Write a complete private database archive.
- `/help`: Show the CLI command syntax.
- `/customise`: add a field or change a service rule with a migration and tests.
- `/new-view`: build another read-only report in your brand.

Read the command file under .claude/commands for the full syntax. All mutations need --actor and support --dry-run. The operator label is attribution, not a login. Names match case-insensitively and UUID prefixes work; ambiguous matches list candidates and exit 1. No command sends email, processes a payment or issues a refund.

New tickets require agreed reply and resolution deadlines. Targets use calendar hours, without business-hour calendars or pause rules. Solved tickets can reopen and increment the reopen count. Closed tickets need a follow-up case. Unresolved escalations prevent solving or closing. Notes and audit events are append-only.

## Ten questions answered from your records

These questions run against this build today. They demonstrate your own combined records, not an unsupported claim that Zendesk cannot be customised to answer them.

1. Which customers have reopened tickets and overdue commitments? (`/weekly-review`)
2. Who has the most urgent open work and the longest quiet case? (`/workload`)
3. Which dispatch issues recur across customers? (`/repeat-issues`)
4. Which customer waits have been quiet for several days? (`/waiting`)
5. Which service targets were never recorded after an import? (`/compliance`)
6. Which unassigned cases are waiting for a first reply? (`/attention`)
7. Which customers have both reopened work and a bad satisfaction rating? (`/service-review`)
8. Who owns each overdue escalation? (`/escalations`)
9. What was actually recorded before this ticket was closed? (`/ticket`)
10. What changed, who recorded it, and which export supplied the original fields? (`/export`)

## Your first hour: ten things to ask for

1. Put our business name and logo in brand.json.
2. Show open requests without an owner.
3. Find overdue first replies and resolution targets.
4. Show customers waiting more than three days.
5. Compare each operator's urgent cases.
6. Show repeat dispatch issues across customers.
7. Draft a reply from the recorded ticket facts.
8. Import our supported Zendesk CSV and compare the counts.
9. Add a product-code field with a migration.
10. Print a customer service review and export the database.

## Documents and views

npm run docs creates internal case briefs, escalation action sheets and customer service reviews. npm run view creates the week, customer outcomes and escalation dashboards. Set business_name, logo_path and colours in brand.json. Open the generated HTML or print it to PDF. These are read-only snapshots and can contain personal information. Protect the folders.

## Moving from Zendesk

[The switching guide](docs/replace-zendesk.md) covers the one-command CSV import, timezone handling, preserved custom columns and reconciliation. The vendor CSV omits conversations and descriptions. A separate migration is required for those histories. Source rows are preserved and conflicting repeat imports stop without overwriting local work. The included fixture is synthetic and uses documented vendor column names.

Email intake, live chat, telephony, attachment storage and a customer portal require separate connections. The free base records manually entered or imported tickets and drafts replies locally. [Why no front end](docs/why-no-front-end.md) explains this operating model. Test your intake and sending arrangement before cancelling Zendesk.

## Record checks and access

[Compliance checks](docs/compliance.md) flag retention review gaps under New Zealand privacy principles and separately label house controls. They never certify compliance. This is one business's database for trusted operators, not a multi-tenant or authenticated portal. Review access, backups and retention before using personal information.

## Verification

npm test uses an isolated temporary database and output folder. It verifies every CLI command, rollback, invalid inputs, duplicate imports, export completeness, timezone changes, state transitions, audit protection and document rendering. TEST_DATABASE_URL must point to an empty disposable PostgreSQL database. GitHub Actions is configured for Windows and Ubuntu on Node 20 and 22, plus PostgreSQL 17. Local and CI execution results are reported separately.

## Licence

MIT. Copyright 2026 Enterprise DNA.
