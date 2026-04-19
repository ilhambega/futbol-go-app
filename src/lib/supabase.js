import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://yajerdfaccnnxhvhqhes.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhamVyZGZhY2NubnhodmhxaGVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NzU4MTUsImV4cCI6MjA5MjE1MTgxNX0.bi9biNsmVrX3vjizzmt2wzWu8xDN0JaBXganEPdf4dQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
