import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ClientProtectedRoute({ children }) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setLoading(false)
        }
        checkAuth()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <div className="text-4xl animate-bounce">🌿</div>
            </div>
        )
    }

    if (!session) {
        return <Navigate to="/client/login" replace />
    }

    // Check if they are a client via user metadata
    const userType = session.user.user_metadata?.user_type
    if (userType !== 'client') {
        // If they are a consultant, they shouldn't be here
        return <Navigate to="/dashboard" replace />
    }

    return children
}
