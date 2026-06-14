export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      debts: {
        Row: {
          id: string
          lender_id: string
          borrower_id: string
          amount: number
          currency: string
          description: string | null
          status: 'pending' | 'settled'
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lender_id: string
          borrower_id: string
          amount: number
          currency?: string
          description?: string | null
          status?: 'pending' | 'settled'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lender_id?: string
          borrower_id?: string
          amount?: number
          currency?: string
          description?: string | null
          status?: 'pending' | 'settled'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settlements: {
        Row: {
          id: string
          debt_id: string
          payer_id: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          debt_id: string
          payer_id: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          debt_id?: string
          payer_id?: string
          amount?: number
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          customer_id: string
          type: 'udhaar' | 'payment'
          amount: number
          note: string | null
          transaction_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          customer_id: string
          type: 'udhaar' | 'payment'
          amount: number
          note?: string | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          customer_id?: string
          type?: 'udhaar' | 'payment'
          amount?: number
          note?: string | null
          transaction_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      customer_balances: {
        Row: {
          user_id: string
          customer_id: string
          customer_name: string
          phone: string | null
          email: string | null
          total_udhaar: number
          total_paid: number
          balance: number
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
