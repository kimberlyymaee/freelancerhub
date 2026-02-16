create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  client_id uuid references clients(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  invoice_number text not null,
  status text default 'draft' check (status in ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(12,2) default 0,
  tax_rate numeric(5,4) default 0,
  tax_amount numeric(12,2) default 0,
  total numeric(12,2) default 0,
  notes text,
  payment_terms text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table invoices enable row level security;

create policy "Users can view own invoices"
  on invoices for select using (user_id = auth.uid());

create policy "Users can insert own invoices"
  on invoices for insert with check (user_id = auth.uid());

create policy "Users can update own invoices"
  on invoices for update using (user_id = auth.uid());

create policy "Users can delete own invoices"
  on invoices for delete using (user_id = auth.uid());

create trigger invoices_updated_at
  before update on invoices
  for each row execute procedure public.update_updated_at();
