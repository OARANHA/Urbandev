import { Router } from 'express'
import { supabaseDBController } from '../../controllers/supabase-db'
import { supabaseAuthMiddleware } from '../../middlewares/supabase-auth'

const router = Router()

// Apply authentication middleware to all routes
router.use(supabaseAuthMiddleware)

// User profile routes
router.get('/profile', supabaseDBController.getUserProfile)
router.put('/profile', supabaseDBController.updateUserProfile)

// User settings routes
router.get('/settings', supabaseDBController.getUserSettings)
router.put('/settings', supabaseDBController.updateUserSettings)

// User activity routes
router.get('/activity', supabaseDBController.getUserActivity)
router.post('/activity', supabaseDBController.trackUserActivity)

// User preferences routes
router.get('/preferences', supabaseDBController.getUserPreferences)
router.put('/preferences', supabaseDBController.updateUserPreferences)

export default router