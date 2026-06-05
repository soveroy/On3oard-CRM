-- On3oard CRM — DEV SEED ONLY. Do NOT run in production. Strip before go-live.
insert into companies (id, name, industry, size, country) values
  ('11111111-1111-1111-1111-111111111111','PNH Group','Marine','500+','Singapore'),
  ('22222222-2222-2222-2222-222222222222','National University Polyclinics','Healthcare','201-500','Singapore')
on conflict (id) do nothing;

insert into contacts (id, full_name, job_title, company_id, emails, contact_type, lead_source) values
  ('aaaaaaaa-1111-1111-1111-111111111111','Joseph Lim','CEO','11111111-1111-1111-1111-111111111111', array['joseph@pnh.com.sg'],'Prospect','Referral'),
  ('bbbbbbbb-2222-2222-2222-222222222222','Kavitha','Head of HR','22222222-2222-2222-2222-222222222222', array['kavitha@nup.com.sg'],'Prospect','Inbound')
on conflict (id) do nothing;

insert into deals (id, name, company_id, primary_contact_id, engagement_type, value_sgd, probability, stage, close_date) values
  ('dddddddd-1111-1111-1111-111111111111','PNH — Full 4D Engagement','11111111-1111-1111-1111-111111111111','aaaaaaaa-1111-1111-1111-111111111111','Full 4D Engagement',100800,40,'Discovery','2025-09-30'),
  ('dddddddd-2222-2222-2222-222222222222','NUP — HR Strategy Advisory','22222222-2222-2222-2222-222222222222','bbbbbbbb-2222-2222-2222-222222222222','AI Strategy',18000,60,'Proposal Sent','2025-07-31')
on conflict (id) do nothing;
