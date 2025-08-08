import { createClient } from '../lib/supabase'
import { User } from '@supabase/supabase-js'

export interface SupabaseUser {
  id: string
  email: string
  name?: string
  avatar?: string
  provider?: string
}

export class SupabaseAuthService {
  private supabase = createClient()

  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async signInWithOAuth(provider: 'google' | 'github' | 'azure') {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  async getCurrentUser(): Promise<SupabaseUser | null> {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
      avatar: user.user_metadata?.avatar_url,
      provider: user.app_metadata?.provider,
    }
  }

  async getSession() {
    const { data: { session }, error } = await this.supabase.auth.getSession()
    
    if (error) {
      throw new Error(error.message)
    }

    return session
  }

  async updateUserProfile(updates: {
    name?: string
    avatar?: string
  }) {
    const { data, error } = await this.supabase.auth.updateUser({
      data: updates,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({
      password,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback)
  }
}