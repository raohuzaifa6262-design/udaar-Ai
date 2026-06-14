'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Searches for a customer by name (case-insensitive).
 */
export async function searchCustomers(nameQuery: string): Promise<any[]> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .ilike('name', `%${nameQuery}%`)

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Searches for a supplier by name (case-insensitive).
 */
export async function searchSuppliers(nameQuery: string): Promise<any[]> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('user_id', user.id)
    .ilike('name', `%${nameQuery}%`)

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Creates a new customer
 */
export async function createCustomer(name: string, phone?: string): Promise<any> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      name,
      phone: phone || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Creates a new supplier
 */
export async function createSupplier(name: string, phone?: string): Promise<any> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      user_id: user.id,
      name,
      phone: phone || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Adds a Double-Entry Journal Entry
 */
export async function recordJournalEntry(
  transaction_type: string,
  amount: number,
  debit_account: string,
  credit_account: string,
  payment_method: string,
  description: string,
  customer_id?: string | null,
  supplier_id?: string | null
): Promise<any> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: user.id,
      transaction_type,
      amount,
      debit_account,
      credit_account,
      payment_method,
      description: description || null,
      customer_id: customer_id || null,
      supplier_id: supplier_id || null,
      transaction_date: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Generates a monthly financial report across all double-entry accounts
 */
export async function generateMonthlyReport(): Promise<any> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Calculate first day of current month
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const firstDayISO = firstDay.toISOString()

  // Fetch all journal entries for the month
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*, customers(name), suppliers(name)')
    .eq('user_id', user.id)
    .gte('transaction_date', firstDayISO)

  if (error) throw new Error(error.message)

  const entries = data as any[]

  // Compute standard accounting reports
  const accounts: Record<string, { debit: number, credit: number, balance: number }> = {}

  entries.forEach(entry => {
    const amt = Number(entry.amount)
    
    // Debit side
    if (!accounts[entry.debit_account]) accounts[entry.debit_account] = { debit: 0, credit: 0, balance: 0 }
    accounts[entry.debit_account].debit += amt
    
    // Credit side
    if (!accounts[entry.credit_account]) accounts[entry.credit_account] = { debit: 0, credit: 0, balance: 0 }
    accounts[entry.credit_account].credit += amt
  })

  // Calculate balances based on normal account balances
  // Asset/Expense = Debit - Credit
  // Liability/Equity/Revenue = Credit - Debit
  const assetTypes = ['Cash', 'Bank', 'Inventory', 'Accounts Receivable']
  const expenseTypes = ['Expense']

  for (const acc in accounts) {
    const d = accounts[acc].debit
    const c = accounts[acc].credit
    let isDebitNormal = false

    if (assetTypes.includes(acc) || acc.startsWith('Expense')) {
      isDebitNormal = true
    }

    accounts[acc].balance = isDebitNormal ? (d - c) : (c - d)
  }

  // Monthly Sales Summary
  const monthlySales = accounts['Sales']?.credit || 0
  
  // Monthly Expense Summary
  const monthlyExpenses = Object.keys(accounts)
    .filter(k => k.startsWith('Expense'))
    .reduce((sum, k) => sum + accounts[k].balance, 0)

  const netProfit = monthlySales - monthlyExpenses

  return {
    month: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
    trialBalance: accounts,
    profitAndLoss: {
      sales: monthlySales,
      expenses: monthlyExpenses,
      netProfit: netProfit
    },
    cashBook: accounts['Cash']?.balance || 0,
    bankBook: accounts['Bank']?.balance || 0,
    totalEntries: entries.length
  }
}
