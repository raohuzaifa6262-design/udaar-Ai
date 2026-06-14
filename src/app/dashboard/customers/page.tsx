import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CustomersClient from './customers-client'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: customers }, { data: transactions }] = await Promise.all([
    supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true }),
    supabase
      .from('transactions')
      .select('customer_id, type, amount')
      .eq('user_id', user.id)
  ])

  const balances: Record<string, number> = {}
  const txList = (transactions as any[]) ?? []
  for (const tx of txList) {
    const current = balances[tx.customer_id] ?? 0
    const change = tx.type === 'udhaar' ? Number(tx.amount) : -Number(tx.amount)
    balances[tx.customer_id] = current + change
  }

  return <CustomersClient customers={customers ?? []} userId={user.id} balances={balances} />
}
