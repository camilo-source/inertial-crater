import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, syncUser } from '../lib/supabaseClient'

export default function Apply() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState('Initializing application flow...')
    const jobId = searchParams.get('jobId')

    useEffect(() => {
        if (!jobId) {
            setStatus('Error: No Job ID provided.')
            return
        }

        const checkSessionAndRedirect = async () => {
            try {
                const { data, error } = await supabase.auth.getSession()

                if (error) {
                    throw error
                }

                const session = data?.session

                if (!session) {
                    setStatus('Redirecting to login...')
                    // Redirect to login, preserving the current URL as the redirect target
                    // The Current URL includes ?jobId=... so it will persist
                    const { error: signInError } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            redirectTo: window.location.href
                        }
                    })
                    if (signInError) throw signInError
                } else {
                    setStatus('Authenticated. Redirecting to application form...')
                    const { user } = session

                    await syncUser(user)

                    // Construct the n8n webhook URL
                    const n8nBaseUrl = 'https://n8n.metanoian8n.com/form-test/230e09f7-33df-4266-917d-ce3398cae141'
                    const redirectUrl = new URL(n8nBaseUrl)

                    redirectUrl.searchParams.append('jobId', jobId)
                    redirectUrl.searchParams.append('userId', user.id)
                    redirectUrl.searchParams.append('email', user.email)

                    // Small delay to show status (optional, for UX)
                    setTimeout(() => {
                        window.location.href = redirectUrl.toString()
                    }, 1500)
                }
            } catch (error) {
                console.error('Error during application flow:', error)
                setStatus(`Error: ${error.message || JSON.stringify(error)}`)
            }
        }

        checkSessionAndRedirect()
    }, [jobId])

    return (
        <div className="container">
            <div className="card">
                <h2>Job Application</h2>
                {jobId && <p>Applying for Job ID: <strong>{jobId}</strong></p>}
                <div className="status-message" style={{ marginTop: '20px', color: 'var(--primary-color)' }}>
                    {status}
                </div>
                {!jobId && (
                    <p style={{ color: 'red' }}>Invalid Link. Please check your URL.</p>
                )}
            </div>
        </div>
    )
}
