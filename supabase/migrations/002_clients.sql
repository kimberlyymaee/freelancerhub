create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  address text,
  status text default 'active' check (status in ('active', 'on_hold', 'completed', 'prospect')),
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table clients enable row level security;

create policy "Users can view own clients"
  on clients for select using (user_id = auth.uid());

create policy "Users can insert own clients"
  on clients for insert with check (user_id = auth.uid());

create policy "Users can update own clients"
  on clients for update using (user_id = auth.uid());

create policy "Users can delete own clients"
  on clients for delete using (user_id = auth.uid());

create trigger clients_updated_at
  before update on clients
  for each row execute procedure public.update_updated_at();
