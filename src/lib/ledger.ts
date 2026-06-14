import type { Database } from '@/lib/database.types'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']

export type MonthlyTotal = {
  month: string   // e.g. "May 2025"
  year: number
  monthIndex: number
  sales: number
  expenses: number
  udhaarGiven: number
  paymentReceived: number
  net: number     // Total Sales - Total Expenses for dashboard summary
}

export type CustomerBalance = {
  customerId: string
  totalUdhaar: number
  totalPayment: number
  balance: number   // positive = customer owes you, negative = you owe them
}

/** Group journal entries by YYYY-MM for monthly aggregation */
export function calcMonthlyTotals(entries: JournalEntry[]): MonthlyTotal[] {
  const map = new Map<string, MonthlyTotal>()

  for (const tx of entries) {
    const date = new Date(tx.transaction_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!map.has(key)) {
      map.set(key, {
        month: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        sales: 0,
        expenses: 0,
        udhaarGiven: 0,
        paymentReceived: 0,
        net: 0,
      })
    }

    const entry = map.get(key)!
    const amt = Number(tx.amount)

    // Sales vs Expenses
    if (tx.credit_account === 'Sales') entry.sales += amt
    if (tx.debit_account?.startsWith('Expense')) entry.expenses += amt

    // Udhaar vs Payment Tracking
    if (tx.debit_account === 'Accounts Receivable') entry.udhaarGiven += amt
    if (tx.credit_account === 'Accounts Receivable') entry.paymentReceived += amt

    entry.net = entry.sales - entry.expenses
  }

  // Sort newest first
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, v]) => v)
}

/** Calculate the running balance for a single customer's transactions */
export function calcCustomerBalance(entries: JournalEntry[], customerId: string): CustomerBalance & {
  runningLedger: (JournalEntry & { runningBalance: number })[]
} {
  let balance = 0
  const customerEntries = entries.filter(e => e.customer_id === customerId)

  const runningLedger = [...customerEntries]
    .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
    .map((tx) => {
      // For a customer: Accounts Receivable Debit increases balance owed. Credit decreases it.
      if (tx.debit_account === 'Accounts Receivable') balance += Number(tx.amount)
      if (tx.credit_account === 'Accounts Receivable') balance -= Number(tx.amount)
      return { ...tx, runningBalance: balance }
    })

  let totalUdhaar = 0
  let totalPayment = 0
  customerEntries.forEach(tx => {
    if (tx.debit_account === 'Accounts Receivable') totalUdhaar += Number(tx.amount)
    if (tx.credit_account === 'Accounts Receivable') totalPayment += Number(tx.amount)
  })

  return {
    customerId,
    totalUdhaar,
    totalPayment,
    balance: totalUdhaar - totalPayment,
    runningLedger,
  }
}

/** Summary stats across all journal entries */
export function calcDashboardStats(entries: JournalEntry[]) {
  let totalSales = 0
  let totalExpenses = 0
  let outstanding = 0

  entries.forEach(tx => {
    const amt = Number(tx.amount)
    if (tx.credit_account === 'Sales') totalSales += amt
    if (tx.debit_account?.startsWith('Expense')) totalExpenses += amt
    if (tx.debit_account === 'Accounts Receivable') outstanding += amt
    if (tx.credit_account === 'Accounts Receivable') outstanding -= amt
  })

  // This month
  const now = new Date()
  const thisMonthEntries = entries.filter((t) => {
    const d = new Date(t.transaction_date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  
  let thisMonthSales = 0
  let thisMonthExpenses = 0
  thisMonthEntries.forEach(tx => {
    const amt = Number(tx.amount)
    if (tx.credit_account === 'Sales') thisMonthSales += amt
    if (tx.debit_account?.startsWith('Expense')) thisMonthExpenses += amt
  })

  return { totalSales, totalExpenses, outstanding, thisMonthSales, thisMonthExpenses }
}

/** Format amount as PKR */
export function fmt(amount: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(amount)
}

/** Format date nicely */
export function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
