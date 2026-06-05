-- On3oard CRM — triggers: timestamps, stage tracking, last_contacted, user provisioning

-- generic updated_at
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

create trigger trg_companies_updated before update on companies for each row execute function set_updated_at();
create trigger trg_contacts_updated before update on contacts for each row execute function set_updated_at();
create trigger trg_deals_updated before update on deals for each row execute function set_updated_at();

-- bump stage_changed_at only when stage actually changes
create or replace function bump_stage_changed() returns trigger as $$
begin
  if new.stage is distinct from old.stage then new.stage_changed_at = now(); end if;
  return new;
end; $$ language plpgsql;
create trigger trg_deal_stage before update on deals for each row execute function bump_stage_changed();

-- when an activity is logged, update the linked contact's last_contacted_at
create or replace function bump_last_contacted() returns trigger as $$
begin
  if new.contact_id is not null then
    update contacts set last_contacted_at = new.activity_date where id = new.contact_id;
  end if;
  return new;
end; $$ language plpgsql;
create trigger trg_activity_last_contacted after insert on activities for each row execute function bump_last_contacted();

-- auto-provision a public.users row on auth signup
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end; $$ language plpgsql security definer;
create trigger trg_auth_user_created after insert on auth.users for each row execute function handle_new_user();
