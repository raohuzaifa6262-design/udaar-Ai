import type { Database } from '@/lib/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']

export type MonthlyTotal = {
  month: string   // e.g. "May 2025"
  year: number
  monthIndex: number
  udhaar: number
  payment: number
  net: number     // udhaar - payment (positive = more lent out)
}

export type CustomerBalance = {
  customerId: string
  totalUdhaar: number
  totalPayment: number
  balance: number   // positive = customer owes you, negative = you owe them
}

/** Group transactions by YYYY-MM for monthly aggregation */
export function calcMonthlyTotals(transactions: Transaction[]): MonthlyTotal[] {
  const map = new Map<string, MonthlyTotal>()

  for (const tx of transactions) {
    const date = new Date(tx.transaction_date)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!map.has(key)) {
      map.set(key, {
        month: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
        udhaar: 0,
        payment: 0,
        net: 0,
      })
    }

    const entry = map.get(key)!
    if (tx.type === 'udhaar') {
      entry.udhaar += Number(tx.amount)
    } else {
      entry.payment += Number(tx.amount)
    }
    entry.net = entry.udhaar - entry.payment
  }

  // Sort newest first
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([, v]) => v)
}

/** Calculate the running balance for a single customer's transactions */
export function calcCustomerBalance(transactions: Transaction[]): CustomerBalance & {
  runningLedger: (Transaction & { runningBalance: number })[]
} {
  let balance = 0
  const runningLedger = [...transactions]
    .sort((a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime())
    .map((tx) => {
      balance += tx.type === 'udhaar' ? Number(tx.amount) : -Number(tx.amount)
      return { ...tx, runningBalance: balance }
    })

  const totalUdhaar = transactions
    .filter((t) => t.type === 'udhaar')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalPayment = transactions
    .filter((t) => t.type === 'payment')
    .reduce((s, t) => s + Number(t.amount), 0)

  return {
    customerId: transactions[0]?.customer_id ?? '',
    totalUdhaar,
    totalPayment,
    balance: totalUdhaar - totalPayment,
    runningLedger,
  }
}

/** Summary stats across all transactions */
export function calcDashboardStats(transactions: Transaction[]) {
  const totalUdhaar = transactions
    .filter((t) => t.type === 'udhaar')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalRecovered = transactions
    .filter((t) => t.type === 'payment')
    .reduce((s, t) => s + Number(t.amount), 0)

  const outstanding = totalUdhaar - totalRecovered

  // This month
  const now = new Date()
  const thisMonthTxs = transactions.filter((t) => {
    const d = new Date(t.transaction_date)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const thisMonthUdhaar = thisMonthTxs.filter((t) => t.type === 'udhaar').reduce((s, t) => s + Number(t.amount), 0)
  const thisMonthPayment = thisMonthTxs.filter((t) => t.type === 'payment').reduce((s, t) => s + Number(t.amount), 0)

  return { totalUdhaar, totalRecovered, outstanding, thisMonthUdhaar, thisMonthPayment }
}

/** Format amount as INR */
export function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

/** Format date nicely */
export function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
