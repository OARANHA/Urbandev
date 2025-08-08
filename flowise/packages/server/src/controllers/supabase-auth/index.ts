import { Request, Response } from 'express'
import { SupabaseAuthService } from '../../services/supabase-auth.service'

const supabaseAuthService = new SupabaseAuthService()

export const supabaseAuthController = {
  // Sign up
  async signUp(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      const result = await supabaseAuthService.signUp(email, password, name)
      
      res.status(201).json({
        message: 'User created successfully',
        user: result.user,
        session: result.session,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  // Sign in
  async signIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' })
      }

      const result = await supabaseAuthService.signIn(email, password)
      
      res.json({
        message: 'Signed in successfully',
        user: result.user,
        session: result.session,
      })
    } catch (error: any) {
      res.status(401).json({ error: error.message })
    }
  },

  // Sign in with OAuth
  async signInWithOAuth(req: Request, res: Response) {
    try {
      const { provider } = req.params
      
      if (!provider || !['google', 'github', 'azure'].includes(provider)) {
        return res.status(400).json({ error: 'Invalid provider' })
      }

      const result = await supabaseAuthService.signInWithOAuth(provider as any)
      
      res.json({
        message: 'OAuth sign in initiated',
        url: result.url,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  // Sign out
  async signOut(req: Request, res: Response) {
    try {
      await supabaseAuthService.signOut()
      
      res.json({ message: 'Signed out successfully' })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  // Get current user
  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = await supabaseAuthService.getCurrentUser()
      
      if (!user) {
        return res.status(401).json({ error: 'No authenticated user' })
      }

      res.json({ user })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  // Get session
  async getSession(req: Request, res: Response) {
    try {
      const session = await supabaseAuthService.getSession()
      
      res.json({ session })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const { name, avatar } = req.body
      const result = await supabaseAuthService.updateUserProfile({ name, avatar })
      
      res.json({
        message: 'Profile updated successfully',
        user: result.user,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  // Reset password
  async resetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' })
      }

      await supabaseAuthService.resetPassword(email)
      
      res.json({ message: 'Password reset email sent' })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  // Update password
  async updatePassword(req: Request, res: Response) {
    try {
      const { password } = req.body
      
      if (!password) {
        return res.status(400).json({ error: 'Password is required' })
      }

      await supabaseAuthService.updatePassword(password)
      
      res.json({ message: 'Password updated successfully' })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  // OAuth callback
  async oauthCallback(req: Request, res: Response) {
    try {
      const { code } = req.query
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' })
      }

      // This would typically be handled by the Supabase client-side SDK
      // For server-side handling, you would need to exchange the code for tokens
      res.redirect('/auth/success')
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
}