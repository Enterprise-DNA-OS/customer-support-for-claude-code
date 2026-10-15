---
description: Record an internal case note.
---

Read CLAUDE.md. Run `npm run support -- log-note --ticket="<name or id>" --body="<facts>" --actor="<operator>" --json`. Use the actual operator-provided values, never the placeholders. Present the result in plain language and name missing information. Resolve ambiguous names from the candidate list before continuing.

Read the affected records first. Use the real operator identity. Run the same command with `--dry-run` to inspect the proposed result, then apply the requested change. Report the record ID. No command sends a message, approves a refund or deletes records.
