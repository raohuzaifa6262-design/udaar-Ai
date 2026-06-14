'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteTransaction } from '@/lib/actions/transactions'
import { calcMonthlyTotals, calcDashboardStats, fmt, fmtDate } from '@/lib/ledger'
import TransactionForm from '@/components/transaction-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight,
  ArrowDownLeft, MoreVertical, Trash2, Loader2, ReceiptText,
  CalendarDays, ChevronDown, ChevronRight,
} from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

interface Props {
  transactions: Transaction[]
  customers: Customer[]
  userId: string
}

export default function LedgerClient({ transactions: initial, customers, userId }: Props) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set([
    // default: expand the most recent month
    initial.length > 0
      ? `${new Date(initial[0].transaction_date).getFullYear()}-${String(new Date(initial[0].transaction_date).getMonth() + 1).padStart(2, '0')}`
      : ''
  ]))

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers])
  const stats = useMemo(() => calcDashboardStats(transactions), [transactions])
  const monthly = useMemo(() => calcMonthlyTotals(transactions), [transactions])

  // Group transactions by month key
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of transactions) {
      const d = new Date(tx.transaction_date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    }
    return map
  }, [transactions])

  function toggleMonth(key: string) {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function handleDelete(id: string, customerId: string) {
    setDeletingId(id)
    const res = await deleteTransaction(id, customerId)
    if (res.error) { toast.error(res.error); setDeletingId(null); return }
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    toast.success('Transaction deleted')
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white transition-colors text-sm">
              ← Dashboard
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold">Ledger</span>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold gap-2 h-9"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction Ledger</h1>
          <p className="text-slate-400 text-sm mt-0.5">{transactions.length} total transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-red-400" /> Total Lent
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold text-red-400">{fmt(stats.totalUdhaar)}</p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-green-400" /> Recovered
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold text-green-400">{fmt(stats.totalRecovered)}</p>
            </CardContent>
          </Card>

          <Card className="col-span-2 border border-purple-500/20 bg-gradient-to-br from-purple-600/10 to-blue-600/10 backdrop-blur-sm">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-purple-400" /> Outstanding
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-xl font-bold text-purple-300">{fmt(stats.outstanding)}</p>
              <p className="text-xs text-slate-500 mt-0.5">This month: {fmt(stats.thisMonthUdhaar)} lent</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Summary */}
        {monthly.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="w-4 h-4" /> Monthly Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {monthly.slice(0, 6).map((m) => (
                <div key={m.month} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-medium text-white">{m.month}</p>
                    <p className="text-xs text-slate-500">
                      ↑{fmt(m.udhaar)} · ↓{fmt(m.payment)}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${m.net > 0 ? 'text-red-400' : m.net < 0 ? 'text-green-400' : 'text-slate-400'}`}>
                    {m.net > 0 ? '+' : ''}{fmt(m.net)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ReceiptText className="w-4 h-4" /> Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
                <ReceiptText className="w-8 h-8 text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-slate-300 font-medium text-lg">No transactions yet</p>
                <p className="text-slate-500 text-sm mt-1">Record your first udhaar or payment</p>
              </div>
              <Button onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white gap-2">
                <Plus className="w-4 h-4" /> Add Transaction
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {monthly.map((m) => {
                const key = `${m.year}-${String(m.monthIndex + 1).padStart(2, '0')}`
                const txs = grouped.get(key) ?? []
                const isOpen = expandedMonths.has(key)

                return (
                  <div key={key} className="border border-white/10 rounded-xl overflow-hidden">
                    {/* Month header */}
                    <button
                      onClick={() => toggleMonth(key)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/8 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        <span className="text-sm font-semibold text-white">{m.month}</span>
                        <span className="text-xs text-slate-500">{txs.length} transactions</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-red-400">{fmt(m.udhaar)} lent</span>
                        <span className="text-green-400">{fmt(m.payment)} got</span>
                      </div>
                    </button>

                    {/* Transactions */}
                    {isOpen && (
                      <div className="divide-y divide-white/5 bg-slate-950/30">
                        {txs.map((tx) => {
                          const customer = customerMap.get(tx.customer_id)
                          const isUdhaar = tx.type === 'udhaar'
                          return (
                            <div key={tx.id} className="flex items-center justify-between px-4 py-3 group hover:bg-white/5 transition-colors">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isUdhaar ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                                  {isUdhaar
                                    ? <ArrowUpRight className="w-4 h-4 text-red-400" />
                                    : <ArrowDownLeft className="w-4 h-4 text-green-400" />
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-slate-200 truncate">
                                    {customer?.name ?? 'Unknown'}
                                    {tx.note && <span className="text-slate-500 font-normal ml-1">· {tx.note}</span>}
                                  </p>
                                  <p className="text-xs text-slate-500">{fmtDate(tx.transaction_date)}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <p className={`text-sm font-bold ${isUdhaar ? 'text-red-400' : 'text-green-400'}`}>
                                    {isUdhaar ? '-' : '+'}{fmt(Number(tx.amount))}
                                  </p>
                                  <Badge variant="outline" className={`text-xs border-0 ${isUdhaar ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {isUdhaar ? 'udhaar' : 'payment'}
                                  </Badge>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 outline-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all">
                                    <MoreVertical className="w-4 h-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300 w-32">
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(tx.id, tx.customer_id)}
                                      disabled={deletingId === tx.id}
                                      className="hover:bg-red-500/10 text-red-400 cursor-pointer gap-2 text-sm"
                                    >
                                      {deletingId === tx.id
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
                                        : <><Trash2 className="w-3.5 h-3.5" /> Delete</>
                                      }
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <TransactionForm
          customers={customers}
          onClose={() => setShowForm(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
