create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  invoice_id uuid references invoices(id) on delete cascade not null,
  amount numeric(12,2) not null,
  date date not null default current_date,
  method text check (method in ('bank_transfer', 'cash', 'check', 'paypal', 'gcash', 'maya', 'wise', 'other')),
  reference_note text,
  created_at timestamptz default now()
);

alter table payments enable row level security;

create policy "Users can view own payments"
  on payments for select using (user_id = auth.uid());

create policy "Users can insert own payments"
  on payments for insert with check (user_id = auth.uid());

create policy "Users can update own payments"
  on payments for update using (user_id = auth.uid());

create policy "Users can delete own payments"
  on payments for delete using (user_id = auth.uid());
