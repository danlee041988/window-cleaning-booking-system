import { supabase, createAuditLog } from './supabase'

export class CustomerService {
  // Get all customers with optional filtering
  static async getCustomers({ 
    status = null, 
    search = '', 
    limit = 50, 
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = {}) {
    try {
      let query = supabase
        .from('customers')
        .select(`
          *,
          bookings:bookings(count),
          latest_booking:bookings(created_at, status, total_price)
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1)

      // Apply status filter
      if (status) {
        query = query.eq('status', status)
      }

      // Apply search filter
      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,postcode.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      // Process the data to get latest booking info
      const processedData = data?.map(customer => ({
        ...customer,
        booking_count: customer.bookings?.[0]?.count || 0,
        latest_booking: customer.latest_booking?.[0] || null
      }))

      return { 
        customers: processedData || [], 
        total: count || 0,
        error: null 
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      return { customers: [], total: 0, error }
    }
  }

  // Get customer by ID with full details
  static async getCustomerById(id) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          bookings(*),
          customer_notes(*),
          assigned_staff:staff(full_name, email)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return { customer: data, error: null }
    } catch (error) {
      console.error('Error fetching customer:', error)
      return { customer: null, error }
    }
  }

  // Create new customer
  static async createCustomer(customerData) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single()

      if (error) throw error

      // Create audit log
      await createAuditLog('customer_created', 'customers', data.id, null, customerData)

      return { customer: data, error: null }
    } catch (error) {
      console.error('Error creating customer:', error)
      return { customer: null, error }
    }
  }

  // Update customer
  static async updateCustomer(id, updates) {
    try {
      // Get current data for audit log
      const { data: currentData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      // Update the customer
      const { data, error } = await supabase
        .from('customers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Create audit log
      await createAuditLog('customer_updated', 'customers', id, currentData, updates)

      return { customer: data, error: null }
    } catch (error) {
      console.error('Error updating customer:', error)
      return { customer: null, error }
    }
  }

  // Update customer status
  static async updateCustomerStatus(id, newStatus) {
    try {
      const updates = {
        status: newStatus,
        last_contact_date: new Date().toISOString()
      }

      // Set next follow-up date based on status
      switch (newStatus) {
        case 'contacted':
          updates.next_follow_up_date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
          break
        case 'quoted':
          updates.next_follow_up_date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week
          break
        default:
          updates.next_follow_up_date = null
      }

      return await this.updateCustomer(id, updates)
    } catch (error) {
      console.error('Error updating customer status:', error)
      return { customer: null, error }
    }
  }

  // Add note to customer
  static async addCustomerNote(customerId, noteData) {
    try {
      const { data, error } = await supabase
        .from('customer_notes')
        .insert([{
          customer_id: customerId,
          ...noteData
        }])
        .select(`
          *,
          staff:staff(full_name)
        `)
        .single()

      if (error) throw error

      // Create audit log
      await createAuditLog('note_added', 'customer_notes', data.id, null, noteData)

      return { note: data, error: null }
    } catch (error) {
      console.error('Error adding customer note:', error)
      return { note: null, error }
    }
  }

  // Get customer notes
  static async getCustomerNotes(customerId) {
    try {
      const { data, error } = await supabase
        .from('customer_notes')
        .select(`
          *,
          staff:staff(full_name)
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { notes: data || [], error: null }
    } catch (error) {
      console.error('Error fetching customer notes:', error)
      return { notes: [], error }
    }
  }

  // Get customers requiring follow-up
  static async getFollowUpCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          latest_booking:bookings(status, created_at)
        `)
        .not('next_follow_up_date', 'is', null)
        .lte('next_follow_up_date', new Date().toISOString())
        .eq('is_active', true)
        .order('next_follow_up_date', { ascending: true })

      if (error) throw error
      return { customers: data || [], error: null }
    } catch (error) {
      console.error('Error fetching follow-up customers:', error)
      return { customers: [], error }
    }
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const [
        { count: totalCustomers },
        { count: newCustomers },
        { count: activeBookings },
        { count: pendingFollowUps }
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending', 'confirmed']),
        supabase.from('customers').select('*', { count: 'exact', head: true })
          .not('next_follow_up_date', 'is', null)
          .lte('next_follow_up_date', new Date().toISOString())
      ])

      // Get recent customers (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { data: recentCustomers } = await supabase
        .from('customers')
        .select('*')
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: false })
        .limit(5)

      // Get revenue this month (from completed bookings)
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { data: monthlyRevenue } = await supabase
        .from('bookings')
        .select('total_price')
        .eq('status', 'completed')
        .gte('created_at', startOfMonth)

      const totalRevenue = monthlyRevenue?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

      return {
        stats: {
          totalCustomers: totalCustomers || 0,
          newCustomers: newCustomers || 0,
          activeBookings: activeBookings || 0,
          pendingFollowUps: pendingFollowUps || 0,
          monthlyRevenue: totalRevenue,
          recentCustomers: recentCustomers || []
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return { stats: null, error }
    }
  }

  // Search customers
  static async searchCustomers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, full_name, email, phone, postcode, status')
        .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,postcode.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) throw error
      return { customers: data || [], error: null }
    } catch (error) {
      console.error('Error searching customers:', error)
      return { customers: [], error }
    }
  }

  // Get customer status counts for filtering
  static async getStatusCounts() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('status')

      if (error) throw error

      const counts = data?.reduce((acc, customer) => {
        acc[customer.status] = (acc[customer.status] || 0) + 1
        return acc
      }, {}) || {}

      return { counts, error: null }
    } catch (error) {
      console.error('Error fetching status counts:', error)
      return { counts: {}, error }
    }
  }
}