insert into customers(id,name,owner,retention_purpose,retention_review) values
 ('10000001-0000-4000-8000-000000000001','Harbour Supply Demo','Mara','Resolve order enquiries',current_date+90),
 ('10000002-0000-4000-8000-000000000002','Harbour Parts Demo','Jules','Review support records',current_date-7),
 ('10000003-0000-4000-8000-000000000003','Alpine Wholesale Demo','Mara','',null) on conflict do nothing;
insert into tickets(id,customer_id,subject,requester,assignee,status,priority,opened_at,last_activity_at,reply_due_at,resolution_due_at,first_replied_at,solved_at,reopens,satisfaction,description,tags) values
 ('20000001-0000-4000-8000-000000000001','10000001-0000-4000-8000-000000000001','Missing carton on dispatch','Demo buyer',null,'new','urgent',now()-interval '2 days',now()-interval '2 days',now()-interval '1 day',now()+interval '1 day',null,null,0,null,'Check the dispatch count before replying.',array['dispatch']),
 ('20000002-0000-4000-8000-000000000002','10000001-0000-4000-8000-000000000001','Dispatch invoice mismatch','Demo buyer','Mara','open','high',now()-interval '8 days',now()-interval '4 days',now()-interval '7 days',now()-interval '1 day',now()-interval '7 days',null,2,'Bad','Repeated mismatch needs the warehouse owner.',array['dispatch','invoice']),
 ('20000003-0000-4000-8000-000000000003','10000002-0000-4000-8000-000000000002','Replacement part approval','Demo buyer','Jules','pending','normal',now()-interval '12 days',now()-interval '6 days',now()-interval '11 days',now()+interval '2 days',now()-interval '11 days',null,0,null,'Waiting for the buyer to confirm the part code.',array['parts']),
 ('20000004-0000-4000-8000-000000000004','10000003-0000-4000-8000-000000000003','Portal access reset','Demo buyer','Mara','solved','low',now()-interval '6 days',now()-interval '3 days',null,null,now()-interval '5 days',now()-interval '3 days',0,'Good','Access was reset after identity checks.',array['access']),
 ('20000005-0000-4000-8000-000000000005','10000003-0000-4000-8000-000000000003','Dispatch tracking missing','Demo buyer','Jules','hold','normal',now()-interval '4 days',now()-interval '3 days',null,null,null,null,1,null,'Waiting for carrier confirmation.',array['dispatch']) on conflict do nothing;
insert into notes(id,ticket_id,kind,body,actor,occurred_at) values
 ('30000001-0000-4000-8000-000000000001','20000002-0000-4000-8000-000000000002','internal','Check the carrier record. No refund approved.','Mara',now()-interval '4 days'),
 ('30000002-0000-4000-8000-000000000002','20000003-0000-4000-8000-000000000003','reply','Recorded demonstration of a reply sent elsewhere requesting the part code.','Jules',now()-interval '6 days') on conflict do nothing;
insert into escalations(id,ticket_id,reason,owner,due_at) values
 ('40000000-0000-4000-8000-000000000001','20000002-0000-4000-8000-000000000002','Repeated invoice mismatch','Warehouse lead',now()-interval '1 day') on conflict do nothing;
