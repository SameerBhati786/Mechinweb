import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Client {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string
  category: string
  pricing: {
    basic: number
    standard: number
    enterprise: number
  }
  features: {
    basic: string[]
    standard: string[]
    enterprise: string[]
  }
}

export interface Order {
  id: string
  client_id: string
  service_id: string
  package_type: 'basic' | 'standard' | 'enterprise'
  amount_usd: number
  amount_inr: number
  currency: 'USD' | 'INR'
  status: 'pending' | 'paid' | 'completed' | 'cancelled'
  payment_intent_id?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  order_id: string
  client_id: string
  invoice_number: string
  amount_usd: number
  amount_inr: number
  currency: 'USD' | 'INR'
  tax_amount: number
  total_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  due_date: string
  created_at: string
  updated_at: string
}