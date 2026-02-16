create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  category text not null,
  vendor text,
  description text,
  payment_method text,
  receipt_url text,
  is_tax_deductible boolean default true,
  project_id uuid references projects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table expenses enable row level security;

create policy "Users can view own expenses"
  on expenses for select using (user_id = auth.uid());

create policy "Users can insert own expenses"
  on expenses for insert with check (user_id = auth.uid());

create policy "Users can update own expenses"
  on expenses for update using (user_id = auth.uid());

create policy "Users can delete own expenses"
  on expenses for delete using (user_id = auth.uid());

create trigger expenses_updated_at
  before update on expenses
  for each row execute procedure public.update_updated_at();
