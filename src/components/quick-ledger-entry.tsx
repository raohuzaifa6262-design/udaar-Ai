'use client'

import { useState } from 'react'
import { parseTransaction, ParseResult } from '@/lib/parser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { fmt } from '@/lib/ledger'
import { 
  Sparkles, 
  CornerDownLeft, 
  Save, 
  X, 
  AlertCircle, 
  Check, 
  ArrowRight, 
  ArrowDownLeft, 
  ArrowUpRight,
  HelpCircle
} from 'lucide-react'

interface QuickLedgerEntryProps {
  onSave: (data: {
    customerName: string;
    amount: number;
    transactionType: 'udhaar' | 'payment';
  }) => Promise<void> | void;
  className?: string;
}

export function QuickLedgerEntry({ onSave, className = '' }: QuickLedgerEntryProps) {
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleParse = () => {
    if (!inputValue.trim()) {
      toast.error('Please type a transaction first!')
      return
    }
    const parseResult = parseTransaction(inputValue)
    setResult(parseResult)
    if (!parseResult.success) {
      toast.error(parseResult.error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleParse()
    }
  }

  const handleSave = async () => {
    if (!result || !result.success) return
    setIsSaving(true)
    try {
      await onSave({
        customerName: result.customerName,
        amount: result.amount,
        transactionType: result.transactionType
      })
      setInputValue('')
      setResult(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save transaction')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setResult(null)
  }

  const applyExample = (example: string) => {
    setInputValue(example)
    setResult(null)
  }

  const examples = [
    { text: 'Ali ko 2500 udhaar diya', label: 'Udhaar / دیئے' },
    { text: 'Ahmed ne 1000 wapas diye', label: 'Wapas / لیے' },
    { text: 'Rashid se 3000 mile', label: 'Mile / لیے' },
    { text: 'Bilal ko 500 baki', label: 'Baki / باقی' },
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900/60 backdrop-blur-md overflow-hidden relative">
        {/* Glow accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
        
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              Quick AI Parser / آسان اندراج
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400">
              Type transaction in Roman Urdu & press Enter.
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type here... (e.g. Ali ko 2500 diya)"
                disabled={isSaving || (result !== null && result.success)}
                className="pr-10 h-12 text-base border-slate-200 dark:border-slate-800 focus-visible:ring-emerald-500 dark:bg-slate-950"
              />
              {inputValue && !(result !== null && result.success) && (
                <button
                  type="button"
                  onClick={() => setInputValue('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <Button
              onClick={handleParse}
              disabled={isSaving || !inputValue.trim() || (result !== null && result.success)}
              className="h-12 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium gap-1.5 shadow-sm rounded-lg"
            >
              Parse
              <CornerDownLeft className="w-4 h-4 opacity-70" />
            </Button>
          </div>

          {/* Quick Examples */}
          {(!result || !result.success) && (
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Tap to try / مثال منتخب کریں:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyExample(ex.text)}
                    className="text-xs px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50 dark:bg-slate-900 text-slate-650 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-450 transition-all font-medium flex items-center gap-1"
                  >
                    <span>{ex.text}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">({ex.label})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation & Preview Card (WhatsApp style) */}
      {result && result.success && (
        <Card className="border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.02] shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200">
          <CardContent className="p-4 sm:p-5 space-y-4">
            
            {/* Parser understood badge */}
            <div className="flex justify-between items-center pb-3 border-b border-emerald-500/10">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 flex items-center gap-1 uppercase tracking-wider">
                <Check className="w-4 h-4" /> Parsed Entry / سمجھ آگیا
              </span>
              <span className="text-[11px] text-slate-450 dark:text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                Rule: {result.matchedPattern}
              </span>
            </div>

            {/* Visual breakdown (WhatsApp-like layout) */}
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
              {/* Initials Avatar */}
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-sm shadow-inner shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                {getInitials(result.customerName)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {result.customerName}
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Customer / گاہک
                </p>
              </div>

              {/* Amount Display */}
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-slate-950 dark:text-whiteamount amount">
                  {fmt(result.amount)}
                </div>
                <div className="flex justify-end mt-0.5">
                  {result.transactionType === 'udhaar' ? (
                    <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-500/20 border-0 pointer-events-none text-[10px] font-semibold gap-0.5">
                      <ArrowDownLeft className="w-3 h-3" />
                      Gave / ادھار دیا
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20 border-0 pointer-events-none text-[10px] font-semibold gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      Got / واپس ملا
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={isSaving}
                className="w-full sm:w-auto h-11 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 gap-1.5"
              >
                <X className="w-4 h-4" />
                Change / تبدیل کریں
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 shadow-md shadow-emerald-600/10"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Entry / محفوظ کریں'}
              </Button>
            </div>
            
          </CardContent>
        </Card>
      )}

      {/* Error Help Box */}
      {result && !result.success && (
        <Card className="border-amber-500/30 dark:border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.02] shadow-sm animate-in fade-in slide-in-from-top-3 duration-200">
          <CardContent className="p-4 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-450 uppercase tracking-wider">
                Parsing Error / سمجھ نہیں آیا
              </div>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                {result.error}
              </p>
              <div className="text-[11px] text-slate-450 dark:text-slate-550 space-y-1">
                <span className="font-semibold block">Try writing like this:</span>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>{"[Name] ko [Amount] udhaar diya"}</li>
                  <li>{"[Name] ne [Amount] wapas diye"}</li>
                  <li>{"[Name] se [Amount] mile"}</li>
                  <li>{"[Name] ko [Amount] baki"}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
