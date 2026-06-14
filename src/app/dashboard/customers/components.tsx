'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fmt } from '@/lib/ledger'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Search, Users, Phone, Mail, FileText, MoreVertical,
  Pencil, Trash2, Loader2, X, UserPlus, ArrowRight
} from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Customer = Database['public']['Tables']['customers']['Row']


/* 1. CustomerCard Component */
interface CustomerCardProps {
  customer: Customer
  balance: number
  onEdit: (c: Customer) => void
  onDelete: (id: string) => void
  deletingId: string | null
  onClick: () => void
}

export function CustomerCard({ customer, balance, onEdit, onDelete, deletingId, onClick }: CustomerCardProps) {
  const isOwed = balance > 0
  const isOweTheme = balance < 0
  const isSettled = balance === 0 || !balance

  return (
    <Card
      onClick={onClick}
      className="border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-emerald-500/40 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-md transition-all duration-200 group rounded-2xl cursor-pointer overflow-hidden flex flex-col justify-between"
    >
      <div>
        <CardHeader className="pb-3 pt-4 px-5 flex flex-row items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Circle Initials */}
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/40 flex items-center justify-center flex-shrink-0 text-emerald-700 dark:text-emerald-400 font-extrabold text-base shadow-sm">
              {customer.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-slate-900 dark:text-white text-base font-bold truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {customer.name}
              </CardTitle>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-semibold mt-0.5">
                Added {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Action Menu dropdown */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 outline-none">
                <MoreVertical className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 w-36 rounded-xl shadow-lg p-1">
                <DropdownMenuItem
                  onClick={() => onEdit(customer)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer gap-2 py-2 rounded-lg text-sm font-semibold"
                >
                  <Pencil className="w-4 h-4 text-slate-500" /> Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(customer.id)}
                  disabled={deletingId === customer.id}
                  className="hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 cursor-pointer gap-2 py-2 rounded-lg text-sm font-semibold"
                >
                  {deletingId === customer.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                  ) : (
                    <><Trash2 className="w-4 h-4" /> Delete</>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Contact/Info Content */}
        <CardContent className="space-y-2 pt-0 pb-3 px-5 border-t border-slate-55 dark:border-slate-800/30 mt-2">
          {customer.phone && (
            <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400 text-sm font-medium">
              <Phone className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span>{customer.phone}</span>
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2 text-slate-650 dark:text-slate-400 text-sm font-medium">
              <Mail className="w-4 h-4 flex-shrink-0 text-slate-400" />
              <span className="truncate">{customer.email}</span>
            </div>
          )}
          {customer.notes && (
            <div className="flex items-start gap-2 text-slate-400 dark:text-slate-500 text-xs mt-1.5 bg-slate-50 dark:bg-slate-850/50 p-2 rounded-lg">
              <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-1">{customer.notes}</span>
            </div>
          )}
        </CardContent>
      </div>

      {/* Outstanding Balance Badge section */}
      <div className="px-5 pb-4 pt-1 flex items-center justify-between border-t border-slate-50 dark:border-slate-850/20 bg-slate-50/30 dark:bg-slate-900/30">
        <span className="text-[10px] font-extrabold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Balance Status</span>
        <Badge
          variant="outline"
          className={`text-xs font-black border-none px-2.5 py-0.5 rounded-full ${
            isOwed
              ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
              : isOweTheme
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
          }`}
        >
          {isOwed ? (
            `Owes ${fmt(Math.abs(balance))}`
          ) : isOweTheme ? (
            `You owe ${fmt(Math.abs(balance))}`
          ) : (
            'Settled'
          )}
        </Badge>
      </div>
    </Card>
  )
}

/* 2. Search Component */
interface SearchComponentProps {
  value: string
  onChange: (val: string) => void
  onClear: () => void
}

export function SearchComponent({ value, onChange, onClear }: SearchComponentProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-450 dark:text-slate-500 pointer-events-none" />
      <Input
        placeholder="Search by name, phone or email..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 pl-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 text-base rounded-xl shadow-sm"
      />
      {value && (
        <button onClick={onClear} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-600 dark:hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}

import ReusableEmptyState from '@/components/empty-state'

/* 3. Empty State Component Wrapper */
interface EmptyStateProps {
  isSearch: boolean
  searchQuery?: string
  onAdd: () => void
}

export function EmptyState({ isSearch, searchQuery, onAdd }: EmptyStateProps) {
  return (
    <ReusableEmptyState
      variant={isSearch ? 'search' : 'customers'}
      searchQuery={searchQuery}
      onAction={onAdd}
    />
  )
}

/* 4. Loading Skeleton Component */
export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl h-44 animate-pulse flex flex-col justify-between overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              </div>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
          </div>
          <div className="h-10 bg-slate-100 dark:bg-slate-850 px-5 flex items-center justify-between">
            <div className="h-3 bg-slate-200 dark:bg-slate-850 rounded w-1/4" />
            <div className="h-5 bg-slate-200 dark:bg-slate-850 rounded w-1/3" />
          </div>
        </Card>
      ))}
    </div>
  )
}
