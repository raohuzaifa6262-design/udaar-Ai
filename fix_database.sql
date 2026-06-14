-- 1. Create or update the profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Make sure RLS is enabled for profiles
alter table public.profiles enable row level security;

-- Fix the trigger for new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Ensure customers table has the 'email' column
-- This will add the email column if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='customers' AND column_name='email') THEN
        ALTER TABLE public.customers ADD COLUMN email text;
    END IF;
END
$$;

-- 3. Recreate the customer_balances view
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
