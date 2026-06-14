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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-slate-900 border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">New Transaction</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-xl">
          {(['udhaar', 'payment'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                type === t
                  ? t === 'udhaar'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {t === 'udhaar'
                ? <><ArrowUpRight className="w-4 h-4" /> Udhaar (Lent)</>
                : <><ArrowDownLeft className="w-4 h-4" /> Payment (Got back)</>
              }
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer */}
          {!defaultCustomerId && (
            <div className="space-y-1.5">
              <Label className="text-slate-300 text-sm">Customer <span className="text-red-400">*</span></Label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-md bg-white/5 border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition-all disabled:opacity-50 [&>option]:bg-slate-900"
              >
                <option value="">Select customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-slate-300 text-sm">Amount (Rs.) <span className="text-red-400">*</span></Label>
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
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 text-lg font-semibold"
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="tx-date" className="text-slate-300 text-sm">Date</Label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
              style={{ colorScheme: 'dark' }}
              className="w-full rounded-md bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-sm px-3 py-2 outline-none transition-all disabled:opacity-50"
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="note" className="text-slate-300 text-sm">Note (optional)</Label>
            <Input
              id="note"
              placeholder="e.g. Grocery money, rent…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}
              className="flex-1 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}
              className={`flex-1 font-semibold text-white shadow-lg ${
                type === 'udhaar'
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/20'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/20'
              }`}>
              {loading
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                : type === 'udhaar' ? '💸 Add Udhaar' : '✅ Record Payment'
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
