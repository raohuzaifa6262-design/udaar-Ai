'use client'

import { useState, useTransition, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addCustomer, updateCustomer, deleteCustomer } from '@/lib/actions/customers'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, X, Loader2, Users, BookOpen, Search, LayoutDashboard } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'
import type { Database } from '@/lib/database.types'

import {
  CustomerCard,
  SearchComponent,
  EmptyState,
  LoadingSkeleton,
} from './components'

type Customer = Database['public']['Tables']['customers']['Row']

interface Props {
  customers: Customer[]
  userId:    string
  balances:  Record<string, number>
}

type FormData = { name: string; email: string; phone: string; notes: string }
const emptyForm: FormData = { name: '', email: '', phone: '', notes: '' }

export default function CustomersClient({ customers: initial, userId, balances }: Props) {
  const router  = useRouter()
  const [isPending, startTransition] = useTransition()
  const [customers, setCustomers]    = useState<Customer[]>(initial)
  const [search, setSearch]          = useState('')
  const [showForm, setShowForm]      = useState(false)
  const [editingId, setEditingId]    = useState<string | null>(null)
  const [deletingId, setDeletingId]  = useState<string | null>(null)
  const [form, setForm]              = useState<FormData>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [mounted, setMounted]        = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
    )
  }, [customers, search])

  function openAdd() { setEditingId(null); setForm(emptyForm); setShowForm(true) }
  function openEdit(c: Customer) {
    setEditingId(c.id)
    setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', notes: c.notes ?? '' })
    setShowForm(true)
  }
  function closeForm() { setShowForm(false); setEditingId(null); setForm(emptyForm) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required / نام ضروری ہے'); return }
    setFormLoading(true)
    if (editingId) {
      const res = await updateCustomer(editingId, form)
      if (res.error) { toast.error(res.error); setFormLoading(false); return }
      setCustomers((prev) => prev.map((c) => c.id === editingId ? { ...c, ...form, updated_at: new Date().toISOString() } : c))
      toast.success('Customer updated! ✓')
      startTransition(() => router.refresh())
    } else {
      const res = await addCustomer(form)
      if (res.error) { toast.error(res.error); setFormLoading(false); return }
      toast.success('Naya gahak shamil ho gaya! 🎉')
      startTransition(() => router.refresh())
      const { data, error } = await supabase.from('customers').select('*').eq('user_id', userId).order('name', { ascending: true })
      if (!error && data) setCustomers(data)
    }
    setFormLoading(false)
    closeForm()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await deleteCustomer(id)
    if (res.error) { toast.error(res.error); setDeletingId(null); return }
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    toast.success('Customer removed.')
    setDeletingId(null)
    startTransition(() => router.refresh())
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 relative pb-20 sm:pb-8">

      {/* ── HEADER ── */}
      <header className="border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo + Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                <BookOpen className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
            </Link>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <span className="text-border">/</span>
              <span className="text-primary font-bold">Customers</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={openAdd}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md gap-2 h-10 glow-emerald transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Customer / نیا گاہک</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Title */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Customers / <span className="urdu-inline">گاہکوں کی لسٹ</span>
            </h1>
            <p className="text-muted-foreground text-xs font-semibold mt-1">
              {customers.length} contact{customers.length !== 1 ? 's' : ''} saved
              {filtered.length !== customers.length && (
                <span className="text-primary ml-1">· {filtered.length} shown</span>
              )}
            </p>
          </div>
        </div>

        {/* Search */}
        <SearchComponent
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
        />

        {/* Cards or States */}
        {isPending ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState isSearch={!!search} searchQuery={search} onAdd={openAdd} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                balance={balances[customer.id] ?? 0}
                onEdit={openEdit}
                onDelete={handleDelete}
                deletingId={deletingId}
                onClick={() => router.push(`/dashboard/ledger/${customer.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── FAB — Mobile ── */}
      <div className="fixed bottom-6 right-6 sm:hidden z-30">
        <Button
          onClick={openAdd}
          className="w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-2xl glow-emerald flex items-center justify-center border-none transition-all active:scale-95"
          aria-label="Add customer"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      {/* ── ADD / EDIT DRAWER ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeForm} />

          {/* Sheet panel */}
          <div className="relative w-full sm:max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">

            {/* Handle — mobile */}
            <div className="w-12 h-1 bg-border rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingId ? 'Edit Details / ترمیم کریں' : 'Add New Customer / نیا گاہک'}
              </h2>
              <button
                onClick={closeForm}
                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted touch-target"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Name / نام <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Aslam Khan"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  disabled={formLoading}
                  className="h-11 bg-background/60 border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Phone / فون نمبر
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 300 1234567"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  disabled={formLoading}
                  className="h-11 bg-background/60 border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  disabled={formLoading}
                  className="h-11 bg-background/60 border-border focus-visible:ring-primary focus-visible:border-primary"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Notes / تفصیل
                </Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Shop address, balance info, etc..."
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  disabled={formLoading}
                  className="w-full rounded-xl bg-background/60 border border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm px-3 py-2.5 resize-none outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={formLoading}
                  className="flex-1 h-12 border-border font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-md glow-emerald transition-all"
                >
                  {formLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                    : editingId ? 'Save / محفوظ کریں' : 'Add Customer'
                  }
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
