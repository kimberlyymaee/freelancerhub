create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  name text not null,
  type text default 'hourly' check (type in ('fixed', 'hourly', 'retainer')),
  rate numeric(10,2),
  estimated_hours numeric(8,2),
  deadline date,
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table projects enable row level security;

create policy "Users can view own projects"
  on projects for select using (user_id = auth.uid());

create policy "Users can insert own projects"
  on projects for insert with check (user_id = auth.uid());

create policy "Users can update own projects"
  on projects for update using (user_id = auth.uid());

create policy "Users can delete own projects"
  on projects for delete using (user_id = auth.uid());

create trigger projects_updated_at
  before update on projects
  for each row execute procedure public.update_updated_at();
