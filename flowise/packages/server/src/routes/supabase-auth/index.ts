import { Router } from 'express'
import { supabaseAuthController } from '../../controllers/supabase-auth'

const router = Router()

// Sign up
router.post('/signup', supabaseAuthController.signUp)

// Sign in
router.post('/signin', supabaseAuthController.signIn)

// Sign in with OAuth
router.get('/oauth/:provider', supabaseAuthController.signInWithOAuth)

// OAuth callback
router.get('/oauth/callback', supabaseAuthController.oauthCallback)

// Sign out
router.post('/signout', supabaseAuthController.signOut)

// Get current user
router.get('/user', supabaseAuthController.getCurrentUser)

// Get session
router.get('/session', supabaseAuthController.getSession)

// Update profile
router.put('/profile', supabaseAuthController.updateProfile)

// Reset password
router.post('/reset-password', supabaseAuthController.resetPassword)

// Update password
router.put('/password', supabaseAuthController.updatePassword)

export default router