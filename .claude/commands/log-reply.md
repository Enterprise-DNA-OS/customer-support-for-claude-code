---
description: Record a reply already sent elsewhere.
---

Read CLAUDE.md. Run `npm run support -- log-reply --ticket="<name or id>" --body="<actual sent text>" --occurred-at="<ISO timestamp with offset>" --actor="<operator>" --json`. Use the actual operator-provided values, never the placeholders. Present the result in plain language and name missing information. Resolve ambiguous names from the candidate list before continuing.

Read the affected records first. Use the real operator identity. Run the same command with `--dry-run` to inspect the proposed result, then apply the requested change. Report the record ID. No command sends a message, approves a refund or deletes records.

This records an existing reply, it does not deliver one. Ask for the actual sent text and timestamp when missing. Never mark a draft as sent.
