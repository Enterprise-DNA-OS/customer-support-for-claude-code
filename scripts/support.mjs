#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {createHash,randomUUID} from 'node:crypto';import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';import {convertCsv,timestamp} from './lib/import-zendesk.mjs';
import {table as textTable} from './lib/format.mjs';
export const readCommands=['customers','queue','ticket','deadlines','waiting','workload','repeat-issues','service-review','escalations','compliance','attention','activity','weekly-review'];
export const commands=[...readCommands,'add-customer','add-ticket','assign','set-status','set-deadlines','log-note','log-reply','escalate','resolve-escalation','review-retention','draft-reply','import','export','help'];
const spec={
 customers:[],queue:[],ticket:['ticket'],deadlines:[],waiting:[],workload:[],'repeat-issues':[],'service-review':[],escalations:[],compliance:[],attention:[],activity:[],'weekly-review':[],
 'add-customer':['name','owner','purpose','review-date'],'add-ticket':['customer','subject','requester','email','priority','description','assignee','reply-due','resolution-due'],
 assign:['ticket','assignee','team'],'set-status':['ticket','status','reason'],'set-deadlines':['ticket','reply-due','resolution-due'],
 'log-note':['ticket','body'],'log-reply':['ticket','body','occurred-at'],escalate:['ticket','reason','owner','due'],
 'resolve-escalation':['escalation','resolution'],'review-retention':['customer','purpose','review-date'],
 'draft-reply':['ticket','body'],import:['file','timezone'],export:['out'],help:[]
};
const mutation=new Set(['add-customer','add-ticket','assign','set-status','set-deadlines','log-note','log-reply','escalate','resolve-escalation','review-retention','import']);
export function parse(args){
 const cmd=args[0]||'help';if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}. Use help.`);
 const options={},pos=[];for(const a of args.slice(1)){
  if(!a.startsWith('--')){pos.push(a);continue;}
  const idx=a.indexOf('='),key=a.slice(2,idx<0?undefined:idx),value=idx<0?true:a.slice(idx+1);
  const allowed=[...spec[cmd],'json',...(mutation.has(cmd)?['actor','dry-run']:[])];
  if(!allowed.includes(key))throw Error(`Unknown flag --${key} for ${cmd}`);
  if(key in options)throw Error(`Duplicate flag --${key}`);
  if(['json','dry-run'].includes(key)){if(value!==true)throw Error(`--${key} takes no value`);}else if(value===true||!value.trim())throw Error(`--${key}=value required`);
  options[key]=value;
 }
 if(cmd==='import'){if(pos.length!==1||pos[0]!=='zendesk')throw Error('Use import zendesk --file=export.csv --timezone=Pacific/Auckland --actor=Name');}
 else if(pos.length)throw Error('Unexpected positional argument; use named flags');
 return {cmd,o:options};
}
const required=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`--${k} is required`);return o[k].trim();};
function day(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||new Date(v+'T00:00:00Z').toISOString().slice(0,10)!==v)throw Error('Use a valid YYYY-MM-DD date');return v;}
function instant(v){if(!/(Z|[+-]\d{2}:\d{2})$/.test(v))throw Error('Timestamp requires explicit UTC offset or Z');return timestamp(v);}
async function match(db,kind,value){
 const config={tickets:['tickets','subject'],customers:['customers','name'],escalations:['escalations','reason']}[kind];
 const [table,col]=config;
 const v=value.toLowerCase();let hits=await db.query(`select * from ${table} where id::text=$2 or lower(${col})=$1 ${kind==='tickets'?'or external_id=$2':''} order by ${col},id limit 25`,[v,value]);
 if(!hits.length)hits=await db.query(`select * from ${table} where starts_with(id::text,$1) or position($1 in lower(${col}))>0 order by ${col},id limit 25`,[v]);
 if(hits.length!==1){const candidates=hits.length?hits:await db.query(`select id,${col} from ${table} order by ${col},id limit 25`);throw Error(`${hits.length?'Ambiguous':'No match'} ${kind}: ${value}. Candidates (up to 25): ${candidates.map(r=>`${r.id.slice(0,8)} ${r[col]}`).join('; ')}`);}
 return hits[0];
}
const audit=async(db,actor,action,id,details)=>db.query('insert into audit_events(actor,action,record_id,details) values($1,$2,$3,$4)',[actor,action,id,JSON.stringify(details)]);
async function compliance(db){return db.query(`
 select 'RETENTION_REVIEW' as rule,c.name as record,'Review whether these personal records remain necessary' as finding,'https://www.privacy.org.nz/privacy-principles/9/' as source
 from customers c where retention_review is null or retention_review<current_date or trim(retention_purpose)=''
 union all select 'UNASSIGNED',subject,'House control: assign a responsible operator','docs/compliance.md' from tickets where assignee is null and status not in ('solved','closed')
 union all select 'DEADLINE_MISSING',subject,'House control: set agreed service targets; imported targets are unknown','docs/compliance.md' from tickets where status not in ('solved','closed') and (resolution_due_at is null or (first_replied_at is null and reply_due_at is null))
 union all select 'ESCALATION_OVERDUE',t.subject,'House control: review overdue escalation with its owner','docs/compliance.md' from escalations e join tickets t on t.id=e.ticket_id where e.resolved_at is null and e.due_at<now()
 union all select 'SECURITY_REVIEW','Deployment','Manual review required: verify access, backups and private output storage','https://www.privacy.org.nz/privacy-principles/5/'
 order by rule,record`);}
async function read(db,cmd,o){
 if(cmd==='customers')return db.query('select id,name,owner,retention_purpose,retention_review from customers order by name');
 if(cmd==='queue')return db.query('select reference,customer,subject,status,priority,assignee,quiet_days from support_queue order by quiet_days desc,reference');
 if(cmd==='ticket'){const t=await match(db,'tickets',required(o,'ticket'));return {ticket:t,notes:await db.query('select kind,body,actor,occurred_at from notes where ticket_id=$1 order by occurred_at,id',[t.id]),escalations:await db.query('select * from escalations where ticket_id=$1 order by created_at,id',[t.id])};}
 if(cmd==='deadlines')return db.query("select reference,customer,subject,assignee,obligation,due_at,case when due_at<now() then 'Overdue' else 'Upcoming' end as status from deadline_queue order by due_at,reference,obligation");
 if(cmd==='waiting')return db.query("select reference,customer,subject,status,assignee,quiet_days from support_queue where status in ('pending','hold') order by quiet_days desc,reference");
 if(cmd==='workload')return db.query("select assignee,count(*)::int as open_tickets,count(*) filter(where priority in ('high','urgent'))::int as priority_tickets,max(quiet_days) as longest_quiet_days from support_queue group by assignee order by open_tickets desc,assignee");
 if(cmd==='repeat-issues')return db.query("select tag,count(*)::int as tickets,coalesce(sum(reopens),0)::int as reopens,count(*) filter(where status not in ('solved','closed'))::int as open_tickets from tickets cross join lateral unnest(tags) as tag group by tag having count(*)>1 or sum(reopens)>0 order by tickets desc,tag");
 if(cmd==='service-review')return db.query('select customer,owner,total_tickets,open_tickets,waiting_customer,reopens,unhappy,first_reply_hours,resolution_hours from customer_service order by reopens desc,customer');
 if(cmd==='escalations')return db.query("select e.id,t.subject,e.reason,e.owner,e.due_at,case when e.due_at<now() then 'Overdue' else 'Upcoming' end as status from escalations e join tickets t on t.id=e.ticket_id where resolved_at is null order by due_at,e.id");
 if(cmd==='compliance')return compliance(db);
 if(cmd==='activity')return db.query('select actor,action,record_id,details,created_at from audit_events order by created_at desc,id limit 100');
 if(cmd==='attention')return {unassigned:await db.query("select reference,subject,customer from support_queue where assignee='Unassigned' order by reference"),quiet:await db.query('select reference,subject,assignee,quiet_days from support_queue where quiet_days>=3 order by quiet_days desc,reference'),overdue:await db.query('select reference,subject,obligation,due_at from deadline_queue where due_at<now() order by due_at,reference'),escalations:await read(db,'escalations',o)};
 if(cmd==='weekly-review')return {attention:await read(db,'attention',o),service:await read(db,'service-review',o),compliance:await compliance(db)};
}
function writeNew(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,data,{flag:'wx',mode:0o600});return file;}
export async function dispatch(db,args){
 const {cmd,o}=parse(args);
 if(cmd==='help')return {commands,syntax:spec,notes:'Options use --name=value. Mutations require --actor=Name and accept --dry-run. Timestamps require an offset. No command sends anything.'};
 if(readCommands.includes(cmd))return read(db,cmd,o);
 if(cmd==='export'){
  const archive={format:'customer-support-v1',exported_at:new Date().toISOString()},counts={};
  await db.exec('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try{for(const t of ['customers','tickets','notes','escalations','import_batches','audit_events','schema_migrations']){archive[t]=await db.query(`select * from ${t}`);counts[t]=archive[t].length;}await db.exec('COMMIT');}catch(e){await db.exec('ROLLBACK');throw e;}
  const file=path.resolve(required(o,'out'));writeNew(file,JSON.stringify(archive,null,2)+'\n');return {file,counts};
 }
 if(cmd==='draft-reply'){
  const t=await match(db,'tickets',required(o,'ticket'));const body=required(o,'body');
  const file=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',`reply-${t.id}-${randomUUID()}.md`);
  writeNew(file,`# Reply draft\n\nNothing sent. Review the ticket and recipient before sending elsewhere.\n\nTicket: ${t.external_id||t.id}\nSubject: ${t.subject}\nTo: ${t.requester} ${t.requester_email}\n\n${body}\n`);return {file,status:'draft only'};
 }
 const actor=required(o,'actor');await db.exec('BEGIN');
 try{
  let result,id=null;
  if(cmd==='add-customer'){
   const [row]=await db.query('insert into customers(name,owner,retention_purpose,retention_review) values($1,$2,$3,$4) returning *',[required(o,'name'),required(o,'owner'),required(o,'purpose'),day(required(o,'review-date'))]);id=row.id;result=row;
  }else if(cmd==='add-ticket'){
   const c=await match(db,'customers',required(o,'customer'));
   const priority=o.priority||'normal';if(!['low','normal','high','urgent'].includes(priority))throw Error('Invalid priority');
   const [row]=await db.query('insert into tickets(customer_id,subject,requester,requester_email,priority,description,assignee,reply_due_at,resolution_due_at) values($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *',[c.id,required(o,'subject'),required(o,'requester'),o.email||'',priority,required(o,'description'),o.assignee||null,instant(required(o,'reply-due')),instant(required(o,'resolution-due'))]);id=row.id;result=row;
  }else if(cmd==='review-retention'){
   const c=await match(db,'customers',required(o,'customer'));id=c.id;
   const date=day(required(o,'review-date'));if(date<new Date().toISOString().slice(0,10))throw Error('Review date must be today or later');
   result=(await db.query('update customers set retention_purpose=$1,retention_review=$2 where id=$3 returning *',[required(o,'purpose'),date,id]))[0];
  }else if(cmd==='resolve-escalation'){
   const e=await match(db,'escalations',required(o,'escalation'));id=e.id;
   const rows=await db.query('update escalations set resolution=$1,resolved_at=now() where id=$2 and resolved_at is null returning *',[required(o,'resolution'),id]);if(!rows.length)throw Error('Escalation already resolved');result=rows[0];
  }else if(cmd==='import'){
   const file=required(o,'file'),text=fs.readFileSync(file,'utf8'),rows=convertCsv(text,o.timezone);
   const digest=createHash('sha256').update(text+'\n'+(o.timezone||'')).digest('hex');
   const old=await db.query('select id,row_count from import_batches where digest=$1',[digest]);
   if(old.length)result={skipped:true,imported:0,batch:old[0].id};
   else{
    const [batch]=await db.query('insert into import_batches(digest,source,actor,row_count) values($1,$2,$3,$4) returning id',[digest,path.basename(file),actor,rows.length]);id=batch.id;let imported=0,skipped=0;
    for(const r of rows){
     const existing=await db.query('select source_row,opened_at from tickets where external_id=$1',[r.external_id]);
     if(existing.length){if(stable(existing[0].source_row)!==stable(r.source_row)||new Date(existing[0].opened_at).toISOString()!==r.opened_at)throw Error(`Ticket ${r.external_id} already exists with different source content or timezone; import stopped. Reconcile before refreshing.`);skipped++;continue;}
     await db.query("insert into customers(name,owner) values($1,$2) on conflict(lower(name)) do nothing",[r.customer,actor]);
     const [c]=await db.query('select id from customers where lower(name)=lower($1)',[r.customer]);
     const cols=['external_id','subject','status','priority','requester','requester_email','assignee','team','channel','tags','opened_at','last_activity_at','first_replied_at','solved_at','task_due_at','reopens','satisfaction','source_row'];
     await db.query(`insert into tickets(customer_id,import_batch_id,${cols.join(',')}) values(${[c.id,id,...cols].map((_,i)=>'$'+(i+1)).join(',')})`,[c.id,id,...cols.map(k=>k==='source_row'?JSON.stringify(r[k]):r[k])]);imported++;
    }
    result={batch:id,imported,skipped,notes:'CSV does not include comments or descriptions. Imported service targets and retention purpose need review. Original columns preserved in source_row.'};
   }
  }else{
   const t=await match(db,'tickets',required(o,'ticket'));id=t.id;
   // Serialize mutations and re-read after the lock so concurrent status changes cannot race.
   const [locked]=await db.query('select * from tickets where id=$1 for update',[id]);Object.assign(t,locked);
   if(t.status==='closed')throw Error('Closed tickets are immutable; open a follow-up ticket');
   if(cmd==='assign'){
    result=(await db.query('update tickets set assignee=$1,team=$2 where id=$3 returning *',[required(o,'assignee'),o.team||t.team,id]))[0];
   }else if(cmd==='set-deadlines'){
    if(['solved','closed'].includes(t.status))throw Error('Reopen the ticket before changing service targets');
    result=(await db.query('update tickets set reply_due_at=$1,resolution_due_at=$2 where id=$3 returning *',[instant(required(o,'reply-due')),instant(required(o,'resolution-due')),id]))[0];
   }else if(cmd==='set-status'){
    const state=required(o,'status'),reason=required(o,'reason');
    const transitions={new:['open','pending','hold','solved'],open:['pending','hold','solved'],pending:['open','hold','solved'],hold:['open','pending','solved'],solved:['open','closed'],closed:[]};
    if(!transitions[t.status].includes(state))throw Error(`Invalid status transition ${t.status} to ${state}`);
    if(['solved','closed'].includes(state)){
     const es=await db.query('select id from escalations where ticket_id=$1 and resolved_at is null',[id]);if(es.length)throw Error('Resolve open escalations before solving or closing');
    }
    result=(await db.query("update tickets set status=$1,resolution=case when $1 in ('solved','closed') then $2 else null end,solved_at=case when $1='solved' then now() when $1='closed' then solved_at else null end,reopens=reopens+case when status='solved' and $1='open' then 1 else 0 end,last_activity_at=now() where id=$3 returning *",[state,reason,id]))[0];
   }else if(cmd==='log-note'||cmd==='log-reply'){
    if(t.status==='closed')throw Error('Closed tickets are immutable; open a follow-up ticket');
    const when=cmd==='log-reply'?instant(required(o,'occurred-at')):new Date().toISOString();
    if(Date.parse(when)<Date.parse(t.opened_at)||Date.parse(when)>Date.now()+1000)throw Error('Activity must be between ticket opening and now');
    result=(await db.query('insert into notes(ticket_id,kind,body,actor,occurred_at) values($1,$2,$3,$4,$5) returning *',[id,cmd==='log-reply'?'reply':'internal',required(o,'body'),actor,when]))[0];
    await db.query("update tickets set last_activity_at=greatest(last_activity_at,$1::timestamptz),first_replied_at=case when $2='reply' then least(first_replied_at,$1::timestamptz) else first_replied_at end where id=$3",[when,result.kind,id]);
   }else if(cmd==='escalate'){
    if(['solved','closed'].includes(t.status))throw Error('Reopen the ticket before escalating');
    result=(await db.query('insert into escalations(ticket_id,reason,owner,due_at) values($1,$2,$3,$4) returning *',[id,required(o,'reason'),required(o,'owner'),instant(required(o,'due'))]))[0];
   }
  }
  if(!result)throw Error('Command not implemented');
  await audit(db,actor,cmd,id,{options:Object.fromEntries(Object.entries(o).filter(([k])=>!['actor','json','dry-run'].includes(k))),result});
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');
  return o['dry-run']?{dry_run:true,result}:result;
 }catch(e){await db.exec('ROLLBACK');throw e;}
}
function stable(x){if(Array.isArray(x))return JSON.stringify(x.map(stable));if(x&&typeof x==='object')return JSON.stringify(Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])));return JSON.stringify(x);}
export function human(data){
 const value=x=>x==null?'':x instanceof Date?x.toISOString().slice(0,16).replace('T',' ')+' UTC':typeof x==='object'?JSON.stringify(x):String(x);
 if(Array.isArray(data)){
  if(!data.length)return 'Nothing here.';
  return textTable(data,Object.keys(data[0]).map(key=>({key,label:key.replaceAll('_',' '),format:x=>value(x).replace(/\n/g,' ')})));
 }
 return Object.entries(data).map(([k,v])=>`${k}\n${!(v instanceof Date)&&(Array.isArray(v)||v&&typeof v==='object')?human(v):value(v)}`).join('\n\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{const args=process.argv.slice(2);parse(args);db=await getDb();const result=await dispatch(db,args);console.log(args.includes('--json')?JSON.stringify(result,null,2):human(result));}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
