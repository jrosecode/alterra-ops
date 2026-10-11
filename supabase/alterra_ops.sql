-- Alterra Ops database setup. Run on dedicated Alterra Supabase project.
create table if not exists public.alterra_members (
  workspace_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','staff','viewer')),
  primary key (workspace_id,user_id)
);
create table if not exists public.alterra_records (
  workspace_id text not null,
  collection text not null check (collection in ('units','workOrders','inspections','capexProjects','turns','leasing')),
  record_id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  primary key (workspace_id,collection,record_id)
);
create index if not exists alterra_members_user_idx on public.alterra_members(user_id);
create index if not exists alterra_records_collection_idx on public.alterra_records(workspace_id,collection);
alter table public.alterra_members enable row level security;
alter table public.alterra_records enable row level security;
create policy "alterra_members_read" on public.alterra_members for select to authenticated using (user_id=(select auth.uid()));
create policy "alterra_records_read" on public.alterra_records for select to authenticated using (exists (select 1 from public.alterra_members m where m.workspace_id=alterra_records.workspace_id and m.user_id=(select auth.uid())));
create policy "alterra_records_insert" on public.alterra_records for insert to authenticated with check (updated_by=(select auth.uid()) and exists (select 1 from public.alterra_members m where m.workspace_id=alterra_records.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','staff')));
create policy "alterra_records_update" on public.alterra_records for update to authenticated using (exists (select 1 from public.alterra_members m where m.workspace_id=alterra_records.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','staff'))) with check (updated_by=(select auth.uid()) and exists (select 1 from public.alterra_members m where m.workspace_id=alterra_records.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','staff')));
create policy "alterra_records_delete" on public.alterra_records for delete to authenticated using (exists (select 1 from public.alterra_members m where m.workspace_id=alterra_records.workspace_id and m.user_id=(select auth.uid()) and m.role in ('admin','staff')));
revoke all on public.alterra_members,public.alterra_records from anon;
grant select on public.alterra_members to authenticated;
grant select,insert,update,delete on public.alterra_records to authenticated;
-- After creating the first Auth user, authorize them with:
-- insert into public.alterra_members(workspace_id,user_id,role)
-- values ('3350-alterra','REPLACE_WITH_AUTH_USER_UUID','admin');
-- Populate alterra_records with your verified property records before enabling the dashboard.
