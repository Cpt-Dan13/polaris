import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { api, type AdminUser } from '../lib/api'

interface AuthContextValue {
  session:   Session | null
  adminUser: AdminUser | null
  loading:   boolean
  signIn:    (email: string, password: string) => Promise<string | null>
  signOut:   () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,   setSession]   = useState<Session | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading,   setLoading]   = useState(true)

  async function loadAdminUser(_s: Session) {
    try {
      const res = await api.me()
      setAdminUser(res.data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      // Only force sign-out when the API explicitly rejects them as non-admin.
      // Network errors, 404s during deploys, 500s, etc. keep the session alive.
      if (msg.includes('not an admin') || msg.includes('403')) {
        await supabase.auth.signOut()
        setSession(null)
        setAdminUser(null)
      }
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) loadAdminUser(s).finally(() => setLoading(false))
      else   setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) loadAdminUser(s)
      else   setAdminUser(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    return null
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setAdminUser(null)
  }

  return (
    <AuthContext.Provider value={{ session, adminUser, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
