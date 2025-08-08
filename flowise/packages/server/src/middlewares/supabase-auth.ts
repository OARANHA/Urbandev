import { Request, Response, NextFunction } from 'express'
import { createClient } from '../lib/supabase'

interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name?: string
    avatar?: string
    provider?: string
  }
}

export const supabaseAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      })
    }

    // Attach user information to the request
    req.user = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name,
      avatar: user.user_metadata?.avatar_url,
      provider: user.app_metadata?.provider,
    }

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Authentication check failed'
    })
  }
}

export const optionalSupabaseAuthMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Attach user information to the request if available
      req.user = {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
        avatar: user.user_metadata?.avatar_url,
        provider: user.app_metadata?.provider,
      }
    }

    next()
  } catch (error) {
    console.error('Optional auth middleware error:', error)
    // Continue without authentication
    next()
  }
}