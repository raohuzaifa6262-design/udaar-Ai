import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CustomerLedgerClient from './customer-ledger-client'

interface Props {
  params: Promise<{ customerId: string }>
}

export default async function CustomerLedgerPage({ params }: Props) {
  const { customerId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [txRes, custRes] = await Promise.all([
    supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('customer_id', customerId)
      .order('transaction_date', { ascending: false }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('customers').select('*').eq('id', customerId).eq('user_id', user.id).single(),
  ])

  if (!custRes.data) notFound()

  return (
    <CustomerLedgerClient
      customer={custRes.data}
      entries={txRes.data ?? []}
      userId={user.id}
    />
  )
}
