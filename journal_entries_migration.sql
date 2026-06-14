-- Migration for Double-Entry Accounting
-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own suppliers" 
ON public.suppliers FOR ALL USING (auth.uid() = user_id);

-- 2. Journal Entries Table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  transaction_type TEXT NOT NULL, -- e.g., 'Sale', 'Purchase', 'Expense', 'Payment Received'
  amount NUMERIC NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  description TEXT,
  payment_method TEXT NOT NULL, -- e.g., 'Cash', 'Bank', 'Easypaisa', 'None'
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for journal_entries
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own journal entries" 
ON public.journal_entries FOR ALL USING (auth.uid() = user_id);

-- 3. Migration of existing transactions (Optional but recommended)
-- This takes existing transactions and converts them to journal entries
INSERT INTO public.journal_entries (
  id, user_id, transaction_date, transaction_type, amount, customer_id, description, payment_method, debit_account, credit_account, created_at
)
SELECT 
  id, 
  user_id, 
  transaction_date, 
  CASE WHEN type = 'udhaar' THEN 'Udhaar Sale' ELSE 'Payment Received' END as transaction_type,
  amount, 
  customer_id, 
  note as description, 
  'Cash' as payment_method, -- Assumption for historical data
  CASE WHEN type = 'udhaar' THEN 'Accounts Receivable' ELSE 'Cash' END as debit_account,
  CASE WHEN type = 'udhaar' THEN 'Sales' ELSE 'Accounts Receivable' END as credit_account,
  created_at
FROM public.transactions
ON CONFLICT DO NOTHING;
