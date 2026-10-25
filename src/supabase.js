// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// Pastikan Anda menaruh URL dan KEY ini di file .env lokal Anda
// VITE_SUPABASE_URL=https://xyzcompany.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGci...
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)