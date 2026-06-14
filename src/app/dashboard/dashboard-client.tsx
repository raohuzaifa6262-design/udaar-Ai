'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import TransactionForm from '@/components/transaction-form'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { fmt, fmtDate } from '@/lib/ledger'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuRadioGroup, DropdownMenuRadioItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  BookOpen, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  LogOut, User, Plus, ChevronDown, Users, ArrowRight, Filter,
  LayoutDashboard, Calendar, Sparkles, ArrowRightLeft, Wallet, Check
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type Profile  = Database['public']['Tables']['profiles']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

interface DashboardClientProps {
  user:               SupabaseUser
  profile:            Profile | null
  customers:          Customer[]
  recentTransactions: any[]
  totalSales:         number
  totalExpenses:      number
  cashBalance:        number
  outstandingUdhaar:  number
  currentRange:       string
}

export default function DashboardClient({
  user, profile, customers, recentTransactions, totalSales, totalExpenses, cashBalance, outstandingUdhaar, currentRange
}: DashboardClientProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut]           = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [mounted, setMounted]                 = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'
  
  async function handleLogout() {
    setLoggingOut(true)
    const { error } = await supabase.auth.signOut()
    if (error) { toast.error('Failed to sign out'); setLoggingOut(false); return }
    toast.success('Khuda Hafiz! Dobara tashreef lana. 👋')
    router.push('/login')
    router.refresh()
  }

  const handleRangeChange = (val: string) => {
    router.push(`?range=${val}`)
  }

  const getRangeLabel = (range: string) => {
    if (range === '7') return 'Last 7 Days'
    if (range === '30') return 'Last 30 Days'
    return 'All Time'
  }

  const STATS = [
    {
      label: 'Total Sales',
      urdu: 'کل فروخت',
      value: fmt(totalSales),
      desc: 'Revenue recorded',
      icon: TrendingUp,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Total Expenses',
      urdu: 'کل اخراجات',
      value: fmt(totalExpenses),
      desc: 'Money spent',
      icon: TrendingDown,
      iconBg: 'bg-red-50 dark:bg-red-950/30',
      iconColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Cash Balance',
      urdu: 'نقدی',
      value: fmt(cashBalance),
      desc: 'Available cash on hand',
      icon: Wallet,
      iconBg: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Outstanding Udhaar',
      urdu: 'بقایا ادھار',
      value: fmt(outstandingUdhaar),
      desc: 'To receive from customers',
      icon: BookOpen,
      iconBg: 'bg-orange-50 dark:bg-orange-950/20',
      iconColor: 'text-orange-500',
      valueColor: 'text-orange-500',
      highlight: true,
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">

      {/* ── HEADER ── */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md glow-emerald">
              <BookOpen className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-foreground">
              Udhaar<span className="text-primary">AI</span>
            </span>
          </Link>

          {/* Nav — desktop */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {[
              { href: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard', active: true },
              { href: '/dashboard/customers', icon: Users,           label: 'Customers',  active: false },
              { href: '/dashboard/ledger',    icon: BookOpen,        label: 'Ledger',     active: false },
            ].map(({ href, icon: Icon, label, active }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors outline-none border border-transparent hover:border-border">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-black shadow-md">
                  {displayName[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm text-foreground font-bold max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-xl">
                <div className="px-3 py-2 text-xs font-semibold text-muted-foreground truncate">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg py-2">
                  <User className="w-4 h-4" /> My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2 rounded-lg py-2"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">

        {/* Greeting Card & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Assalam-o-Alaikum, {displayName.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-muted-foreground max-w-md mt-1">
              Here is your Double-Entry Accounting summary.
            </p>
          </div>
          
          {/* Date Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center font-bold rounded-xl gap-2 border border-border shadow-sm px-4 py-2 bg-background hover:bg-muted text-sm transition-colors">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {getRangeLabel(currentRange)}
              <ChevronDown className="w-4 h-4 opacity-50" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl">
              <DropdownMenuRadioGroup value={currentRange} onValueChange={handleRangeChange}>
                <DropdownMenuRadioItem value="7" className="rounded-lg cursor-pointer">Last 7 Days</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="30" className="rounded-lg cursor-pointer">Last 30 Days</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="all" className="rounded-lg cursor-pointer">All Time</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(({ label, urdu, value, desc, icon: Icon, iconBg, iconColor, valueColor, highlight }) => (
            <Card
              key={label}
              className={`rounded-2xl shadow-sm hover:shadow-md transition-all ${
                highlight
                  ? 'border border-primary/20 bg-primary/5'
                  : 'border border-border bg-card'
              }`}
            >
              <CardHeader className="pb-2 pt-5 px-5">
                <CardTitle className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <p className={`text-2xl font-black tracking-tight amount ${valueColor}`}>{value}</p>
                <p className="text-[11px] font-semibold text-muted-foreground mt-1">{desc}</p>
                <p className="urdu-inline text-muted-foreground mt-0.5">{urdu}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Transactions */}
        <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4 pt-5 px-6 border-b border-border/50">
            <div className="space-y-1">
              <CardTitle className="text-foreground text-lg font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                Recent Journal Entries / حالیہ سرگرمیاں
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Last 5 double-entry records</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 px-6 space-y-4">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground font-bold text-base">Koi entry nahi mili</p>
                  <p className="text-muted-foreground text-sm">Pehla journal entry record karein via Voice</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {recentTransactions.map((tx) => {
                  const isDebitCash = tx.debit_account === 'Cash' || tx.debit_account === 'Bank'
                  const isCreditCash = tx.credit_account === 'Cash' || tx.credit_account === 'Bank'
                  const colorClass = isDebitCash ? 'text-emerald-600' : isCreditCash ? 'text-red-600' : 'text-blue-600'
                  const bgClass = isDebitCash ? 'bg-emerald-50' : isCreditCash ? 'bg-red-50' : 'bg-blue-50'
                  
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-4 px-6 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass} ${colorClass}`}>
                          {isDebitCash ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {tx.transaction_type}
                            {tx.description && <span className="text-muted-foreground font-normal ml-1">· {tx.description}</span>}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground flex gap-2">
                            <span>Dr: {tx.debit_account}</span>
                            <span>Cr: {tx.credit_account}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p className={`text-base font-extrabold amount ${colorClass}`}>
                          {fmt(Number(tx.amount))}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {fmtDate(tx.transaction_date)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
