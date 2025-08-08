# Supabase Integration for Flowise UrbanDev

This document provides instructions for integrating Supabase with the Flowise UrbanDev project.

## Overview

The Supabase integration provides:
- User authentication and authorization
- User profile management
- User settings and preferences
- Activity tracking
- Database storage for Flowise projects and executions
- File storage capabilities

## Prerequisites

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your Supabase URL and keys from the project settings

## Configuration

### 1. Environment Variables

Copy the `.env.example` file to `.env` and configure the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application URL for OAuth redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Schema

Run the `supabase-schema.sql` script in your Supabase project SQL editor to create the necessary tables:

```bash
# Copy the contents of supabase-schema.sql and run in Supabase SQL editor
```

The schema includes:
- `user_profiles` - User information
- `user_settings` - User preferences and settings
- `user_activity` - User activity tracking
- `user_preferences` - Custom user preferences
- `flowise_projects` - Flowise project data
- `flowise_executions` - Execution history
- `flowise_api_keys` - API key management
- Storage bucket for file uploads

### 3. Supabase Auth Configuration

Configure authentication providers in your Supabase project:

1. Go to Authentication > Providers
2. Enable the providers you want to use:
   - Email
   - Google
   - GitHub
   - Azure (Microsoft)
3. Configure redirect URLs:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## API Endpoints

### Authentication Routes

All authentication routes are available under `/api/v1/supabase-auth/`:

- `POST /signup` - Register new user
- `POST /signin` - Login with email/password
- `GET /oauth/:provider` - Initiate OAuth login
- `GET /oauth/callback` - OAuth callback handler
- `POST /signout` - Logout user
- `GET /user` - Get current user
- `GET /session` - Get current session
- `PUT /profile` - Update user profile
- `POST /reset-password` - Request password reset
- `PUT /password` - Update password

### Database Routes

All database routes are available under `/api/v1/supabase-db/` and require authentication:

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /settings` - Get user settings
- `PUT /settings` - Update user settings
- `GET /activity` - Get user activity
- `POST /activity` - Track user activity
- `GET /preferences` - Get user preferences
- `PUT /preferences` - Update user preferences

## Usage Examples

### User Registration

```javascript
// Using fetch API
const response = await fetch('/api/v1/supabase-auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure-password',
    name: 'John Doe'
  })
});

const data = await response.json();
```

### User Login

```javascript
// Using fetch API
const response = await fetch('/api/v1/supabase-auth/signin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secure-password'
  })
});

const data = await response.json();
```

### Get User Profile

```javascript
// Using fetch API (requires authentication)
const response = await fetch('/api/v1/supabase-db/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  }
});

const data = await response.json();
```

### OAuth Login

```javascript
// Redirect to OAuth provider
window.location.href = '/api/v1/supabase-auth/oauth/google';
```

## Frontend Integration

### React Component Example

```jsx
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function AuthComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Handle sign up
  const handleSignUp = async (email, password, name) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/supabase-auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await response.json();
      console.log('Sign up successful:', data);
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sign in
  const handleSignIn = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/supabase-auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle OAuth sign in
  const handleOAuthSignIn = (provider) => {
    window.location.href = `/api/v1/supabase-auth/oauth/${provider}`;
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await fetch('/api/v1/supabase-auth/signout', {
        method: 'POST',
      });
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.name || user.email}!</h2>
          <button onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <div>
          <h2>Sign In</h2>
          <button onClick={() => handleOAuthSignIn('google')}>
            Sign in with Google
          </button>
          <button onClick={() => handleOAuthSignIn('github')}>
            Sign in with GitHub
          </button>
          {/* Email/password form */}
        </div>
      )}
    </div>
  );
}
```

## Security Features

### Row Level Security (RLS)

The database schema includes RLS policies to ensure:
- Users can only access their own data
- Public projects are visible to everyone
- API keys are properly secured

### Authentication Middleware

The integration includes middleware for:
- Token validation
- User authentication
- Optional authentication for public routes

### Data Encryption

- User passwords are handled by Supabase Auth
- Sensitive data is encrypted at rest
- API keys are hashed before storage

## Testing

### Test Authentication

1. Start the development server:
```bash
npm run dev
```

2. Test the authentication endpoints:
```bash
# Sign up
curl -X POST http://localhost:3000/api/v1/supabase-auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Sign in
curl -X POST http://localhost:3000/api/v1/supabase-auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Database Operations

1. Sign in to get an access token
2. Use the token to test database endpoints:
```bash
# Get user profile
curl -X GET http://localhost:3000/api/v1/supabase-db/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Supabase project has the correct CORS configuration
2. **Authentication Errors**: Check that your environment variables are correctly set
3. **Database Connection**: Verify your Supabase connection string and credentials
4. **Missing Tables**: Run the schema SQL script in your Supabase project

### Debug Mode

Enable debug mode by setting:
```bash
DEBUG=true
```

This will provide detailed logging for authentication and database operations.

## Contributing

When contributing to the Supabase integration:

1. Follow the existing code style
2. Add proper error handling
3. Include tests for new features
4. Update documentation as needed

## License

This integration is part of the Flowise UrbanDev project and follows the same license terms.