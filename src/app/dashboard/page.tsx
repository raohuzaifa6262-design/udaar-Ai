import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch transactions (source of truth for balances)
  const { data: transactions } = await (supabase as any)
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  const txList: any[] = transactions ?? []

  // Fetch customers for the Add Debt form + customer name mapping
  const { data: customers } = await (supabase as any)
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('name')

  const customersList: any[] = customers ?? []

  return (
    <DashboardClient
      user={user}
      profile={profile}
      customers={customersList}
      transactions={txList}
    />
  )
}
