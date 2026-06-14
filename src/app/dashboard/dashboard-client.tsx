'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import TransactionForm from '@/components/transaction-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  LogOut,
  User,
  Plus,
  Bell,
  ChevronDown,
  Wallet,
  Users,
  BookOpen,
} from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

interface DashboardClientProps {
  user: SupabaseUser
  profile: Profile | null
  customers: Customer[]
  transactions: any[]
}

export default function DashboardClient({
  user, profile, customers, transactions,
}: DashboardClientProps) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days'>('all')

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User'

  const customerMap = new Map(customers.map((c) => [c.id, c]))

  const filteredTransactions = transactions.filter((t) => {
    if (dateFilter === 'all') return true
    const txDate = new Date(t.transaction_date)
    const cutoff = new Date()
    if (dateFilter === '7days') cutoff.setDate(cutoff.getDate() - 7)
    if (dateFilter === '30days') cutoff.setDate(cutoff.getDate() - 30)
    return txDate >= cutoff
  })

  const totalLent = filteredTransactions
    .filter((t) => t.type === 'udhaar')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalRecovered = filteredTransactions
    .filter((t) => t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const outstanding = totalLent - totalRecovered
  const recentTransactions = filteredTransactions.slice(0, 5)

  async function handleLogout() {
    setLoggingOut(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Failed to sign out')
      setLoggingOut(false)
      return
    }
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between relative">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">UdhaarAI</span>
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <Link href="/dashboard" className="text-sm font-medium text-white transition-colors">Dashboard</Link>
            <Link href="/dashboard/customers" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Customers</Link>
            <Link href="/dashboard/ledger" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Ledger</Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5 transition-colors outline-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                  {displayName[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm text-slate-300 font-medium">{displayName}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-white/10 text-slate-300">
                <div className="px-2 py-1.5 text-xs font-medium text-slate-400">{user.email}</div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="hover:bg-white/5 cursor-pointer gap-2">
                  <User className="w-4 h-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="hover:bg-red-500/10 text-red-400 cursor-pointer gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Welcome */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Hey, {displayName.split(' ')[0]} 👋
            </h1>
            <p className="text-slate-400 mt-1">Here&apos;s your financial overview</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full sm:w-auto bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-purple-500 [&>option]:bg-slate-900"
            >
              <option value="all">All Time (مکمل)</option>
              <option value="30days">Last 30 Days (گزشتہ 30 دن)</option>
              <option value="7days">Last 7 Days (گزشتہ 7 دن)</option>
            </select>
            <Button
              onClick={() => setShowTransactionForm(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/20 gap-2"
            >
              <Plus className="w-4 h-4" /> Add Debt (ادھار دیں)
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Outstanding */}
          <Card className="sm:col-span-1 border border-white/10 bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-medium flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Outstanding (بقیہ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${outstanding >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Rs.{Math.abs(outstanding).toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {outstanding >= 0 ? 'Still owed to you' : 'You owe more than lent'}
              </p>
            </CardContent>
          </Card>

          {/* Total Lent */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-400" /> You Gave (دیا)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-400">Rs.{totalLent.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">All udhaar given</p>
            </CardContent>
          </Card>

          {/* Total Recovered */}
          <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-400 font-medium flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-400" /> You Got (لیا)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-400">Rs.{totalRecovered.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1">Payments received</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/customers">
            <Card className="border border-white/10 bg-white/5 hover:bg-white/8 hover:border-purple-500/30 transition-all cursor-pointer group">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Customers (گاہک)</p>
                  <p className="text-slate-500 text-xs">{customers.length} contacts</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-purple-400 transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/dashboard/ledger">
            <Card className="border border-white/10 bg-white/5 hover:bg-white/8 hover:border-blue-500/30 transition-all cursor-pointer group">
              <CardContent className="flex items-center gap-4 py-5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-semibold">Ledger (کھاتہ)</p>
                  <p className="text-slate-500 text-xs">{recentTransactions.length > 0 ? 'View all transactions' : 'No transactions yet'}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 ml-auto group-hover:text-blue-400 transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Transactions */}
        <Card className="border border-white/10 bg-white/5 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-white text-lg font-semibold">Recent Activity (حالیہ لین دین)</CardTitle>
            <Link href="/dashboard/ledger">
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 text-xs gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto">
                  <DollarSign className="w-7 h-7 text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium">No transactions yet</p>
                <p className="text-slate-500 text-sm">Click &quot;Add Debt&quot; to record your first udhaar</p>
                <Button
                  size="sm"
                  onClick={() => setShowTransactionForm(true)}
                  className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Debt (ادھار دیں)
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentTransactions.map((tx) => {
                  const isUdhaar = tx.type === 'udhaar'
                  const customer = customerMap.get(tx.customer_id)
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isUdhaar ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                          {isUdhaar
                            ? <ArrowUpRight className="w-4 h-4 text-red-400" />
                            : <ArrowDownLeft className="w-4 h-4 text-green-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">
                            {customer?.name ?? 'Unknown'}
                            {tx.note && <span className="text-slate-500 font-normal ml-1">· {tx.note}</span>}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(tx.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`text-xs border-0 ${isUdhaar ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}
                        >
                          {isUdhaar ? 'udhaar' : 'payment'}
                        </Badge>
                        <p className={`text-sm font-bold ${isUdhaar ? 'text-red-400' : 'text-green-400'}`}>
                          {isUdhaar ? '-' : '+'}Rs.{Number(tx.amount).toLocaleString()}
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

      {showTransactionForm && (
        <TransactionForm
          customers={customers}
          onClose={() => setShowTransactionForm(false)}
          onSuccess={() => { setShowTransactionForm(false); router.refresh() }}
        />
      )}
    </div>
  )
}
