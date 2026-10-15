import {parseCsv,pick} from './csv.mjs';
// Vendor CSV uses the exporting account's local time. Resolve against the named
// IANA zone and reject ambiguous/nonexistent wall times rather than guess.
export function timestamp(value,zone){
 if(!value)return null;
 const s=String(value).trim();
 const m=s.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/);
 if(!m)throw Error(`Invalid timestamp: ${s}; use YYYY-MM-DD HH:mm:ss`);
 const parts=m.slice(1,7).map(x=>Number(x||0));const [y,mo,d,h,mi,se]=parts;
 const wall=Date.UTC(y,mo-1,d,h,mi,se);
 if(new Date(wall).toISOString().slice(0,19)!==`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]||'00'}`)throw Error(`Invalid timestamp: ${s}`);
 if(m[7]){const n=Date.parse(s.replace(' ','T'));if(!Number.isFinite(n))throw Error('Invalid timestamp offset');return new Date(n).toISOString();}
 if(!zone)throw Error('CSV local timestamps require --timezone=<IANA zone>');
 const f=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const local=n=>{const p=Object.fromEntries(f.formatToParts(new Date(n)).map(x=>[x.type,x.value]));return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);};
 const offsets=new Set([-86400000,0,86400000].map(delta=>local(wall+delta)-(wall+delta)));
 const matches=[...offsets].map(o=>wall-o).filter(n=>local(n)===wall);
 if(matches.length!==1)throw Error(`Ambiguous or nonexistent local time ${s} in ${zone}; provide an explicit offset in the export copy`);
 return new Date(matches[0]).toISOString();
}
export function convertCsv(text,zone){
 const rows=parseCsv(text);if(!rows.length)throw Error('CSV contains no records');
 for(const key of ['ID','Subject','Status','Created at','Updated at'])if(!Object.keys(rows[0]).some(k=>k.toLowerCase()===key.toLowerCase()))throw Error(`Missing Zendesk column: ${key}`);
 const seen=new Set();return rows.map((r,i)=>{
  const get=(...keys)=>pick(r,...keys).trim();const id=get('ID');
  if(!/^\d+$/.test(id)||seen.has(id))throw Error(`Duplicate or invalid ticket ID at row ${i+2}`);seen.add(id);
  const subject=get('Subject');if(!subject)throw Error(`Missing subject at row ${i+2}`);
  const status=get('Status').toLowerCase().replace('on-hold','hold');
  if(!['new','open','pending','hold','solved','closed'].includes(status))throw Error(`Unsupported status ${status}: map custom statuses before import`);
  const priority=get('Priority').toLowerCase()||'normal';if(!['low','normal','high','urgent'].includes(priority))throw Error(`Unsupported priority ${priority}`);
  const opened=timestamp(get('Created at'),zone),updated=timestamp(get('Updated at'),zone);
  if(!opened||!updated||updated<opened)throw Error(`Invalid chronology for ${id}`);
  const minutes=get('First reply time in minutes');if(minutes&&!/^\d+(\.\d+)?$/.test(minutes))throw Error(`Invalid first reply minutes for ${id}`);
  const first=minutes?new Date(Date.parse(opened)+Number(minutes)*60000).toISOString():null;
  if(first&&first>updated)throw Error(`First reply exceeds last update for ${id}`);
  const solved=timestamp(get('Solved at'),zone);if(solved&&(solved<opened||solved>updated))throw Error(`Invalid solved date for ${id}`);
  const reopens=get('Reopens')||'0';if(!/^\d+$/.test(reopens)||!Number.isSafeInteger(Number(reopens)))throw Error('Invalid reopen count');
  return {external_id:id,subject,status,priority,customer:get('Organization')||'Unassigned imported customers',requester:get('Requester')||'Unknown requester',requester_email:get('Requester email'),assignee:get('Assignee')||null,team:get('Group')||'Unassigned',channel:get('Via')||'unknown',tags:get('Tags').split(/[ ,]+/).filter(Boolean),opened_at:opened,last_activity_at:updated,first_replied_at:first,solved_at:solved,task_due_at:timestamp(get('Due date'),zone),reopens:Number(reopens),satisfaction:get('Satisfaction Score')||null,source_row:r};
 });
}
