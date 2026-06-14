-- ============================================================
-- UdhaarAI: Transaction Ledger Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Transactions table
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade not null,
  type text not null check (type in ('udhaar', 'payment')),
  amount numeric(12, 2) not null check (amount > 0),
  note text,
  transaction_date date not null default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS
alter table public.transactions enable row level security;

-- 3. RLS Policies
drop policy if exists "Users can view own transactions." on public.transactions;
create policy "Users can view own transactions." on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own transactions." on public.transactions;
create policy "Users can insert own transactions." on public.transactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own transactions." on public.transactions;
create policy "Users can update own transactions." on public.transactions
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own transactions." on public.transactions;
create policy "Users can delete own transactions." on public.transactions
  for delete using (auth.uid() = user_id);

-- 4. Auto updated_at trigger
drop trigger if exists handle_transactions_updated_at on public.transactions;
create trigger handle_transactions_updated_at before update on public.transactions
  for each row execute procedure moddatetime(updated_at);

-- 5. Helpful view: customer balances per user
-- balance > 0 means customer owes you | balance < 0 means you owe customer
create or replace view public.customer_balances as
  select
    t.user_id,
    t.customer_id,
    c.name as customer_name,
    c.phone,
    c.email,
    sum(case when t.type = 'udhaar' then t.amount else 0 end) as total_udhaar,
    sum(case when t.type = 'payment' then t.amount else 0 end) as total_paid,
    sum(case when t.type = 'udhaar' then t.amount else -t.amount end) as balance
  from public.transactions t
  join public.customers c on c.id = t.customer_id
  group by t.user_id, t.customer_id, c.name, c.phone, c.email;
