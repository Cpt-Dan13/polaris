import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { api, type AdminUser } from '../lib/api'

interface AuthContextValue {
  session:      Session | null
  adminUser:    AdminUser | null
  loading:      boolean
  verifying:    boolean        // true while checking admin status after sign-in
  adminError:   string | null  // set when a non-admin account tries to sign in
  signIn:       (email: string, password: string) => Promise<string | null>
  signOut:      () => Promise<void>
  updateAvatar: (seed: string | null) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session,    setSession]    = useState<Session | null>(null)
  const [adminUser,  setAdminUser]  = useState<AdminUser | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [verifying,  setVerifying]  = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)

  // Tracks whether the initial session check has completed so onAuthStateChange
  // can tell new sign-ins apart from the startup INITIAL_SESSION event.
  const initialLoadDone = useRef(false)

  async function loadAdminUser(_s: Session) {
    try {
      const res = await api.me()
      setAdminUser(res.data)
      setAdminError(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('not an admin') || msg.includes('403')) {
        setAdminError('This account does not have admin access.')
        await supabase.auth.signOut()
        setSession(null)
        setAdminUser(null)
      }
      // Network/server errors leave the session intact so a transient failure
      // doesn't log out a legitimate admin.
    }
  }

  useEffect(() => {
    // One-time session hydration on mount — handles the loading spinner.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) {
        loadAdminUser(s).finally(() => {
          setLoading(false)
          initialLoadDone.current = true
        })
      } else {
        setLoading(false)
        initialLoadDone.current = true
      }
    })

    // Listens for sign-in / sign-out events that happen after the initial load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) {
        if (initialLoadDone.current) {
          // New sign-in — show verifying spinner, check admin status.
          setVerifying(true)
          loadAdminUser(s).finally(() => setVerifying(false))
        }
        // else: initial session, already handled by getSession() above.
      } else {
        setAdminUser(null)
        setVerifying(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    setAdminError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message === 'Invalid login credentials'
      ? 'Incorrect email or password.'
      : error.message
    return null
    // Admin verification happens in onAuthStateChange → loadAdminUser.
  }

  async function signOut() {
    await supabase.auth.signOut()
    setSession(null)
    setAdminUser(null)
    setAdminError(null)
  }

  async function updateAvatar(seed: string | null) {
    await api.updateAvatar(seed)
    setAdminUser(prev => prev ? { ...prev, avatar_seed: seed } : prev)
  }

  return (
    <AuthContext.Provider value={{ session, adminUser, loading, verifying, adminError, signIn, signOut, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
