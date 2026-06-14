'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { addCustomer, updateCustomer, deleteCustomer } from '@/lib/actions/customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Database } from '@/lib/database.types'
import {
  Plus, Search, Users, Phone, Mail, FileText,
  MoreVertical, Pencil, Trash2, Loader2, X, UserPlus,
} from 'lucide-react'

type Customer = Database['public']['Tables']['customers']['Row']

interface Props {
  customers: Customer[]
  userId: string
}

type FormData = { name: string; email: string; phone: string; notes: string }
const emptyForm: FormData = { name: '', email: '', phone: '', notes: '' }

export default function CustomersClient({ customers: initial, userId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [customers, setCustomers] = useState<Customer[]>(initial)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)

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

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(c: Customer) {
    setEditingId(c.id)
    setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '', notes: c.notes ?? '' })
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setFormLoading(true)

    if (editingId) {
      const res = await updateCustomer(editingId, form)
      if (res.error) { toast.error(res.error); setFormLoading(false); return }
      setCustomers((prev) => prev.map((c) => c.id === editingId ? { ...c, ...form, updated_at: new Date().toISOString() } : c))
      toast.success('Customer updated!')
    } else {
      const res = await addCustomer(form)
      if (res.error) { toast.error(res.error); setFormLoading(false); return }
      toast.success('Customer added!')
      startTransition(() => router.refresh())
    }

    setFormLoading(false)
    closeForm()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    const res = await deleteCustomer(id)
    if (res.error) { toast.error(res.error); setDeletingId(null); return }
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    toast.success('Customer deleted')
    setDeletingId(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              ← Dashboard
            </button>
            <span className="text-white/20">/</span>
            <span className="text-white font-semibold">Customers (گاہک)</span>
          </div>
          <Button
            onClick={openAdd}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/20 gap-2 h-9"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Customer (نیا گاہک)</span>
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page title + stats */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Customers (گاہک)</h1>
            <p className="text-slate-400 text-sm mt-0.5">{customers.length} total contact{customers.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder="Search by name, email or phone (تلاش کریں)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Customer List */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center">
              {search ? <Search className="w-8 h-8 text-slate-500" /> : <Users className="w-8 h-8 text-slate-500" />}
            </div>
            <div className="text-center">
              <p className="text-slate-300 font-medium text-lg">
                {search ? 'No customers found (کوئی گاہک نہیں ملا)' : 'No customers yet (کوئی گاہک نہیں)'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                {search ? `No results for "${search}"` : 'Add your first customer to start tracking debts'}
              </p>
            </div>
            {!search && (
              <Button
                onClick={openAdd}
                className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white gap-2"
              >
                <UserPlus className="w-4 h-4" /> Add Customer (نیا گاہک)
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((customer) => (
              <Card
                key={customer.id}
                className="border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/8 hover:border-purple-500/30 transition-all duration-200 group"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                      {customer.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-white text-base font-semibold truncate">{customer.name}</CardTitle>
                      <p className="text-slate-500 text-xs mt-0.5">
                        Since {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 outline-none opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-slate-300 w-36">
                      <DropdownMenuItem
                        onClick={() => openEdit(customer)}
                        className="hover:bg-white/5 cursor-pointer gap-2 text-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(customer.id)}
                        disabled={deletingId === customer.id}
                        className="hover:bg-red-500/10 text-red-400 cursor-pointer gap-2 text-sm"
                      >
                        {deletingId === customer.id
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting…</>
                          : <><Trash2 className="w-3.5 h-3.5" /> Delete</>
                        }
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="space-y-2 pt-0">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.notes && (
                    <div className="flex items-start gap-2 text-slate-500 text-xs mt-1">
                      <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{customer.notes}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Drawer (Modal) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeForm}
          />

          {/* Panel */}
          <div className="relative w-full sm:max-w-md bg-slate-900 border border-white/10 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl space-y-5 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button
                onClick={closeForm}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-300 text-sm">Name <span className="text-red-400">*</span></Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  disabled={formLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  disabled={formLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-slate-300 text-sm">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  disabled={formLoading}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-slate-300 text-sm">Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Any extra info about this customer…"
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  disabled={formLoading}
                  className="w-full rounded-md bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-sm px-3 py-2 resize-none outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={formLoading}
                  className="flex-1 border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-purple-500/20"
                >
                  {formLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingId ? 'Saving…' : 'Adding…'}</>
                    : editingId ? 'Save Changes' : 'Add Customer'
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
