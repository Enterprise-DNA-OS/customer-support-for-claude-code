# Fictional demo output

Captured from actual CLI runs on 15 October 2026.

## Service commitments

Which support commitments need attention?

Command: npm run support -- deadlines

reference  customer             subject                     assignee    obligation   due at                status  
  ---------  -------------------  --------------------------  ----------  -----------  --------------------  --------
  20000001   Harbour Supply Demo  Missing carton on dispatch  Unassigned  First reply  2026-10-14 22:42 UTC  Overdue 
  20000002   Harbour Supply Demo  Dispatch invoice mismatch   Mara        Resolution   2026-10-14 22:42 UTC  Overdue 
  20000001   Harbour Supply Demo  Missing carton on dispatch  Unassigned  Resolution   2026-10-16 22:42 UTC  Upcoming
  20000003   Harbour Parts Demo   Replacement part approval   Jules       Resolution   2026-10-17 22:42 UTC  Upcoming

## Support workload

Who has urgent work and the longest quiet cases?

Command: npm run support -- workload

assignee    open tickets  priority tickets  longest quiet days
  ----------  ------------  ----------------  ------------------
  Jules       2             0                 6                 
  Mara        1             1                 4                 
  Unassigned  1             1                 2

## Recurring problems

Which issues keep coming back across customers?

Command: npm run support -- repeat-issues

tag       tickets  reopens  open tickets
  --------  -------  -------  ------------
  dispatch  3        3        3           
  invoice   1        2        1
