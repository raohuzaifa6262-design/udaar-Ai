'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { deleteTransaction } from '@/lib/actions/transactions'
import { calcMonthlyTotals, calcDashboardStats, fmt, fmtDate } from '@/lib/ledger'
import TransactionForm from '@/components/transaction-form'
import EmptyState from '@/components/empty-state'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, BookOpen,
  ArrowDownLeft, MoreVertical, Trash2, Loader2, ReceiptText,
  CalendarDays, ChevronDown, ChevronRight, LayoutDashboard,
} from 'lucide-react'
import type { Database } from '@/lib/database.types'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
type Customer    = Database['public']['Tables']['customers']['Row']

interface Props {
  entries:    JournalEntry[]
  customers:  Customer[]
  userId:     string
}

export default function LedgerClient({ entries: initial, customers, userId }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set([
    initial.length > 0
      ? `${new Date(initial[0].transaction_date).getFullYear()}-${String(new Date(initial[0].transaction_date).getMonth() + 1).padStart(2, '0')}`
      : ''
  ]))

  useEffect(() => { setMounted(true) }, [])

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers])
  const stats       = useMemo(() => calcDashboardStats(entries), [entries])
  const monthly     = useMemo(() => calcMonthlyTotals(entries), [entries])

  const grouped = useMemo(() => {
    const map = new Map<string, JournalEntry[]>()
    for (const tx of entries) {
      const d = new Date(tx.transaction_date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    }
    return map
  }, [entries])

  function toggleMonth(key: string) {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  async function handleDelete(id: string, customerId: string | null) {
    setDeletingId(id)
    // Note: We'll modify deleteTransaction to delete from journal_entries
    const res = await deleteTransaction(id, customerId || '')
    if (res.error) { toast.error(res.error); setDeletingId(null); return }
    setEntries((prev) => prev.filter((t) => t.id !== id))
    toast.success('Journal entry deleted')
    setDeletingId(null)
    router.refresh()
  }

  const STATS = [
    {
      label: 'Total Sales',
      urdu: 'کل فروخت',
      icon: TrendingUp,
      value: fmt(stats.totalSales),
      valueClass: 'text-emerald-600',
      iconClass: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      label: 'Total Expenses',
      urdu: 'کل اخراجات',
      icon: TrendingDown,
      value: fmt(stats.totalExpenses),
      valueClass: 'text-red-600',
      iconClass: 'text-red-600',
      iconBg: 'bg-red-50',
    },
    {
      label: 'Net Profit',
      urdu: 'خالص منافع',
      icon: Wallet,
      value: fmt(stats.totalSales - stats.totalExpenses),
      valueClass: (stats.totalSales - stats.totalExpenses) >= 0 ? 'text-emerald-600' : 'text-red-600',
      iconClass: 'text-primary',
      iconBg: 'bg-primary/10',
      wide: true,
      sub: `This month: ${fmt(stats.thisMonthSales)} sales · ${fmt(stats.thisMonthExpenses)} expenses`,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 pb-12">

      {/* ── HEADER ── */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo + Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm glow-emerald">
                <BookOpen className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </Link>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span className="text-border">/</span>
              <span className="text-primary font-bold">Ledger</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            Transaction Ledger / <span className="urdu-inline">روزنامچہ</span>
          </h1>
          <p className="text-muted-foreground text-xs font-semibold mt-1">
            {entries.length} total entr{entries.length === 1 ? 'y' : 'ies'} registered
          </p>
        </div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ label, urdu, icon: Icon, value, valueClass, iconBg, iconClass, wide, sub }) => (
            <Card
              key={label}
              className={`rounded-2xl shadow-sm ${wide ? 'col-span-2 border-primary/20 bg-primary/[0.03]' : 'border-border bg-card'}`}
            >
              <CardHeader className="pb-1 pt-5 px-5">
                <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${iconClass}`} />
                  </div>
                  {label} · <span className="urdu-inline normal-case font-normal">{urdu}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className={`text-2xl font-black tracking-tight amount ${valueClass}`}>{value}</p>
                {sub && <p className="text-[11px] text-muted-foreground mt-1 font-medium">{sub}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── MONTHLY SUMMARIES ── */}
        {monthly.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 text-primary" /> Monthly Summaries / ماہانہ خلاصہ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {monthly.slice(0, 6).map((m) => (
                <div
                  key={m.month}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div>
                    <p className="text-sm font-bold text-foreground">{m.month}</p>
                    <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                      <span className="text-emerald-600">Sales {fmt(m.sales)}</span>
                      {' · '}
                      <span className="text-red-600">Exp {fmt(m.expenses)}</span>
                    </p>
                  </div>
                  <span className={`text-sm font-extrabold amount ${m.net > 0 ? 'text-emerald-600' : m.net < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                    {m.net > 0 ? '+' : ''}{fmt(m.net)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TRANSACTION LOG ── */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <ReceiptText className="w-3.5 h-3.5 text-primary" /> Detailed Ledger / تمام اندراجات
          </h2>

          {entries.length === 0 ? (
            <EmptyState variant="transactions" onAction={() => {}} />
          ) : (
            <div className="space-y-3">
              {monthly.map((m) => {
                const key = `${m.year}-${String(m.monthIndex + 1).padStart(2, '0')}`
                const txs = grouped.get(key) ?? []
                const isOpen = expandedMonths.has(key)

                return (
                  <Card key={key} className="overflow-hidden border-border bg-card shadow-sm rounded-2xl">
                    {/* Month accordion header */}
                    <button
                      onClick={() => toggleMonth(key)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-muted/40 hover:bg-muted/70 transition-colors border-b border-border/50"
                    >
                      <div className="flex items-center gap-2.5">
                        {isOpen
                          ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        }
                        <span className="text-sm font-bold text-foreground">{m.month}</span>
                        <Badge variant="secondary" className="text-[10px] font-semibold px-2 py-0">
                          {txs.length}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-bold">
                        <span className="text-emerald-600">Sales {fmt(m.sales)}</span>
                        <span className="text-red-600">Exp {fmt(m.expenses)}</span>
                      </div>
                    </button>

                    {/* Transaction rows */}
                    {isOpen && (
                      <div className="divide-y divide-border/40">
                        {txs.map((tx) => {
                          const customer = tx.customer_id ? customerMap.get(tx.customer_id) : null
                          const isDebitCash = tx.debit_account === 'Cash' || tx.debit_account === 'Bank'
                          const isCreditCash = tx.credit_account === 'Cash' || tx.credit_account === 'Bank'
                          const colorClass = isDebitCash ? 'text-emerald-600' : isCreditCash ? 'text-red-600' : 'text-blue-600'
                          const bgClass = isDebitCash ? 'bg-emerald-50 text-emerald-600' : isCreditCash ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          
                          return (
                            <div
                              key={tx.id}
                              className={`flex items-center justify-between px-5 py-3.5 group hover:bg-muted/30 transition-colors border-l-2 ${isDebitCash ? 'border-emerald-600' : isCreditCash ? 'border-red-600' : 'border-blue-600'}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}>
                                  {isDebitCash
                                    ? <ArrowDownLeft className="w-4 h-4" />
                                    : <ArrowUpRight className="w-4 h-4" />
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-foreground truncate">
                                    {tx.transaction_type}
                                    {customer && <span className="text-muted-foreground font-normal ml-1.5 text-xs">· {customer.name}</span>}
                                    {tx.description && <span className="text-muted-foreground font-normal ml-1.5 text-xs">· {tx.description}</span>}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-medium">
                                    {fmtDate(tx.transaction_date)} · Dr: {tx.debit_account} | Cr: {tx.credit_account}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="text-right">
                                  <p className={`text-sm font-extrabold amount ${colorClass}`}>
                                    {fmt(Number(tx.amount))}
                                  </p>
                                  <span className={`text-[10px] font-bold uppercase tracking-wider ${colorClass}`}>
                                    {tx.payment_method}
                                  </span>
                                </div>

                                <DropdownMenu>
                                  <DropdownMenuTrigger className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted outline-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all">
                                    <MoreVertical className="w-4 h-4" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-36 rounded-xl shadow-lg p-1">
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(tx.id, tx.customer_id)}
                                      disabled={deletingId === tx.id}
                                      className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2 py-2 rounded-lg text-sm font-semibold"
                                    >
                                      {deletingId === tx.id
                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
                                        : <><Trash2 className="w-3.5 h-3.5" /> Delete Entry</>
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
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
