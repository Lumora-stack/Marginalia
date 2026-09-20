import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Artwork = {
  id: string
  section: string
  title: string
  description?: string
  image_url: string
  thumbnail_url: string
  year?: string
  medium?: string
  display_order: number
  created_at: string
  user_id: string
}
