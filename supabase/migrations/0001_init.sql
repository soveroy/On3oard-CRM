-- On3oard CRM — core schema + indexes
create extension if not exists "pgcrypto";

create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'member',
  created_at timestamptz default now()
);

create table companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  industry text check (industry in ('FM','Marine','Healthcare','Education','F&B','Logistics','Other')),
  size text check (size in ('1-10','11-50','51-200','201-500','500+')),
  country text default 'Singapore',
  uen text,
  revenue_range text,
  owner_id uuid references users(id),
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  job_title text,
  company_id uuid references companies(id) on delete set null,
  emails text[] default '{}',
  phones text[] default '{}',
  linkedin_url text,
  whatsapp text,
  lead_source text check (lead_source in ('Referral','LinkedIn','Event','Cold Outreach','Inbound','Former Colleague')),
  contact_type text check (contact_type in ('Prospect','Active Client','Past Client','Partner','Referrer')),
  owner_id uuid references users(id),
  do_not_contact boolean default false,
  tags text[] default '{}',
  last_contacted_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_id uuid references companies(id) on delete set null,
  primary_contact_id uuid references contacts(id) on delete set null,
  engagement_type text check (engagement_type in ('AI Strategy','ESG/Sustainability','Grant Advisory','Full 4D Engagement','Other')),
  value_sgd numeric(12,2) default 0,
  probability int default 10 check (probability between 0 and 100),
  close_date date,
  stage text not null default 'Lead',
  source text check (source in ('Referral','LinkedIn','Event','Cold Outreach','Inbound','Former Colleague')),
  owner_id uuid references users(id),
  priority text default 'Medium' check (priority in ('High','Medium','Low')),
  lost_reason text check (lost_reason in ('Price','Timing','Competitor','No Budget','No Response','Other')),
  tags text[] default '{}',
  created_at timestamptz default now(),
  stage_changed_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('Call','Email','Meeting','WhatsApp','LinkedIn Message','Proposal Sent','Contract Sent','Note')),
  subject text,
  deal_id uuid references deals(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  activity_date timestamptz default now(),
  duration_mins int,
  outcome text check (outcome in ('Positive','Neutral','Negative','No Response')),
  next_action text,
  next_action_due timestamptz,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text default '#ff914d',
  entity_type text check (entity_type in ('contact','company','deal')),
  created_at timestamptz default now(),
  unique (name, entity_type)
);

create index idx_contacts_company on contacts(company_id);
create index idx_deals_company on deals(company_id);
create index idx_deals_contact on deals(primary_contact_id);
create index idx_deals_stage on deals(stage);
create index idx_deals_close_date on deals(close_date);
create index idx_deals_owner on deals(owner_id);
create index idx_activities_deal on activities(deal_id);
create index idx_activities_contact on activities(contact_id);
create index idx_activities_next_due on activities(next_action_due);
create unique index idx_contacts_email_unique on contacts (lower(emails[1])) where array_length(emails,1) > 0;
