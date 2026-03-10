import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ children }) {
    const [session, setSession] = useState(undefined)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
        })
        const { data: listener } =
            supabase.auth.onAuthStateChange(
                (_event, session) => setSession(session)
            )
        return () => listener.subscription.unsubscribe()
    }, [])

    if (session === undefined) return (
        <div style={{
            minHeight: '100vh',
            background: '#FEFAE0', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '40px', height: '40px',
                border: '3px solid #E5E7EB',
                borderTop: '3px solid #2D6A4F',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )

    if (!session)
        return <Navigate to="/consultant/login" />
    return children
}
