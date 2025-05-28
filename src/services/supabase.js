import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to check if user is authenticated staff
export const isAuthenticatedStaff = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const { data: staff } = await supabase
      .from('staff')
      .select('id, role, is_active')
      .eq('id', session.user.id)
      .eq('is_active', true)
      .single()

    return !!staff
  } catch (error) {
    console.error('Error checking staff authentication:', error)
    return false
  }
}

// Helper function to get current staff member
export const getCurrentStaff = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null

    const { data: staff } = await supabase
      .from('staff')
      .select('*')
      .eq('id', session.user.id)
      .eq('is_active', true)
      .single()

    return staff
  } catch (error) {
    console.error('Error getting current staff:', error)
    return null
  }
}

// Helper function to create audit log
export const createAuditLog = async (action, tableName, recordId, oldValues = null, newValues = null) => {
  try {
    const { data, error } = await supabase.rpc('create_audit_log', {
      p_action: action,
      p_table_name: tableName,
      p_record_id: recordId,
      p_old_values: oldValues,
      p_new_values: newValues
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating audit log:', error)
    throw error
  }
}