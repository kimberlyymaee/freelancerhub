create table if not exists time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  date date not null default current_date,
  hours numeric(6,2) not null,
  description text,
  is_billable boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table time_entries enable row level security;

create policy "Users can view own time entries"
  on time_entries for select using (user_id = auth.uid());

create policy "Users can insert own time entries"
  on time_entries for insert with check (user_id = auth.uid());

create policy "Users can update own time entries"
  on time_entries for update using (user_id = auth.uid());

create policy "Users can delete own time entries"
  on time_entries for delete using (user_id = auth.uid());

create trigger time_entries_updated_at
  before update on time_entries
  for each row execute procedure public.update_updated_at();
