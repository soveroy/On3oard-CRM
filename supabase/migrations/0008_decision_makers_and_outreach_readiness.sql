-- Multi-contact prospect intelligence and email compliance/audit foundations.
drop index if exists idx_contacts_prospect_lead_unique;

alter table contacts
  add column if not exists prospect_contact_key text,
  add column if not exists decision_employee text
    check (decision_employee in ('hana','felix','aria','all')),
  add column if not exists decision_confidence int
    check (decision_confidence between 0 and 100),
  add column if not exists decision_evidence_url text,
  add column if not exists decision_evidence_text text,
  add column if not exists decision_status text
    check (decision_status in ('ready','needs_review','rejected')),
  add column if not exists decision_review_reason text;

create unique index if not exists idx_contacts_prospect_contact_key
  on contacts(prospect_contact_key)
  where prospect_contact_key is not null;

create index if not exists idx_contacts_prospect_lead
  on contacts(prospect_lead_id)
  where prospect_lead_id is not null;

create table if not exists suppression_entries (
  id uuid primary key default gen_random_uuid(),
  suppression_type text not null check (suppression_type in ('email','domain')),
  value text not null,
  reason text not null,
  source text not null default 'manual',
  contact_id uuid references contacts(id) on delete set null,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (suppression_type, value)
);

alter table campaign_emails
  add column if not exists provider_message_id text,
  add column if not exists delivery_status text
    check (delivery_status in ('queued','sent','delivered','bounced','complained','failed','suppressed')),
  add column if not exists delivered_at timestamptz,
  add column if not exists bounced_at timestamptz,
  add column if not exists complained_at timestamptz,
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid(),
  add column if not exists unsubscribed_at timestamptz;

create unique index if not exists idx_campaign_emails_provider_message
  on campaign_emails(provider_message_id)
  where provider_message_id is not null;
create unique index if not exists idx_campaign_emails_unsubscribe_token
  on campaign_emails(unsubscribe_token);

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  webhook_id text not null unique,
  event_type text not null,
  provider_message_id text,
  recipient text,
  campaign_email_id uuid references campaign_emails(id) on delete set null,
  payload jsonb not null,
  occurred_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_email_events_provider_message
  on email_events(provider_message_id);
create index if not exists idx_email_events_recipient
  on email_events(recipient);

alter table suppression_entries enable row level security;
alter table email_events enable row level security;

create policy "auth rw suppression entries" on suppression_entries
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
create policy "auth read email events" on email_events
  for select using (auth.role() = 'authenticated');

create trigger trg_suppression_entries_updated before update on suppression_entries
  for each row execute function set_updated_at();
