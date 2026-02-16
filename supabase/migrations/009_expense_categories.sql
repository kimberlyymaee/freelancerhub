create table if not exists expense_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table expense_categories enable row level security;

create policy "Users can view own expense categories"
  on expense_categories for select using (user_id = auth.uid());

create policy "Users can insert own expense categories"
  on expense_categories for insert with check (user_id = auth.uid());

create policy "Users can update own expense categories"
  on expense_categories for update using (user_id = auth.uid());

create policy "Users can delete own expense categories"
  on expense_categories for delete using (user_id = auth.uid());
