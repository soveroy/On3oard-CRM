-- On3oard CRM — email campaigns with human-in-the-loop approval
create table email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brief text not null,                   -- what the email should say (user's prompt)
  subject_line text not null,
  audience text not null default 'all'   -- 'prospects' | 'active' | 'past' | 'all'
    check (audience in ('prospects','active','past','all')),
  status text not null default 'draft'   -- 'draft' | 'generating' | 'review' | 'sending' | 'sent'
    check (status in ('draft','generating','review','sending','sent')),
  model text not null default 'claude-sonnet-4',
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table campaign_emails (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references email_campaigns(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  to_name text not null,
  to_email text not null,
  subject text not null,
  body text not null,                    -- generated email body (HTML or plain)
  status text not null default 'pending' -- 'pending' | 'approved' | 'rejected' | 'sent' | 'failed'
    check (status in ('pending','approved','rejected','sent','failed')),
  sent_at timestamptz,
  error text,
  created_at timestamptz default now()
);

alter table email_campaigns enable row level security;
alter table campaign_emails enable row level security;
create policy "auth rw campaigns" on email_campaigns for all using (auth.role() = 'authenticated');
create policy "auth rw campaign_emails" on campaign_emails for all using (auth.role() = 'authenticated');

create trigger trg_campaigns_updated before update on email_campaigns
  for each row execute function set_updated_at();

create index idx_campaign_emails_campaign on campaign_emails(campaign_id);
create index idx_campaign_emails_status on campaign_emails(status);
