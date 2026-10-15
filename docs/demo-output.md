# Fictional demo output

Captured from actual CLI runs on 15 October 2026.

## Service commitments

Which support commitments need attention?

Command: npm run support -- deadlines

reference | customer | subject | assignee | obligation | due_at | status
--- | --- | --- | --- | --- | --- | ---
20000001 | Harbour Supply Demo | Missing carton on dispatch | Unassigned | First reply | "2026-10-14T22:42:41.516Z" | Overdue
20000002 | Harbour Supply Demo | Dispatch invoice mismatch | Mara | Resolution | "2026-10-14T22:42:41.516Z" | Overdue
20000001 | Harbour Supply Demo | Missing carton on dispatch | Unassigned | Resolution | "2026-10-16T22:42:41.516Z" | Upcoming
20000003 | Harbour Parts Demo | Replacement part approval | Jules | Resolution | "2026-10-17T22:42:41.516Z" | Upcoming

## Support workload

Who has urgent work and the longest quiet cases?

Command: npm run support -- workload

assignee | open_tickets | priority_tickets | longest_quiet_days
--- | --- | --- | ---
Jules | 2 | 0 | 6
Mara | 1 | 1 | 4
Unassigned | 1 | 1 | 2

## Recurring problems

Which issues keep coming back across customers?

Command: npm run support -- repeat-issues

tag | tickets | reopens | open_tickets
--- | --- | --- | ---
dispatch | 3 | 3 | 3
invoice | 1 | 2 | 1
