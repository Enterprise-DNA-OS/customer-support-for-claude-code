---
description: Bring in a Zendesk CSV export.
---

Read CLAUDE.md. Run `npm run support -- import zendesk --file="<export.csv>" --timezone="<IANA timezone>" --actor="<operator>" --json`. Use the actual operator-provided values, never the placeholders. Present the result in plain language and name missing information. Resolve ambiguous names from the candidate list before continuing.

Read the affected records first. Use the real operator identity. Run the same command with `--dry-run` to inspect the proposed result, then apply the requested change. Report the record ID. No command sends a message, approves a refund or deletes records.

Read docs/replace-zendesk.md. Confirm the account timezone and reconcile counts after importing. CSV lacks descriptions and conversations. A changed source ID stops the batch for reconciliation, never permission to overwrite local work.
