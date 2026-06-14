'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteTransaction } from '@/lib/actions/transactions'
import { calcCustomerBalance, fmt, fmtDate } from '@/lib/ledger'
import TransactionForm from '@/components/transaction-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus, ArrowUpRight, ArrowDownLeft, MoreVertical, Trash2,
  Loader2, Phone, Mail, TrendingUp, TrendingDown, Wallet,
} from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

interface Props {
  customer: Customer
  transactions: Transaction[]
  userId: string
}

export default function CustomerLedgerClient({ customer, transactions: initial, userId }: Props) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [defaultType, setDefaultType] = useState<'udhaar' | 'payment'>('udhaar')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { totalUdhaar, totalPayment, balance, runningLedger } = calcCustomerBalance(transactions)
  const sortedLedger = [...runningLedger].reverse() // newest first for display

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await deleteTransaction(id, customer.id)
    if (res.error) { toast.error(res.error); setDeletingId(null); return }
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    toast.success('Transaction deleted')
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard/ledger')} className="text-slate-400 hover:text-white transition-colors text-sm">
              ← Ledger
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold truncate max-w-[140px] sm:max-w-xs">{customer.name}</span>
          </div>
          <Button
            onClick={() => { setDefaultType('udhaar'); setShowForm(true) }}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white gap-2 h-9 font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Customer card */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {customer.name[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-white">{customer.name}</h1>
              <div className="flex flex-wrap gap-3 mt-1">
                {customer.phone && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Phone className="w-3 h-3" /> {customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Mail className="w-3 h-3" /> {customer.email}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-red-400" /> Gave (دیا)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-base sm:text-lg font-bold text-red-400">{fmt(totalUdhaar)}</p>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/5">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-400" /> Got (لیا)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className="text-base sm:text-lg font-bold text-green-400">{fmt(totalPayment)}</p>
            </CardContent>
          </Card>

          <Card className={`border ${balance > 0 ? 'border-orange-500/20 bg-orange-500/5' : balance < 0 ? 'border-green-500/20 bg-green-500/5' : 'border-white/10 bg-white/5'}`}>
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-xs text-slate-400 flex items-center gap-1">
                <Wallet className="w-3 h-3 text-purple-400" /> Balance (بقیہ)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <p className={`text-base sm:text-lg font-bold ${balance > 0 ? 'text-orange-300' : balance < 0 ? 'text-green-300' : 'text-slate-300'}`}>
                {fmt(Math.abs(balance))}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {balance > 0 ? 'owes you (ان کے ذمہ)' : balance < 0 ? 'you owe (آپ کے ذمہ)' : 'settled (صاف)'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        {transactions.length > 0 && (
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => { setDefaultType('udhaar'); setShowForm(true) }}
              className="flex-1 border-red-500/20 bg-red-500/5 text-red-300 hover:bg-red-500/10 hover:border-red-500/30 gap-2"
            >
              <ArrowUpRight className="w-4 h-4" /> Add Udhaar (ادھار دیں)
            </Button>
            <Button
              variant="outline"
              onClick={() => { setDefaultType('payment'); setShowForm(true) }}
              className="flex-1 border-green-500/20 bg-green-500/5 text-green-300 hover:bg-green-500/10 hover:border-green-500/30 gap-2"
            >
              <ArrowDownLeft className="w-4 h-4" /> Record Payment (وصولی)
            </Button>
          </div>
        )}

        {/* Transaction ledger table */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Transaction History (ہسٹری)</h2>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center py-16 space-y-3">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
                <Wallet className="w-7 h-7 text-slate-500" />
              </div>
              <p className="text-slate-300 font-medium">No transactions yet</p>
              <p className="text-slate-500 text-sm">Start by adding udhaar or a payment</p>
              <Button onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white gap-2">
                <Plus className="w-4 h-4" /> Add Transaction (اندراج کریں)
              </Button>
            </div>
          ) : (
            <Card className="border border-white/10 bg-white/5">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-white/5">
                <span>Date / Note</span>
                <span className="text-right">Udhaar (ادھار)</span>
                <span className="text-right">Payment (وصولی)</span>
                <span className="text-right">Balance (بقیہ)</span>
                <span />
              </div>

              <div className="divide-y divide-white/5">
                {sortedLedger.map((tx) => (
                  <div key={tx.id} className="grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_auto_auto_auto_auto] gap-3 sm:gap-4 px-4 py-3 group hover:bg-white/5 transition-colors items-center">
                    {/* Date + note */}
                    <div>
                      <p className="text-xs text-slate-500">{fmtDate(tx.transaction_date)}</p>
                      {tx.note && <p className="text-sm text-slate-300 mt-0.5">{tx.note}</p>}
                      <Badge variant="outline" className={`mt-1 text-xs border-0 sm:hidden ${tx.type === 'udhaar' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {tx.type}
                      </Badge>
                    </div>

                    {/* Udhaar */}
                    <span className="hidden sm:block text-right text-sm text-red-400 font-medium">
                      {tx.type === 'udhaar' ? fmt(Number(tx.amount)) : '—'}
                    </span>

                    {/* Payment */}
                    <span className="hidden sm:block text-right text-sm text-green-400 font-medium">
                      {tx.type === 'payment' ? fmt(Number(tx.amount)) : '—'}
                    </span>

                    {/* Running Balance (desktop) */}
                    <span className="hidden sm:block text-right text-sm font-bold text-white">
                      {fmt(tx.runningBalance)}
                    </span>

                    {/* Mobile: amount */}
                    <span className={`sm:hidden text-sm font-bold ${tx.type === 'udhaar' ? 'text-red-400' : 'text-green-400'}`}>
                      {tx.type === 'udhaar' ? '-' : '+'}{fmt(Number(tx.amount))}
                    </span>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 outline-none opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300 w-32">
                        <DropdownMenuItem
                          onClick={() => handleDelete(tx.id)}
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
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      {showForm && (
        <TransactionForm
          customers={[customer]}
          defaultCustomerId={customer.id}
          defaultType={defaultType}
          onClose={() => setShowForm(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
