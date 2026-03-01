-- Authentication and User Management Schema
-- 用户认证和权限管理系统数据库结构

-- User roles enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('guest', 'user', 'vip');
    END IF;
END $$;

-- User subscription status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('inactive', 'active', 'expired', 'cancelled');
    END IF;
END $$;

-- Users table extending Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'guest',
    company_name TEXT,
    job_title TEXT,
    phone TEXT,
    country TEXT,
    bio TEXT,
    subscription_status subscription_status DEFAULT 'inactive',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS public.permissions (
    id SERIAL PRIMARY KEY,
    role user_role NOT NULL,
    resource TEXT NOT NULL, -- e.g., 'companies', 'market_access', 'regulations'
    action TEXT NOT NULL, -- e.g., 'read', 'write', 'download'
    allowed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, resource, action)
);

-- Social login connections
CREATE TABLE IF NOT EXISTS public.user_social_accounts (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL, -- 'google', 'linkedin', 'github'
    provider_account_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(provider, provider_account_id)
);

-- Login history for security
CREATE TABLE IF NOT EXISTS public.login_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT true
);

-- Download history for tracking
CREATE TABLE IF NOT EXISTS public.download_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resource_type TEXT NOT NULL, -- 'market_access_report', 'regulation_document'
    resource_id TEXT,
    file_name TEXT,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for permissions (readable by all authenticated users)
CREATE POLICY "Permissions are viewable by authenticated users"
    ON public.permissions FOR SELECT
    TO authenticated
    USING (true);

-- RLS Policies for social accounts
CREATE POLICY "Users can view own social accounts"
    ON public.user_social_accounts FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policies for login history
CREATE POLICY "Users can view own login history"
    ON public.login_history FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policies for download history
CREATE POLICY "Users can view own download history"
    ON public.download_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own download history"
    ON public.download_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Insert default permissions
INSERT INTO public.permissions (role, resource, action, allowed) VALUES
-- Guest permissions (limited access)
('guest', 'companies', 'read', true),
('guest', 'companies', 'search', true),
('guest', 'market_access', 'read', true),
('guest', 'regulations', 'read', true),
('guest', 'market_access', 'download', false),
('guest', 'regulations', 'download', false),

-- Regular user permissions
('user', 'companies', 'read', true),
('user', 'companies', 'search', true),
('user', 'market_access', 'read', true),
('user', 'regulations', 'read', true),
('user', 'market_access', 'download', true),
('user', 'regulations', 'download', true),
('user', 'companies', 'export', false),

-- VIP permissions (full access)
('vip', 'companies', 'read', true),
('vip', 'companies', 'search', true),
('vip', 'market_access', 'read', true),
('vip', 'regulations', 'read', true),
('vip', 'market_access', 'download', true),
('vip', 'regulations', 'download', true),
('vip', 'companies', 'export', true),
('vip', 'analytics', 'read', true),
('vip', 'api', 'access', true)
ON CONFLICT (role, resource, action) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_permissions_role ON public.permissions(role);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON public.user_social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON public.login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_download_history_user ON public.download_history(user_id);
