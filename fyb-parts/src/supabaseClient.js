import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fbdbioanbnefmdnklhpm.supabase.co'
const supabaseKey = 'sb_publishable_eD8cQcdt4v7_2Xc6Vp4HiQ_aU1K1hs2'

export const supabase = createClient(supabaseUrl, supabaseKey)