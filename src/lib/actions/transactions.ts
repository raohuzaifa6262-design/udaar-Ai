'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addTransaction(formData: {
  customer_id: string
  type: 'udhaar' | 'payment'
  amount: number
  note?: string
  transaction_date: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  if (formData.amount <= 0) return { error: 'Amount must be greater than 0' }

  const { error } = await (supabase as any).from('transactions').insert({
    user_id: user.id,
    customer_id: formData.customer_id,
    type: formData.type,
    amount: formData.amount,
    note: formData.note || null,
    transaction_date: formData.transaction_date,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/ledger')
  revalidatePath(`/dashboard/ledger/${formData.customer_id}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteTransaction(id: string, customerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await (supabase as any)
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/ledger')
  revalidatePath(`/dashboard/ledger/${customerId}`)
  revalidatePath('/dashboard')
  return { success: true }
}
