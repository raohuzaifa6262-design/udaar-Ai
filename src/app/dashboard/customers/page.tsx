import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CustomersClient from './customers-client'

export default async function CustomersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  return <CustomersClient customers={customers ?? []} userId={user.id} />
}
