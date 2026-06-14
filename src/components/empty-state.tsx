'use client'

import { Button } from '@/components/ui/button'
import {
  Users,
  Search,
  ReceiptText,
  UserPlus,
  PlusCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  PhoneCall
} from 'lucide-react'

interface EmptyStateProps {
  variant: 'customers' | 'transactions' | 'search'
  searchQuery?: string
  onAction?: () => void
  actionLabel?: string
}

export default function EmptyState({ variant, searchQuery, onAction, actionLabel }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-sm max-w-xl mx-auto space-y-6 sm:space-y-8 transition-all">
      
      {/* 1. Illustration Area */}
      <div className="relative w-full max-w-[240px] h-32 flex items-center justify-center mx-auto select-none">
        
        {/* Soft Ambient Background Glow */}
        <div className={`absolute w-32 h-32 rounded-full blur-2xl opacity-15 dark:opacity-20 animate-pulse ${
          variant === 'customers' ? 'bg-emerald-500' : variant === 'transactions' ? 'bg-emerald-500' : 'bg-amber-500'
        }`} />

        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 dark:opacity-10" />

        {/* --- CUSTOMERS ILLUSTRATION --- */}
        {variant === 'customers' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Background dashed outline card */}
            <div className="absolute w-36 h-20 bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl -rotate-6 transform -translate-x-3 -translate-y-1" />
            
            {/* Main ledger list skeleton card */}
            <div className="absolute w-36 h-20 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm rotate-3 transform translate-x-2 flex flex-col justify-center p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-105 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">A</div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-16" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-slate-105 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">B</div>
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-10" />
              </div>
            </div>

            {/* Glowing Focal Action Button Overlay */}
            <div className="absolute w-14 h-14 bg-emerald-500 dark:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white z-10 bottom-2 right-4 transform translate-y-1 hover:scale-105 transition-transform duration-250 border border-emerald-400/20">
              <UserPlus className="w-7 h-7" />
            </div>

            {/* Decorative Sparkles */}
            <div className="absolute top-1 right-2 bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-100/50 dark:border-emerald-900/35 text-emerald-600 dark:text-emerald-400 rotate-12">
              <Sparkles className="w-4 h-4 animate-bounce" />
            </div>
          </div>
        )}

        {/* --- TRANSACTIONS ILLUSTRATION --- */}
        {variant === 'transactions' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Dashed background page */}
            <div className="absolute w-36 h-20 bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl rotate-3 transform translate-x-2 -translate-y-1" />

            {/* Ledger entry card layout */}
            <div className="absolute w-36 h-20 bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm -rotate-3 transform -translate-x-2 flex flex-col justify-between p-3">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-1">
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-12" />
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-6" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-red-500 font-extrabold">
                <span>Gave (دیا)</span>
                <span>₹ ———</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-emerald-605 dark:text-emerald-400 font-extrabold">
                <span>Got (لیا)</span>
                <span>₹ ———</span>
              </div>
            </div>

            {/* Float Arrows Flow Badge */}
            <div className="absolute w-12 h-12 bg-emerald-500 dark:bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white z-10 -bottom-1 left-3 hover:scale-105 transition-transform border border-emerald-400/20">
              <ReceiptText className="w-6 h-6" />
            </div>

            {/* Floating Coins */}
            <div className="absolute -top-1 right-6 bg-yellow-50 dark:bg-yellow-950/30 p-1.5 rounded-full border border-yellow-150/40 dark:border-yellow-900/30 text-yellow-500 rotate-12 flex items-center justify-center">
              <Coins className="w-5 h-5 animate-bounce" />
            </div>
          </div>
        )}

        {/* --- SEARCH RESULTS ILLUSTRATION --- */}
        {variant === 'search' && (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Dashed contact card */}
            <div className="absolute w-36 h-20 bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl rotate-3" />

            {/* Glowing Search Ring */}
            <div className="absolute w-14 h-14 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-sm flex items-center justify-center text-slate-455 dark:text-slate-400 z-10 -bottom-1 right-4 transform translate-y-1">
              <Search className="w-7 h-7 animate-pulse text-amber-500 dark:text-amber-400" />
            </div>

            {/* Question Mark Alert Bubble */}
            <div className="absolute top-2 left-6 bg-amber-50 dark:bg-amber-950/45 text-amber-600 dark:text-amber-400 p-2 rounded-2xl border border-amber-100/50 dark:border-amber-900/40 shadow-sm flex items-center justify-center">
              <HelpCircle className="w-5 h-5 animate-bounce" />
            </div>
            
            {/* Red crossed indicator */}
            <div className="absolute bottom-6 left-1.5 bg-red-50 dark:bg-red-950/20 text-red-500 p-1.5 rounded-full border border-red-100/50 dark:border-red-900/30">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Primary Dual Language Copy */}
      <div className="space-y-3 max-w-md mx-auto">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex flex-col gap-1 items-center justify-center">
          {/* Urdu Subtitle Heading */}
          <span className="text-emerald-600 dark:text-emerald-500 text-lg sm:text-xl font-bold font-serif leading-none">
            {variant === 'customers' && 'کوئی گاہک محفوظ نہیں ہے'}
            {variant === 'transactions' && 'کھاتہ بالکل خالی ہے'}
            {variant === 'search' && 'کوئی گاہک نہیں ملا'}
          </span>
          {/* English Main Heading */}
          <span className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-200 mt-1">
            {variant === 'customers' && 'No Customers Saved Yet'}
            {variant === 'transactions' && 'No Ledger Entries Logged'}
            {variant === 'search' && 'No Search Results Match'}
          </span>
        </h3>
        
        {/* Descriptive Body */}
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
          {variant === 'customers' && 'Add your customer contacts to start tracking credits, payments, and automated balances.'}
          {variant === 'transactions' && 'Start recording credits (Gave) and payments (Got) to automate calculations instantly.'}
          {variant === 'search' && (
            <>
              We couldn't find any customers matching <span className="text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">"{searchQuery}"</span>.
            </>
          )}
        </p>
      </div>

      {/* 3. Shopkeeper-Focused Feature Guide/Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full border-t border-slate-100 dark:border-slate-850 pt-6">
        {variant === 'customers' && (
          <>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Register Khata</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">ڈیجیٹل کھاتہ کھولیں</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Automate Balances</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">حساب کتاب خودکار کریں</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Auto Reminders</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">واٹس ایپ ریمائنڈر</p>
              </div>
            </div>
          </>
        )}

        {variant === 'transactions' && (
          <>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <ArrowUpRight className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Gave / دیئے</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">ادھار کی رقم درج کریں</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Got / لیے</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">وصولی رقم درج کریں</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Safe Backup</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">کھاتہ ہمیشہ محفوظ</p>
              </div>
            </div>
          </>
        )}

        {variant === 'search' && (
          <>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Double Check</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">نام کے ہجے چیک کریں</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <PhoneCall className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Phone Number</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">نمبر سے سرچ کریں</p>
              </div>
            </div>
            <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-850/30 text-left sm:text-center border border-slate-100/50 dark:border-slate-850/20">
              <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-500 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">Add Instead</h4>
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5">نیا گاہک بنا لیں</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. Large Action Buttons */}
      {onAction && (
        <div className="w-full pt-2">
          <Button
            onClick={onAction}
            className="w-full sm:w-auto h-12 px-8 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-605 dark:hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            {variant === 'customers' && (
              <>
                <UserPlus className="w-5 h-5" />
                <span>{actionLabel || 'Add Customer / گاہک شامل کریں'}</span>
              </>
            )}
            {variant === 'transactions' && (
              <>
                <PlusCircle className="w-5 h-5" />
                <span>{actionLabel || 'Record Transaction / اندراج کریں'}</span>
              </>
            )}
            {variant === 'search' && (
              <>
                <XCircle className="w-5 h-5" />
                <span>{actionLabel || 'Clear Search / تلاش صاف کریں'}</span>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

