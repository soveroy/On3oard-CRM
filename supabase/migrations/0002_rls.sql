-- On3oard CRM — Row Level Security (single-tenant v1)
alter table users enable row level security;
alter table companies enable row level security;
alter table contacts enable row level security;
alter table deals enable row level security;
alter table activities enable row level security;
alter table tags enable row level security;

-- users: a user can see/update only their own profile row
create policy "users self read"   on users for select using (auth.uid() = id);
create policy "users self upsert" on users for insert with check (auth.uid() = id);
create policy "users self update" on users for update using (auth.uid() = id);

-- business tables: any authenticated user (single-tenant v1)
do $$
declare t text;
begin
  foreach t in array array['companies','contacts','deals','activities','tags'] loop
    execute format('create policy "auth read %1$s" on %1$s for select using (auth.role() = ''authenticated'');', t);
    execute format('create policy "auth write %1$s" on %1$s for insert with check (auth.role() = ''authenticated'');', t);
    execute format('create policy "auth update %1$s" on %1$s for update using (auth.role() = ''authenticated'');', t);
    execute format('create policy "auth delete %1$s" on %1$s for delete using (auth.role() = ''authenticated'');', t);
  end loop;
end $$;
