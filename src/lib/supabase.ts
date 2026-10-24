import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

export const isSupabaseConfigured =
  /^https?:\/\/[^/\s]+/i.test(supabaseUrl) &&
  supabaseAnonKey.length > 20 &&
  !/placeholder|your_supabase|example/i.test(`${supabaseUrl} ${supabaseAnonKey}`)

export const isMockGalleryEnabled = import.meta.env.VITE_MOCK_GALLERIES === 'true'

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://unconfigured.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'unconfigured-anon-key',
)

export type Artwork = {
  id: string
  section: string
  title: string
  description?: string
  image_url: string
  thumbnail_url: string
  year?: string
  medium?: string
  width?: number
  height?: number
  display_order: number
  created_at: string
  user_id: string
}
