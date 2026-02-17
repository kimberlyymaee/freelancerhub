-- Add payment methods JSONB column to profiles
alter table profiles add column if not exists payment_methods jsonb default '[]'::jsonb;
