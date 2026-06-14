-- Customers table: people you track debts with (may or may not be app users)
create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.customers enable row level security;

-- Users can only see their own customers
drop policy if exists "Users can view own customers." on public.customers;
create policy "Users can view own customers." on public.customers
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own customers." on public.customers;
create policy "Users can insert own customers." on public.customers
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own customers." on public.customers;
create policy "Users can update own customers." on public.customers
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own customers." on public.customers;
create policy "Users can delete own customers." on public.customers
  for delete using (auth.uid() = user_id);

-- Auto updated_at trigger
drop trigger if exists handle_customers_updated_at on public.customers;
create trigger handle_customers_updated_at before update on public.customers
  for each row execute procedure moddatetime(updated_at);
