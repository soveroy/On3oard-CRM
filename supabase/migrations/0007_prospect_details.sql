-- Structured Prospect Engine fields for CRM operations and reporting.
alter table companies
  add column if not exists address text,
  add column if not exists discovery_source_url text;

alter table contacts
  add column if not exists prospect_lead_id text,
  add column if not exists best_employee text
    check (best_employee in ('hana','felix','aria')),
  add column if not exists best_score int
    check (best_score between 0 and 100),
  add column if not exists hana_score int
    check (hana_score between 0 and 100),
  add column if not exists felix_score int
    check (felix_score between 0 and 100),
  add column if not exists aria_score int
    check (aria_score between 0 and 100),
  add column if not exists prospect_approved_at timestamptz,
  add column if not exists prospect_approval_hash text,
  add column if not exists prospect_synced_at timestamptz;

create unique index if not exists idx_contacts_prospect_lead_unique
  on contacts(prospect_lead_id)
  where prospect_lead_id is not null;

create index if not exists idx_contacts_best_employee
  on contacts(best_employee)
  where best_employee is not null;
