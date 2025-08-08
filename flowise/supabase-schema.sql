-- ===========================================
-- SUPABASE DATABASE SCHEMA FOR FLOWISE URBANDEV
-- ===========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- USER PROFILES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    avatar TEXT,
    provider TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);

-- ===========================================
-- USER SETTINGS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'en',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- ===========================================
-- USER ACTIVITY TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON public.user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_action ON public.user_activity(action);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON public.user_activity(created_at);

-- ===========================================
-- USER PREFERENCES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ===========================================
-- FLOWISE PROJECTS TABLE (Integration with Flowise)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.flowise_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    flow_data JSONB,
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    category TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flowise_projects_user_id ON public.flowise_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_flowise_projects_category ON public.flowise_projects(category);
CREATE INDEX IF NOT EXISTS idx_flowise_projects_created_at ON public.flowise_projects(created_at);

-- ===========================================
-- FLOWISE EXECUTIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.flowise_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.flowise_projects(id) ON DELETE SET NULL,
    session_id TEXT,
    input_data JSONB,
    output_data JSONB,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    error_message TEXT,
    execution_time INTEGER, -- in milliseconds
    tokens_used INTEGER,
    cost DECIMAL(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flowise_executions_user_id ON public.flowise_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_flowise_executions_project_id ON public.flowise_executions(project_id);
CREATE INDEX IF NOT EXISTS idx_flowise_executions_status ON public.flowise_executions(status);
CREATE INDEX IF NOT EXISTS idx_flowise_executions_created_at ON public.flowise_executions(created_at);

-- ===========================================
-- FLOWISE API KEYS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.flowise_api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flowise_api_keys_user_id ON public.flowise_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_flowise_api_keys_key_hash ON public.flowise_api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_flowise_api_keys_is_active ON public.flowise_api_keys(is_active);

-- ===========================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- ===========================================

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowise_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowise_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flowise_api_keys ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for user_activity
CREATE POLICY "Users can view own activity" ON public.user_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.user_activity
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for flowise_projects
CREATE POLICY "Users can view own projects" ON public.flowise_projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.flowise_projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.flowise_projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.flowise_projects
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view public projects" ON public.flowise_projects
    FOR SELECT USING (is_public = true);

-- Create policies for flowise_executions
CREATE POLICY "Users can view own executions" ON public.flowise_executions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own executions" ON public.flowise_executions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for flowise_api_keys
CREATE POLICY "Users can view own api keys" ON public.flowise_api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON public.flowise_api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys" ON public.flowise_api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" ON public.flowise_api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- TRIGGERS FOR UPDATED_AT
-- ===========================================

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_flowise_projects_updated_at
    BEFORE UPDATE ON public.flowise_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_flowise_executions_updated_at
    BEFORE UPDATE ON public.flowise_executions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_flowise_api_keys_updated_at
    BEFORE UPDATE ON public.flowise_api_keys
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ===========================================
-- CREATE STORAGE BUCKET FOR FILES
-- ===========================================
INSERT INTO public.storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'flowise-files',
    'flowise-files',
    false,
    52428800, -- 50MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/json']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can view own files" ON public.storage.objects
    FOR SELECT USING (auth.uid() = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own files" ON public.storage.objects
    FOR INSERT WITH CHECK (auth.uid() = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own files" ON public.storage.objects
    FOR UPDATE USING (auth.uid() = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files" ON public.storage.objects
    FOR DELETE USING (auth.uid() = (storage.foldername(name))[1]);

-- ===========================================
-- GRANT PERMISSIONS
-- ===========================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.user_activity TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;
GRANT ALL ON public.flowise_projects TO authenticated;
GRANT ALL ON public.flowise_executions TO authenticated;
GRANT ALL ON public.flowise_api_keys TO authenticated;
GRANT ALL ON public.storage.buckets TO authenticated;
GRANT ALL ON public.storage.objects TO authenticated;