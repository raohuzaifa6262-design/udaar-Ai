'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { parseTransaction } from '@/lib/parser'

export type ParserActionResponse = 
  | { 
      success: true; 
      status: 'transaction_saved'; 
      data: { 
        customerName: string; 
        amount: number; 
        transactionType: 'udhaar' | 'payment'; 
      } 
    }
  | { 
      success: false; 
      status: 'customer_not_found'; 
      data: { 
        customerName: string; 
        amount: number; 
        transactionType: 'udhaar' | 'payment'; 
      } 
    }
  | { 
      success: false; 
      status: 'error'; 
      error: string 
    };

/**
 * Server action that accepts a raw Roman Urdu input, parses it, searches Supabase for a matching customer,
 * and records the transaction if found. If not found, it returns the parsed details so the frontend
 * can ask the user if they wish to create a new customer.
 */
export async function parseAndCreateTransaction(rawText: string): Promise<ParserActionResponse> {
  // 1. Parse the Roman Urdu text entry
  const parseResult = parseTransaction(rawText)
  if (!parseResult.success) {
    return {
      success: false,
      status: 'error',
      error: parseResult.error
    }
  }

  const { customerName, amount, transactionType } = parseResult

  // 2. Authenticate the user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      status: 'error',
      error: 'Not authenticated. Please log in first.'
    }
  }

  try {
    // 3. Query Supabase to find a customer matching the parsed name for this user (case-insensitively)
    const { data: customer, error: customerError } = await (supabase as any)
      .from('customers')
      .select('id, name')
      .eq('user_id', user.id)
      .ilike('name', customerName)
      .maybeSingle()

    if (customerError) {
      return {
        success: false,
        status: 'error',
        error: `Database error looking up customer: ${customerError.message}`
      }
    }

    // 4. If customer exists: insert the transaction
    if (customer) {
      const { error: txError } = await (supabase as any)
        .from('transactions')
        .insert({
          user_id: user.id,
          customer_id: customer.id,
          type: transactionType,
          amount,
          note: rawText, // Save the raw text in notes to preserve history
          transaction_date: new Date().toISOString().split('T')[0]
        })

      if (txError) {
        return {
          success: false,
          status: 'error',
          error: `Database error logging transaction: ${txError.message}`
        }
      }

      // Revalidate dashboard and ledger cache pathways
      revalidatePath('/dashboard')
      revalidatePath('/dashboard/ledger')
      revalidatePath(`/dashboard/ledger/${customer.id}`)

      return {
        success: true,
        status: 'transaction_saved',
        data: {
          customerName: customer.name,
          amount,
          transactionType
        }
      }
    }

    // 5. If customer does not exist: ask user to create the customer
    return {
      success: false,
      status: 'customer_not_found',
      data: {
        customerName,
        amount,
        transactionType
      }
    }
  } catch (err: any) {
    return {
      success: false,
      status: 'error',
      error: err.message || 'An unexpected error occurred during database lookup'
    }
  }
}

/**
 * Server action that creates a customer and logs a transaction in a single query chain.
 * Useful when the parser cannot find the customer, and the user approves auto-creation.
 */
export async function createCustomerAndTransaction(data: {
  customerName: string;
  amount: number;
  transactionType: 'udhaar' | 'payment';
  rawText: string;
}): Promise<ParserActionResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      status: 'error',
      error: 'Not authenticated. Please log in first.'
    }
  }

  try {
    // 1. Insert the new customer and return its ID
    const { data: newCustomer, error: customerError } = await (supabase as any)
      .from('customers')
      .insert({
        user_id: user.id,
        name: data.customerName,
        notes: `Created automatically via Quick AI entry: "${data.rawText}"`
      })
      .select('id, name')
      .single()

    if (customerError) {
      return {
        success: false,
        status: 'error',
        error: `Database error creating customer: ${customerError.message}`
      }
    }

    // 2. Insert the transaction associated with the new customer
    const { error: txError } = await (supabase as any)
      .from('transactions')
      .insert({
        user_id: user.id,
        customer_id: newCustomer.id,
        type: data.transactionType,
        amount: data.amount,
        note: data.rawText, // Save the raw text in notes
        transaction_date: new Date().toISOString().split('T')[0]
      })

    if (txError) {
      return {
        success: false,
        status: 'error',
        error: `Database error logging transaction: ${txError.message}`
      }
    }

    // Revalidate all related cache routes
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/customers')
    revalidatePath('/dashboard/ledger')
    revalidatePath(`/dashboard/ledger/${newCustomer.id}`)

    return {
      success: true,
      status: 'transaction_saved',
      data: {
        customerName: newCustomer.name,
        amount: data.amount,
        transactionType: data.transactionType
      }
    }
  } catch (err: any) {
    return {
      success: false,
      status: 'error',
      error: err.message || 'An unexpected error occurred during database insert'
    }
  }
}
