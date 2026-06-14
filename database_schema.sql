-- Run these DROP commands ONLY IF you want to start completely fresh and delete existing tables. 
-- Uncomment them by removing the '-- ' if needed:
-- DROP TABLE IF EXISTS public.settlements CASCADE;
-- DROP TABLE IF EXISTS public.debts CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Create Profiles Table (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Debts Table (The core tracking table)
create table if not exists public.debts (
  id uuid default gen_random_uuid() primary key,
  lender_id uuid references public.profiles(id) on delete cascade not null,
  borrower_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null,
  currency text default 'USD' not null,
  description text,
  status text default 'pending' check (status in ('pending', 'settled')),
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Settlements Table (For tracking partial or full payments)
create table if not exists public.settlements (
  id uuid default gen_random_uuid() primary key,
  debt_id uuid references public.debts(id) on delete cascade not null,
  payer_id uuid references public.profiles(id) on delete cascade not null,
  amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.debts enable row level security;
alter table public.settlements enable row level security;

-- 5. RLS Policies for Profiles
drop policy if exists "Profiles are viewable by everyone." on public.profiles;
create policy "Profiles are viewable by everyone." on public.profiles
  for select using (true);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- 6. RLS Policies for Debts
drop policy if exists "Users can view their own debts." on public.debts;
create policy "Users can view their own debts." on public.debts
  for select using (auth.uid() = lender_id or auth.uid() = borrower_id);

drop policy if exists "Users can insert their own debts." on public.debts;
create policy "Users can insert their own debts." on public.debts
  for insert with check (auth.uid() = lender_id or auth.uid() = borrower_id);

drop policy if exists "Users can update their own debts." on public.debts;
create policy "Users can update their own debts." on public.debts
  for update using (auth.uid() = lender_id or auth.uid() = borrower_id);

drop policy if exists "Users can delete their own debts." on public.debts;
create policy "Users can delete their own debts." on public.debts
  for delete using (auth.uid() = lender_id or auth.uid() = borrower_id);

-- 7. RLS Policies for Settlements
drop policy if exists "Users can view settlements for their debts." on public.settlements;
create policy "Users can view settlements for their debts." on public.settlements
  for select using (
    exists (
      select 1 from public.debts d 
      where d.id = public.settlements.debt_id 
      and (d.lender_id = auth.uid() or d.borrower_id = auth.uid())
    )
  );

drop policy if exists "Users can insert settlements for their debts." on public.settlements;
create policy "Users can insert settlements for their debts." on public.settlements
  for insert with check (
    exists (
      select 1 from public.debts d 
      where d.id = debt_id 
      and (d.lender_id = auth.uid() or d.borrower_id = auth.uid())
    )
  );

-- 8. Triggers for updated_at column on debts
create extension if not exists moddatetime schema extensions;

drop trigger if exists handle_updated_at on public.debts;
create trigger handle_updated_at before update on public.debts
  for each row execute procedure moddatetime (updated_at);

-- 9. Trigger to create a profile automatically when a user signs up via Supabase Auth
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
