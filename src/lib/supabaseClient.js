import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase Environment Variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const syncUser = async (authUser) => {
    try {
        const { error } = await supabase
            .from('users')
            .upsert({
                id: authUser.id,
                google_id: authUser.app_metadata?.provider_id || authUser.id,
                email: authUser.email,
                full_name: authUser.user_metadata?.full_name,
                avatar_url: authUser.user_metadata?.avatar_url,
                last_login_at: new Date().toISOString(),
            }, { onConflict: 'id' })

        if (error) {
            console.error('Error syncing user:', error)
        } else {
            console.log('User synced successfully')
        }
    } catch (err) {
        console.error('Unexpected error syncing user:', err)
    }
}
