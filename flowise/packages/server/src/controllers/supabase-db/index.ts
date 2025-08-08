import { Request, Response } from 'express'
import { SupabaseDBService } from '../../services/supabase-db.service'
import { supabaseAuthMiddleware, AuthenticatedRequest } from '../../middlewares/supabase-auth'

const supabaseDBService = new SupabaseDBService()

export const supabaseDBController = {
  // Get user profile
  async getUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id
      const profile = await supabaseDBService.getUserProfile(userId)
      
      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' })
      }

      res.json({ profile })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  // Update user profile
  async updateUserProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { name, avatar } = req.body
      
      const profile = await supabaseDBService.updateUserProfile(userId, { name, avatar })
      
      res.json({
        message: 'Profile updated successfully',
        profile,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  // Get user settings
  async getUserSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id
      const settings = await supabaseDBService.getUserSettings(userId)
      
      if (!settings) {
        // Create default settings if not found
        const defaultSettings = await supabaseDBService.createUserSettings(userId)
        return res.json({ settings: defaultSettings })
      }

      res.json({ settings })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  // Update user settings
  async updateUserSettings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { theme, language, notifications_enabled, email_notifications } = req.body
      
      const settings = await supabaseDBService.updateUserSettings(userId, {
        theme,
        language,
        notifications_enabled,
        email_notifications,
      })
      
      res.json({
        message: 'Settings updated successfully',
        settings,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  // Get user activity
  async getUserActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id
      const limit = parseInt(req.query.limit as string) || 50
      
      const activity = await supabaseDBService.getUserActivity(userId, limit)
      
      res.json({ activity })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  // Track user activity
  async trackUserActivity(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { action, resource_type, resource_id, metadata } = req.body
      
      await supabaseDBService.trackUserActivity(userId, {
        action,
        resource_type,
        resource_id,
        metadata,
      })
      
      res.json({ message: 'Activity tracked successfully' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  // Get user preferences
  async getUserPreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id
      const preferences = await supabaseDBService.getUserPreferences(userId)
      
      res.json({ preferences })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },

  // Update user preferences
  async updateUserPreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id
      const { preferences } = req.body
      
      await supabaseDBService.updateUserPreferences(userId, preferences)
      
      res.json({ message: 'Preferences updated successfully' })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  },
}