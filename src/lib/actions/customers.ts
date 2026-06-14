'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function addCustomer(formData: {
  name: string
  email?: string
  phone?: string
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('customers').insert({
    user_id: user.id,
    name: formData.name,
    email: formData.email || null,
    phone: formData.phone || null,
    notes: formData.notes || null,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/customers')
  return { success: true }
}

export async function updateCustomer(
  id: string,
  formData: { name: string; email?: string; phone?: string; notes?: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('customers')
    .update({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      notes: formData.notes || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/customers')
  return { success: true }
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/customers')
  return { success: true }
}
