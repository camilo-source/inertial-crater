import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState({
        full_name: '',
        role: '',
        location: '',
        seniority: '',
        linkedin_url: '',
        summary: '',
        skills: '',
        status: ''
    })

    useEffect(() => {
        getProfile()
    }, [])

    const getProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                navigate('/login')
                return
            }

            const { data, error } = await supabase
                .from('all_candidates')
                .select('*')
                .eq('candidate_id', user.id)
                .single()

            if (error) {
                console.warn('Error fetching profile or no profile found:', error)
            } else if (data) {
                setProfile(data)
            }
        } catch (error) {
            console.error('Error loading user data:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            const updates = {
                candidate_id: user.id,
                ...profile,
                updated_at: new Date().toISOString()
            }

            const { error } = await supabase
                .from('all_candidates')
                .upsert(updates)

            if (error) throw error
            alert('Profile updated successfully!')
        } catch (error) {
            alert('Error updating profile: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setProfile(prev => ({
            ...prev,
            [name]: value
        }))
    }

    if (loading) return <div className="container">Loading...</div>

    return (
        <div className="container">
            <div className="card" style={{ maxWidth: '600px', textAlign: 'left' }}>
                <h2 style={{ textAlign: 'center' }}>Candidate Profile</h2>
                <form onSubmit={updateProfile} className="profile-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="full_name"
                            value={profile.full_name || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>LinkedIn URL</label>
                        <input
                            type="text"
                            name="linkedin_url"
                            placeholder="https://linkedin.com/in/..."
                            value={profile.linkedin_url || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <input
                            type="text"
                            name="role"
                            placeholder="e.g. Frontend Developer"
                            value={profile.role || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Seniority</label>
                        <select name="seniority" value={profile.seniority || ''} onChange={handleChange}>
                            <option value="">Select Seniority</option>
                            <option value="Junior">Junior</option>
                            <option value="Mid">Mid</option>
                            <option value="Senior">Senior</option>
                            <option value="Lead">Lead</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={profile.location || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <input type="text" name="status" value={profile.status || ''} onChange={handleChange} placeholder="e.g. Open to work" />
                    </div>
                    <div className="form-group">
                        <label>Skills</label>
                        <input
                            type="text"
                            name="skills"
                            placeholder="React, Node.js, etc."
                            value={profile.skills || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Summary</label>
                        <textarea
                            name="summary"
                            rows="4"
                            value={profile.summary || ''}
                            onChange={handleChange}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Profile'}
                    </button>

                    <button type="button" onClick={() => navigate('/login')} className="btn-secondary">
                        Back to Dashboard
                    </button>
                </form>
            </div>
        </div>
    )
}
