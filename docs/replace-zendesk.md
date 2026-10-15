# Move the ticket register from Zendesk

Checked 15 October 2026 against [Zendesk account exports](https://support.zendesk.com/hc/en-us/articles/4408886165402-Exporting-ticket-user-or-organization-data-from-your-account).

## Get the export

Ask the account owner to have Zendesk enable exports. In Admin Center, use Account > Tools > Reports > Export, select CSV and the date range, then download and unzip the file. These account export tools are unavailable on Team plans. Wait until the export is ready before planning cutover. Preserve the original securely.

## One import command

After installation and migration, run:

```bash
npm run support -- import zendesk --file=/path/to/export.csv --timezone=Pacific/Auckland --actor="Your name" --dry-run
npm run support -- import zendesk --file=/path/to/export.csv --timezone=Pacific/Auckland --actor="Your name"
```

Use the account's actual export timezone. The importer accepts standard Zendesk CSV headings, BOM, quoted commas, embedded newlines and doubled quotes. The included fixture is synthetic, shaped from the documented headings, not a customer export. Naive dates are interpreted in the supplied IANA zone. Ambiguous daylight-saving wall times fail: resolve each against the original account and add its explicit UTC offset in a working copy. Unsupported statuses, invalid dates and duplicate IDs reject the whole import.

## Mapping

- ID is the external ticket identity. Organization groups the tickets under a customer. Empty organization goes to an explicit unassigned group for review.
- Subject, requester, requester email, assignee, group, status, priority, channel and tags become ticket fields.
- Created at, Updated at, Solved at and first reply minutes become history timestamps. A missing reply metric remains unknown.
- Due date is a task date, not a service agreement. Service reply and resolution targets remain unset until agreed and entered with set-deadlines.
- Reopens and Satisfaction Score feed the service review. The source columns, including unmapped custom fields, remain in source_row and the full database export.
- Exact repeats are skipped. A changed source row for an existing ID stops the batch rather than overwrite work entered since migration. Reconcile changes before refreshing an import.

## What needs separate migration

Zendesk CSV does not carry ticket comments, descriptions or deleted tickets. Recover conversations from a separate JSON export if needed and agree a mapping before switching. Attachments, knowledge articles, macros, roles, automation rules, custom status definitions, calendars and historical service policies require a separate mapping. No API or mail credentials are requested here.

The free version is a local support record system. It does not receive email, run a phone service or deliver replies. Drafts stay local. Enterprise DNA can scope your email, website, chat and phone connections, access controls and customer screens as part of your installed version.

## Reconcile before cutover

Run queue, service-review, compliance and export. Compare ticket counts and IDs, customer names, status totals, requester details and sample dates against Zendesk. Review unassigned organizations, imported service targets and retention purpose. Test your real intake and delivery arrangement before cancelling anything. With a prepared export, loading the register is one command; export access, history mapping and connections determine the actual switch date.
