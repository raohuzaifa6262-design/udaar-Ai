import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import LedgerClient from './ledger-client'

export default async function LedgerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: transactions }, { data: customers }] = await Promise.all([
    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('customers').select('*').eq('user_id', user.id).order('name'),
  ])

  return (
    <LedgerClient
      transactions={transactions ?? []}
      customers={customers ?? []}
      userId={user.id}
    />
  )
}
