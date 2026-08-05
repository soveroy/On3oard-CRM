-- Prospect Engine machine-to-machine imports and audit ledger.
create table prospect_imports (
  id uuid primary key default gen_random_uuid(),
  source_system text not null default 'on3oard-prospect-engine',
  source_lead_id text not null,
  company_id uuid references companies(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  action text not null check (action in ('created','updated','duplicate','rejected')),
  content_hash text not null,
  metadata jsonb not null default '{}'::jsonb,
  error text,
  imported_at timestamptz not null default now(),
  unique (source_system, source_lead_id)
);

alter table prospect_imports enable row level security;
create policy "auth read prospect imports" on prospect_imports
  for select using (auth.role() = 'authenticated');

create index idx_prospect_imports_company on prospect_imports(company_id);
create index idx_prospect_imports_contact on prospect_imports(contact_id);
create index idx_prospect_imports_imported_at on prospect_imports(imported_at desc);
