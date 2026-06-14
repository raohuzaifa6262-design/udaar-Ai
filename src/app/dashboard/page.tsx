import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardClient from './dashboard-client'

export default async function DashboardPage(props: { searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Resolve search parameters for Next.js 15+
  const searchParams = await props.searchParams
  const range = searchParams?.range || 'all'

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Calculate date range
  let fromDate = null
  if (range === '7') {
    fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  } else if (range === '30') {
    fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  // Fetch journal entries
  let query = (supabase as any)
    .from('journal_entries')
    .select('*, customers(name), suppliers(name)')
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })

  if (fromDate) {
    query = query.gte('transaction_date', fromDate)
  }

  const { data: entries } = await query
  const txList: any[] = entries ?? []

  // Calculate Double-Entry Stats
  let totalSales = 0
  let totalExpenses = 0
  let accountsReceivableDebit = 0
  let accountsReceivableCredit = 0
  let cashDebit = 0
  let cashCredit = 0

  txList.forEach(tx => {
    const amt = Number(tx.amount)
    
    // Sales
    if (tx.credit_account === 'Sales') totalSales += amt
    
    // Expenses
    if (tx.debit_account?.startsWith('Expense')) totalExpenses += amt

    // Accounts Receivable
    if (tx.debit_account === 'Accounts Receivable') accountsReceivableDebit += amt
    if (tx.credit_account === 'Accounts Receivable') accountsReceivableCredit += amt

    // Cash
    if (tx.debit_account === 'Cash') cashDebit += amt
    if (tx.credit_account === 'Cash') cashCredit += amt
  })

  const outstandingUdhaar = accountsReceivableDebit - accountsReceivableCredit
  const cashBalance = cashDebit - cashCredit

  // Recent 5 transactions for activity feed
  const recentTransactions = txList.slice(0, 5)

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
      recentTransactions={recentTransactions}
      totalSales={totalSales}
      totalExpenses={totalExpenses}
      cashBalance={cashBalance}
      outstandingUdhaar={outstandingUdhaar}
      currentRange={range as string}
    />
  )
}
