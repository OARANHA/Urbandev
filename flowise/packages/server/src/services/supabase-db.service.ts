import { createClientForServer } from '../lib/supabase'

export interface UserProfile {
  id: string
  email: string
  name?: string
  avatar?: string
  provider?: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications_enabled: boolean
  email_notifications: boolean
  created_at: string
  updated_at: string
}

export class SupabaseDBService {
  private supabase = createClientForServer()

  // User profile operations
  async createUserProfile(userData: {
    id: string
    email: string
    name?: string
    avatar?: string
    provider?: string
  }): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert([userData])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`)
    }

    return data
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // User not found
      }
      throw new Error(`Failed to get user profile: ${error.message}`)
    }

    return data
  }

  async updateUserProfile(userId: string, updates: {
    name?: string
    avatar?: string
  }): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  }

  async deleteUserProfile(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to delete user profile: ${error.message}`)
    }
  }

  // User settings operations
  async createUserSettings(userId: string): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .insert([{
        user_id: userId,
        theme: 'system',
        language: 'en',
        notifications_enabled: true,
        email_notifications: true,
      }])
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create user settings: ${error.message}`)
    }

    return data
  }

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Settings not found
      }
      throw new Error(`Failed to get user settings: ${error.message}`)
    }

    return data
  }

  async updateUserSettings(userId: string, updates: {
    theme?: 'light' | 'dark' | 'system'
    language?: string
    notifications_enabled?: boolean
    email_notifications?: boolean
  }): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user settings: ${error.message}`)
    }

    return data
  }

  // User activity tracking
  async trackUserActivity(userId: string, activity: {
    action: string
    resource_type?: string
    resource_id?: string
    metadata?: Record<string, any>
  }): Promise<void> {
    const { error } = await this.supabase
      .from('user_activity')
      .insert([{
        user_id: userId,
        action: activity.action,
        resource_type: activity.resource_type,
        resource_id: activity.resource_id,
        metadata: activity.metadata,
      }])

    if (error) {
      console.error('Failed to track user activity:', error)
      // Don't throw error for tracking failures
    }
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to get user activity: ${error.message}`)
    }

    return data || []
  }

  // User preferences
  async getUserPreferences(userId: string): Promise<Record<string, any>> {
    const { data, error } = await this.supabase
      .from('user_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return {} // No preferences found
      }
      throw new Error(`Failed to get user preferences: ${error.message}`)
    }

    return data?.preferences || {}
  }

  async updateUserPreferences(userId: string, preferences: Record<string, any>): Promise<void> {
    const { error } = await this.supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preferences,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      throw new Error(`Failed to update user preferences: ${error.message}`)
    }
  }
}