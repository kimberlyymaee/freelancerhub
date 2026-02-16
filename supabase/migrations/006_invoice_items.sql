create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade not null,
  description text not null,
  quantity numeric(10,2) default 1,
  unit_price numeric(12,2) not null,
  amount numeric(12,2) not null,
  created_at timestamptz default now()
);

alter table invoice_items enable row level security;

-- Invoice items are accessible if the user owns the parent invoice
create policy "Users can view own invoice items"
  on invoice_items for select
  using (exists (
    select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()
  ));

create policy "Users can insert own invoice items"
  on invoice_items for insert
  with check (exists (
    select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()
  ));

create policy "Users can update own invoice items"
  on invoice_items for update
  using (exists (
    select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()
  ));

create policy "Users can delete own invoice items"
  on invoice_items for delete
  using (exists (
    select 1 from invoices where invoices.id = invoice_items.invoice_id and invoices.user_id = auth.uid()
  ));
