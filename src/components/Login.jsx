import { useState, useEffect } from 'react'
import { supabase, syncUser } from '../lib/supabaseClient'

export default function Login() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
            if (session?.user) {
                syncUser(session.user)
            }
        })

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
            if (session?.user) {
                await syncUser(session.user)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            })
            if (error) throw error
        } catch (error) {
            alert(error.message)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    const handleUploadCV = () => {
        const n8nBaseUrl = 'https://n8n.metanoian8n.com/form-test/a6665dd2-1e46-4c3f-ba81-3f2f2d8688be'
        const redirectUrl = new URL(n8nBaseUrl)
        redirectUrl.searchParams.append('userId', user.id)
        redirectUrl.searchParams.append('email', user.email)
        window.location.href = redirectUrl.toString()
    }

    if (loading) {
        return <div className="container">Loading...</div>
    }

    if (user) {
        return (
            <div className="container logged-in">
                <div className="card">
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="avatar" />
                    <h2>Welcome, {user.user_metadata.full_name}</h2>
                    <p>Email: {user.email}</p>
                    <button onClick={handleUploadCV} className="btn-primary">Upload CV</button>
                    <button onClick={() => window.location.href = '/profile'} className="btn-secondary" style={{ marginBottom: '0.5rem' }}>Edit Profile</button>
                    <button onClick={handleLogout} className="btn-secondary">Sign Out</button>
                </div>
            </div>
        )
    }

    return (
        <div className="container login-page">
            <div className="card">
                <h1>Welcome Back</h1>
                <p>Sign in to access your dashboard</p>
                <button onClick={handleLogin} className="google-btn">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
                    <span>Sign in with Google</span>
                </button>
            </div>
        </div>
    )
}
