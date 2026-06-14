'use server'

import { createClient } from '@/utils/supabase/server'

/**
 * Searches for a customer by name (case-insensitive).
 */
export async function searchCustomers(nameQuery: string): Promise<any[]> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .ilike('name', `%${nameQuery}%`)

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Searches for a supplier by name (case-insensitive).
 */
export async function searchSuppliers(nameQuery: string): Promise<any[]> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('user_id', user.id)
    .ilike('name', `%${nameQuery}%`)

  if (error) throw new Error(error.message)
  return data || []
}

/**
 * Creates a new customer
 */
export async function createCustomer(name: string, phone?: string): Promise<any> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      name,
      phone: phone || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Creates a new supplier
 */
export async function createSupplier(name: string, phone?: string): Promise<any> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      user_id: user.id,
      name,
      phone: phone || null
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Adds a simple Udhaar/Payment Transaction
 */
export async function recordTransaction(
  amount: number,
  type: 'udhaar' | 'payment',
  customer_id: string,
  note: string
): Promise<any> {
  const supabase: any = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      customer_id,
      type,
      amount,
      note: note || null,
      transaction_date: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
