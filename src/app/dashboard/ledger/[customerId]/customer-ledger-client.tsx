'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteTransaction } from '@/lib/actions/transactions'
import { calcCustomerBalance, fmt, fmtDate } from '@/lib/ledger'
import TransactionForm from '@/components/transaction-form'
import EmptyState from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus, ArrowUpRight, ArrowDownLeft, MoreVertical, Trash2,
  Loader2, Phone, Mail, TrendingUp, TrendingDown, Wallet,
  MessageCircle, ChevronLeft
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import type { Database } from '@/lib/database.types'

type JournalEntry = Database['public']['Tables']['journal_entries']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

interface Props {
  customer: Customer
  entries: JournalEntry[]
  userId: string
}

export default function CustomerLedgerClient({ customer, entries: initial, userId }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState<JournalEntry[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [defaultType, setDefaultType] = useState<'udhaar' | 'payment'>('udhaar')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { totalUdhaar, totalPayment, balance, runningLedger } = calcCustomerBalance(entries, customer.id)
  const sortedLedger = [...runningLedger].reverse() // newest first for display

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await deleteTransaction(id, customer.id)
    if (res.error) { toast.error(res.error); setDeletingId(null); return }
    setEntries((prev) => prev.filter((t) => t.id !== id))
    toast.success('Journal entry deleted')
    setDeletingId(null)
    router.refresh()
  }

  // Clean phone number for WhatsApp Link
  const waPhone = customer.phone ? customer.phone.replace(/[^0-9]/g, '') : ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-28 sm:pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold min-w-0">
            <button
              onClick={() => router.push('/dashboard/customers')}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-0.5"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-emerald-600 dark:text-emerald-500 truncate max-w-[120px] sm:max-w-xs">{customer.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Customer details card with quick shortcuts */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Initials avatar */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-extrabold text-2xl flex-shrink-0 shadow-sm">
                {customer.name[0].toUpperCase()}
              </div>
              <div className="min-w-0 space-y-1">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{customer.name}</h1>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {customer.phone}
                    </span>
                  )}
                  {customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick communication shortcuts */}
            <div className="flex items-center gap-2">
              {customer.phone && (
                <>
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex-1 sm:flex-none h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-350 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-500" /> Call
                  </a>
                  <a
                    href={`https://wa.me/${waPhone || '92'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none h-11 px-4 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center justify-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-red-500" /> You Gave / دیا
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-lg sm:text-2xl font-extrabold text-red-550 dark:text-red-400 tracking-tight">{fmt(totalUdhaar)}</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-[10px] font-bold text-slate-550 dark:text-slate-450 uppercase tracking-wider flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" /> You Got / لیا
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-lg sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">{fmt(totalPayment)}</p>
            </CardContent>
          </Card>

          {/* Running Net Balance */}
          <Card className={`border rounded-2xl shadow-sm ${
            balance > 0
              ? 'border-red-500/20 bg-red-50/40 dark:bg-red-950/10'
              : balance < 0
                ? 'border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/10'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-[10px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> Net Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className={`text-lg sm:text-2xl font-extrabold tracking-tight ${
                balance > 0
                  ? 'text-red-650 dark:text-red-450'
                  : balance < 0
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500'
              }`}>
                {fmt(Math.abs(balance))}
              </p>
              <p className="text-[10px] font-semibold text-slate-550 dark:text-slate-450 mt-0.5">
                {balance > 0 ? 'Lene hain (Owes you)' : balance < 0 ? 'Dene hain (You owe)' : 'Settle ho gaya'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History Section */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Transaction Ledger Book / کھاتہ تفصیل</h2>

          {entries.length === 0 ? (
            <EmptyState variant="transactions" onAction={() => setShowForm(true)} />
          ) : (
            <Card className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
              {/* Header table (Desktop only) */}
              <div className="hidden sm:grid grid-cols-[1fr_120px_120px_130px_50px] gap-4 px-5 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-150 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-850/50">
                <span>Date / Note</span>
                <span className="text-right">Gave (Diya)</span>
                <span className="text-right">Got (Liya)</span>
                <span className="text-right">Book Balance</span>
                <span />
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {sortedLedger.map((tx) => {
                  const isUdhaar = tx.debit_account === 'Accounts Receivable'
                  const isPayment = tx.credit_account === 'Accounts Receivable'
                  
                  // Ignore non-AR rows in Customer Ledger to avoid confusion? 
                  // No, we show all linked entries. But Udhaar means Accounts Receivable.
                  // For display purposes, we classify by Debit/Credit AR.
                  
                  return (
                  <div key={tx.id} className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_120px_120px_130px_50px] gap-3 sm:gap-4 px-5 py-4 group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors items-center">
                    {/* Date / Note */}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-550 dark:text-slate-400">{fmtDate(tx.transaction_date)}</p>
                      {tx.description ? (
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 truncate">{tx.description}</p>
                      ) : (
                        <p className="text-sm italic font-medium text-slate-400 dark:text-slate-500 mt-1">No note saved</p>
                      )}
                      <Badge variant="outline" className={`mt-1.5 text-[9px] font-bold uppercase tracking-wider sm:hidden border-none px-2 py-0.5 ${isUdhaar ? 'bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-450' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450'}`}>
                        {isUdhaar ? 'gave' : 'got'}
                      </Badge>
                    </div>

                    {/* Udhaar Given (Desktop) */}
                    <span className="hidden sm:block text-right text-sm text-red-500 dark:text-red-400 font-extrabold">
                      {isUdhaar ? fmt(Number(tx.amount)) : '—'}
                    </span>

                    {/* Payment Got (Desktop) */}
                    <span className="hidden sm:block text-right text-sm text-emerald-650 dark:text-emerald-500 font-extrabold">
                      {isPayment ? fmt(Number(tx.amount)) : '—'}
                    </span>

                    {/* Book Balance (Desktop) */}
                    <span className={`hidden sm:block text-right text-sm font-black ${
                      tx.runningBalance > 0
                        ? 'text-red-500/80 dark:text-red-400/80'
                        : tx.runningBalance < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500'
                    }`}>
                      {fmt(Math.abs(tx.runningBalance))}
                    </span>

                    {/* Mobile Only: Amount */}
                    <span className={`sm:hidden text-base font-extrabold ${isUdhaar ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-500'}`}>
                      {isUdhaar ? '-' : '+'}{fmt(Number(tx.amount))}
                    </span>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-slate-400 hover:text-slate-650 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 outline-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-250 w-32 rounded-xl shadow-lg p-1">
                        <DropdownMenuItem
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          className="hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 dark:text-red-450 cursor-pointer gap-2 py-2 rounded-lg text-sm font-semibold"
                        >
                          {deletingId === tx.id
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
                            : <><Trash2 className="w-3.5 h-3.5" /> Delete Entry</>
                          }
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )})}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
