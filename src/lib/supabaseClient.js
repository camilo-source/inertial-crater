import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase Environment Variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const syncUser = async (authUser) => {
    try {
        // 1. Sync public.users table (Upsert to keep last_login_at updated)
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: authUser.id,
                google_id: authUser.app_metadata?.provider_id || authUser.id,
                email: authUser.email,
                full_name: authUser.user_metadata?.full_name,
                avatar_url: authUser.user_metadata?.avatar_url,
                last_login_at: new Date().toISOString(),
            }, { onConflict: 'id' })

        if (userError) {
            console.error('Error syncing user:', userError)
            return
        }

        console.log('User synced successfully')

        // 2. Sync public.all_candidates table (Insert if not exists)
        // We use select().single() first to check existence to avoid throwing an error on the console for duplicates if we used purely insert,
        // OR we can use upsert with ignoreDuplicates.
        // The user wants it created "once... for the first time".

        const { data: existingCandidate } = await supabase
            .from('all_candidates')
            .select('candidate_id')
            .eq('candidate_id', authUser.id)
            .single()

        if (!existingCandidate) {
            const { error: candidateError } = await supabase
                .from('all_candidates')
                .insert({
                    candidate_id: authUser.id,
                    full_name: authUser.user_metadata?.full_name, // Initialize with name from Google
                    // Other fields start empty
                })

            if (candidateError) {
                console.error('Error creating candidate profile:', candidateError)
            } else {
                console.log('Candidate profile created for first-time login')
            }
        } else {
            console.log('Candidate profile already exists. Skipping creation.')
        }

    } catch (err) {
        console.error('Unexpected error syncing user:', err)
    }
}
