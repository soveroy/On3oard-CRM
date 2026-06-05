-- On3oard CRM — app settings (single-row singleton)
create table app_settings (
  id text primary key default 'singleton',
  stages text[] default array['Lead','Qualified','Discovery','Proposal Sent','Negotiation','Won','Lost'],
  engagement_types text[] default array['AI Strategy','ESG/Sustainability','Grant Advisory','Full 4D Engagement','Other'],
  stale_threshold_days int default 14,
  updated_at timestamptz default now()
);
alter table app_settings enable row level security;
create policy "auth read app_settings"   on app_settings for select using (auth.role() = 'authenticated');
create policy "auth write app_settings"  on app_settings for insert with check (auth.role() = 'authenticated');
create policy "auth update app_settings" on app_settings for update using (auth.role() = 'authenticated');
insert into app_settings (id) values ('singleton') on conflict (id) do nothing;
