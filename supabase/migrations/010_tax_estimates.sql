create table if not exists tax_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year integer not null,
  quarter integer not null check (quarter between 1 and 4),
  gross_revenue numeric(12,2) default 0,
  total_expenses numeric(12,2) default 0,
  exemption_applied numeric(12,2) default 0,
  taxable_amount_8pct numeric(12,2) default 0,
  tax_due_8pct numeric(12,2) default 0,
  taxable_amount_graduated numeric(12,2) default 0,
  tax_due_graduated numeric(12,2) default 0,
  percentage_tax_due numeric(12,2) default 0,
  filing_deadline date,
  is_filed boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, year, quarter)
);

alter table tax_estimates enable row level security;

create policy "Users can view own tax estimates"
  on tax_estimates for select using (user_id = auth.uid());

create policy "Users can insert own tax estimates"
  on tax_estimates for insert with check (user_id = auth.uid());

create policy "Users can update own tax estimates"
  on tax_estimates for update using (user_id = auth.uid());

create policy "Users can delete own tax estimates"
  on tax_estimates for delete using (user_id = auth.uid());

create trigger tax_estimates_updated_at
  before update on tax_estimates
  for each row execute procedure public.update_updated_at();
