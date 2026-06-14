'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { addTransaction } from '@/lib/actions/transactions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, X, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Customer = Database['public']['Tables']['customers']['Row']

interface Props {
  customers: Customer[]
  defaultCustomerId?: string
  defaultType?: 'udhaar' | 'payment'
  onSuccess?: () => void
  onClose: () => void
}

export default function TransactionForm({ customers, defaultCustomerId, defaultType = 'udhaar', onSuccess, onClose }: Props) {
  const [type, setType] = useState<'udhaar' | 'payment'>(defaultType)
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!customerId) { toast.error('Please select a customer'); return }
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }

    setLoading(true)
    const res = await addTransaction({
      customer_id: customerId,
      type,
      amount: amt,
      note: note.trim() || undefined,
      transaction_date: date,
    })

    if (res.error) {
      toast.error(res.error)
      setLoading(false)
      return
    }

    toast.success(type === 'udhaar' ? '💸 Udhaar added!' : '✅ Payment recorded!')
    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Add New Entry / نیا اندراج
          </h2>
          <button onClick={onClose} className="text-slate-450 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl">
          {(['udhaar', 'payment'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-extrabold transition-all duration-200 ${
                type === t
                  ? t === 'udhaar'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t === 'udhaar' ? (
                <><ArrowUpRight className="w-4 h-4" /> Gave (Udhaar)</>
              ) : (
                <><ArrowDownLeft className="w-4 h-4" /> Got (Payment)</>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer selection (hidden if default passed) */}
          {!defaultCustomerId && (
            <div className="space-y-1.5">
              <Label className="text-slate-705 dark:text-slate-350 text-xs font-semibold uppercase tracking-wider">Customer / گاہک <span className="text-red-500">*</span></Label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                disabled={loading}
                className="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all disabled:opacity-50 [&>option]:bg-white dark:[&>option]:bg-slate-900"
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amount input */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-slate-705 dark:text-slate-350 text-xs font-semibold uppercase tracking-wider">Amount / رقم (PKR) <span className="text-red-500">*</span></Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
              className="h-12 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-xl font-extrabold"
            />
          </div>

          {/* Date input */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-date" className="text-slate-705 dark:text-slate-350 text-xs font-semibold uppercase tracking-wider">Date / تاریخ</Label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              style={{ colorScheme: isDark ? 'dark' : 'light' }}
              className="w-full h-11 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-sm px-3 py-2 outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Note input */}
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-slate-705 dark:text-slate-350 text-xs font-semibold uppercase tracking-wider">Note / تفصیل (optional)</Label>
            <Input
              id="note"
              placeholder="e.g. Rice purchase, cash payment..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              className="h-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className={`flex-1 h-11 font-bold text-white shadow-md ${
                type === 'udhaar'
                  ? 'bg-red-650 hover:bg-red-500 shadow-red-600/10'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
              ) : type === 'udhaar' ? (
                'Gave / دیئے'
              ) : (
                'Got / لیے'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
