import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, getCurrentStaff } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [staff, setStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
          const staffData = await getCurrentStaff()
          setStaff(staffData)
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          try {
            const staffData = await getCurrentStaff()
            setStaff(staffData)
            setError(null)
          } catch (err) {
            console.error('Error getting staff data:', err)
            setError(err.message)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setStaff(null)
          setError(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Check if user is active staff member
      const staffData = await getCurrentStaff()
      if (!staffData) {
        await supabase.auth.signOut()
        throw new Error('Access denied. Please contact your administrator.')
      }

      // Update last login
      await supabase
        .from('staff')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)

      setStaff(staffData)
      return { data, error: null }
    } catch (err) {
      console.error('Sign in error:', err)
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      setError(null)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`
      })
      if (error) throw error
      return { error: null }
    } catch (err) {
      console.error('Reset password error:', err)
      setError(err.message)
      return { error: err }
    }
  }

  const updatePassword = async (password) => {
    try {
      setError(null)
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      return { error: null }
    } catch (err) {
      console.error('Update password error:', err)
      setError(err.message)
      return { error: err }
    }
  }

  const isAdmin = () => {
    return staff?.role === 'admin'
  }

  const isStaff = () => {
    return staff?.role === 'staff' || staff?.role === 'admin'
  }

  const value = {
    user,
    staff,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    isAdmin,
    isStaff
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}