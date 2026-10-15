# Support record checks

Sources checked 15 October 2026. These checks identify record gaps. They do not certify compliance or decide retention for the business.

| Check | Basis | What the command does |
|---|---|---|
| RETENTION_REVIEW | [NZ Privacy Act principle 9](https://www.privacy.org.nz/privacy-principles/9/) | Flags a missing purpose, missing review date or past review date for customer records. The principle limits unnecessary retention. It sets no universal support-ticket retention period. A review date is a local control, not an automatic deletion date. |
| SECURITY_REVIEW | [NZ Privacy Act principle 5](https://www.privacy.org.nz/privacy-principles/5/) | Always requests a manual review of access, backups and output storage. A database query cannot verify the machine or operator controls. |
| UNASSIGNED | House operating rule | Flags an open ticket with no responsible operator. |
| DEADLINE_MISSING | House operating rule | Flags open tickets missing agreed reply or resolution targets. Imported task due dates are not service targets. |
| ESCALATION_OVERDUE | House operating rule | Lists unresolved escalations whose owner action date has passed. |

Targets use elapsed calendar time. Pending and hold do not pause a target. These are local service commitments, not a reproduction of Zendesk business-hour calendars or service-policy rules. Set them with the operator before relying on a deadline review. The open queue excludes solved and closed tickets. An unanswered solved ticket remains visible in its record and service review, but not as a current reply obligation.

## Access and records

This is a single-business local tool for trusted operators. Actor labels provide attribution, not authentication. A shared deployment needs named database roles, restricted machine access and a tested backup/restore process. Do not expose its owner database connection to a browser. The CLI connects as the database owner; row security denies public/API access by default. All tables enable row security and all views use security_invoker. No public policies are installed.

Audit events and notes are append-only for ordinary SQL updates and deletes. A database owner can still change schema or disable triggers. This is an operational history, not tamper-proof evidence. Data mutations and their audit event commit together. Dry runs roll both back. Generated exports and reply drafts use new filenames and restrictive file modes where supported. Protect the containing folder, especially on Windows. Rendered HTML includes personal records and must remain private.

Imported source rows also contain personal information. Export archives, drafts, backups and audit details require the same retention review as the primary records. No automatic deletion is included. Record a lawful purpose and arrange removal under your approved process.

For an Australian deployment, agree the applicable obligations and retention policy before importing real information. The shipped legal checks cite New Zealand principles only. There is no regulator filing, legal decision, payment or refund action here.
