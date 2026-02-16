-- Profiles table (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  full_name text,
  email text,
  phone text,
  address text,
  logo_url text,
  tax_id_tin text,
  default_currency text default 'PHP',
  default_hourly_rate numeric(10,2),
  tax_regime text default 'eight_percent' check (tax_regime in ('eight_percent', 'graduated')),
  vat_threshold numeric(12,2) default 3000000,
  tax_exemption_amount numeric(12,2) default 250000,
  default_payment_terms text default 'Due within 30 days',
  default_invoice_notes text,
  invoice_prefix text default 'INV',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update using (id = auth.uid());

create policy "Users can insert own profile"
  on profiles for insert with check (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure public.update_updated_at();
