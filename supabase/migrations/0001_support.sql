create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table customers (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0),
 owner text not null, retention_purpose text not null default '', retention_review date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index customers_name on customers(lower(name));
create table import_batches (
 id uuid primary key default gen_random_uuid(), digest text not null unique, source text not null, actor text not null,
 row_count integer not null check(row_count>=0), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table tickets (
 id uuid primary key default gen_random_uuid(), external_id text unique, customer_id uuid not null references customers(id),
 subject text not null check(length(trim(subject))>0), requester text not null, requester_email text not null default '',
 assignee text, team text not null default 'Support', status text not null default 'new' check(status in ('new','open','pending','hold','solved','closed')),
 priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
 channel text not null default 'manual', tags text[] not null default '{}',
 opened_at timestamptz not null default now(), last_activity_at timestamptz not null default now(),
 first_replied_at timestamptz, reply_due_at timestamptz, resolution_due_at timestamptz, task_due_at timestamptz,
 solved_at timestamptz, resolution text, reopens integer not null default 0 check(reopens>=0),
 satisfaction text, description text not null default '', source_row jsonb, import_batch_id uuid references import_batches(id),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(first_replied_at is null or first_replied_at>=opened_at), check(solved_at is null or solved_at>=opened_at),
 check(reply_due_at is null or reply_due_at>=opened_at), check(resolution_due_at is null or resolution_due_at>=opened_at)
);
create index tickets_customer on tickets(customer_id); create index tickets_batch on tickets(import_batch_id);
create index tickets_open_deadline on tickets(resolution_due_at) where status not in ('solved','closed');
create index tickets_assignee on tickets(assignee); create index tickets_activity on tickets(last_activity_at);
create table notes (
 id uuid primary key default gen_random_uuid(), ticket_id uuid not null references tickets(id),
 kind text not null check(kind in ('internal','reply')), body text not null check(length(trim(body))>0),
 actor text not null, occurred_at timestamptz not null default now(),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index notes_ticket on notes(ticket_id,occurred_at);
create table escalations (
 id uuid primary key default gen_random_uuid(), ticket_id uuid not null references tickets(id),
 reason text not null check(length(trim(reason))>0), owner text not null, due_at timestamptz not null,
 resolution text, resolved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index escalations_ticket on escalations(ticket_id); create index escalations_due on escalations(due_at) where resolved_at is null;
create table audit_events (
 id uuid primary key default gen_random_uuid(), actor text not null, action text not null, record_id uuid,
 details jsonb not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function append_only() returns trigger language plpgsql as $$ begin raise exception 'Append-only record'; end $$;
create trigger audit_immutable before update or delete on audit_events for each row execute function append_only();
create trigger notes_immutable before update or delete on notes for each row execute function append_only();
do $$ declare t text; begin
 foreach t in array array['customers','import_batches','tickets','notes','escalations','audit_events'] loop
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
 if t not in ('notes','audit_events') then execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t); end if;
 end loop;
end $$;
create view support_queue with (security_invoker=true) as
 select t.id,coalesce(t.external_id,left(t.id::text,8)) as reference,c.name as customer,t.subject,t.status,t.priority,
 coalesce(t.assignee,'Unassigned') as assignee,t.team,t.opened_at,t.last_activity_at,
 floor(extract(epoch from now()-t.last_activity_at)/86400)::int as quiet_days,
 t.reply_due_at,t.first_replied_at,t.resolution_due_at,t.task_due_at,t.reopens,
 (select count(*)::int from escalations e where e.ticket_id=t.id and e.resolved_at is null) as escalations
 from tickets t join customers c on c.id=t.customer_id where t.status not in ('solved','closed');
create view deadline_queue with (security_invoker=true) as
 select id,reference,customer,subject,assignee,'First reply'::text as obligation,reply_due_at as due_at from support_queue where first_replied_at is null and reply_due_at is not null
 union all select id,reference,customer,subject,assignee,'Resolution',resolution_due_at from support_queue where resolution_due_at is not null
 union all select id,reference,customer,subject,assignee,'Task',task_due_at from support_queue where task_due_at is not null;
create view customer_service with (security_invoker=true) as
 select c.id,c.name as customer,c.owner,
 count(t.id)::int as total_tickets,count(t.id) filter(where t.status not in ('solved','closed'))::int as open_tickets,
 count(t.id) filter(where t.status='pending')::int as waiting_customer,
 coalesce(sum(t.reopens),0)::int as reopens,
 count(t.id) filter(where lower(t.satisfaction)='bad')::int as unhappy,
 round(avg(extract(epoch from t.first_replied_at-t.opened_at)/3600)::numeric,2) as first_reply_hours,
 round(avg(extract(epoch from t.solved_at-t.opened_at)/3600)::numeric,2) as resolution_hours,
 c.retention_review from customers c left join tickets t on t.customer_id=c.id group by c.id;
revoke all on support_queue,deadline_queue,customer_service from public;
