-- Mobile App Schema Extensions
-- 移动端APP数据库扩展

-- User favorites table (用户收藏)
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- User search history table (用户搜索历史)
CREATE TABLE IF NOT EXISTS public.user_search_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User viewed companies table (用户浏览记录)
CREATE TABLE IF NOT EXISTS public.user_viewed (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- User devices table (用户设备，用于推送)
CREATE TABLE IF NOT EXISTS public.user_devices (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_type TEXT NOT NULL, -- 'ios', 'android', 'web'
    push_token TEXT,
    app_version TEXT,
    os_version TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, device_id)
);

-- User achievements table (用户成就)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Achievements definition table (成就定义)
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    icon TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_zh TEXT NOT NULL,
    description_en TEXT NOT NULL,
    condition_type TEXT NOT NULL, -- 'search_count', 'favorite_count', 'download_count', 'streak_days'
    condition_value INTEGER NOT NULL,
    reward_exp INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User daily tasks table (每日任务)
CREATE TABLE IF NOT EXISTS public.user_daily_tasks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    task_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(user_id, task_id, task_date)
);

-- Daily tasks definition table (每日任务定义)
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id TEXT PRIMARY KEY,
    icon TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_zh TEXT NOT NULL,
    description_en TEXT NOT NULL,
    reward_exp INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User favorites policies
CREATE POLICY "Users can view own favorites"
    ON public.user_favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
    ON public.user_favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
    ON public.user_favorites FOR DELETE
    USING (auth.uid() = user_id);

-- User search history policies
CREATE POLICY "Users can view own search history"
    ON public.user_search_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history"
    ON public.user_search_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- User viewed policies
CREATE POLICY "Users can view own viewed"
    ON public.user_viewed FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own viewed"
    ON public.user_viewed FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own viewed"
    ON public.user_viewed FOR UPDATE
    USING (auth.uid() = user_id);

-- User devices policies
CREATE POLICY "Users can view own devices"
    ON public.user_devices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
    ON public.user_devices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
    ON public.user_devices FOR UPDATE
    USING (auth.uid() = user_id);

-- User achievements policies
CREATE POLICY "Users can view own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

-- User daily tasks policies
CREATE POLICY "Users can view own daily tasks"
    ON public.user_daily_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tasks"
    ON public.user_daily_tasks FOR UPDATE
    USING (auth.uid() = user_id);

-- Insert default achievements
INSERT INTO public.achievements (id, icon, name_zh, name_en, description_zh, description_en, condition_type, condition_value, reward_exp) VALUES
('first_search', '🔍', '初识合规', 'First Search', '完成首次搜索', 'Complete your first search', 'search_count', 1, 10),
('search_10', '🔍', '搜索新手', 'Search Novice', '完成10次搜索', 'Complete 10 searches', 'search_count', 10, 20),
('search_100', '🔍', '搜索达人', 'Search Expert', '完成100次搜索', 'Complete 100 searches', 'search_count', 100, 50),
('collector_5', '❤️', '收藏家', 'Collector', '收藏5家企业', 'Save 5 companies', 'favorite_count', 5, 20),
('collector_20', '❤️', '收藏大师', 'Master Collector', '收藏20家企业', 'Save 20 companies', 'favorite_count', 20, 50),
('collector_50', '❤️', '收藏狂魔', 'Collection Maniac', '收藏50家企业', 'Save 50 companies', 'favorite_count', 50, 100),
('download_10', '📥', '下载达人', 'Downloader', '下载10份报告', 'Download 10 reports', 'download_count', 10, 30),
('download_50', '📥', '下载专家', 'Download Expert', '下载50份报告', 'Download 50 reports', 'download_count', 50, 80),
('streak_7', '📅', '连续一周', 'Week Streak', '连续7天使用APP', 'Use app for 7 consecutive days', 'streak_days', 7, 50),
('streak_30', '📅', '连续一月', 'Month Streak', '连续30天使用APP', 'Use app for 30 consecutive days', 'streak_days', 30, 200)
ON CONFLICT (id) DO NOTHING;

-- Insert default daily tasks
INSERT INTO public.daily_tasks (id, icon, name_zh, name_en, description_zh, description_en, reward_exp) VALUES
('daily_search', '🔍', '每日搜索', 'Daily Search', '完成1次搜索', 'Complete 1 search', 10),
('daily_favorite', '❤️', '每日收藏', 'Daily Favorite', '收藏1家企业', 'Save 1 company', 20),
('daily_share', '📤', '每日分享', 'Daily Share', '分享1份报告', 'Share 1 report', 30),
('daily_view', '👁️', '每日浏览', 'Daily View', '浏览3家企业详情', 'View 3 company details', 15)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_company_id ON public.user_favorites(company_id);
CREATE INDEX IF NOT EXISTS idx_user_search_history_user_id ON public.user_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_viewed_user_id ON public.user_viewed(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user_id ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_user_id ON public.user_daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_date ON public.user_daily_tasks(task_date);

-- Function to update user viewed
CREATE OR REPLACE FUNCTION public.track_company_view(
    p_user_id UUID,
    p_company_id UUID
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_viewed (user_id, company_id, view_count, last_viewed_at)
    VALUES (p_user_id, p_company_id, 1, NOW())
    ON CONFLICT (user_id, company_id)
    DO UPDATE SET
        view_count = user_viewed.view_count + 1,
        last_viewed_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_user_achievements(p_user_id UUID)
RETURNS TABLE(achievement_id TEXT, name_zh TEXT, name_en TEXT) AS $$
DECLARE
    v_search_count INTEGER;
    v_favorite_count INTEGER;
    v_download_count INTEGER;
    v_streak_days INTEGER;
    v_achievement RECORD;
BEGIN
    -- Get user stats
    SELECT COUNT(*) INTO v_search_count
    FROM public.user_search_history
    WHERE user_id = p_user_id;
    
    SELECT COUNT(*) INTO v_favorite_count
    FROM public.user_favorites
    WHERE user_id = p_user_id;
    
    SELECT COUNT(*) INTO v_download_count
    FROM public.download_history
    WHERE user_id = p_user_id;
    
    -- Calculate streak (simplified)
    SELECT COUNT(DISTINCT DATE(created_at)) INTO v_streak_days
    FROM public.user_search_history
    WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days';
    
    -- Check each achievement
    FOR v_achievement IN
        SELECT a.id, a.name_zh, a.name_en, a.condition_type, a.condition_value
        FROM public.achievements a
        WHERE NOT EXISTS (
            SELECT 1 FROM public.user_achievements ua
            WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
        )
    LOOP
        IF (v_achievement.condition_type = 'search_count' AND v_search_count >= v_achievement.condition_value)
           OR (v_achievement.condition_type = 'favorite_count' AND v_favorite_count >= v_achievement.condition_value)
           OR (v_achievement.condition_type = 'download_count' AND v_download_count >= v_achievement.condition_value)
           OR (v_achievement.condition_type = 'streak_days' AND v_streak_days >= v_achievement.condition_value)
        THEN
            -- Award achievement
            INSERT INTO public.user_achievements (user_id, achievement_id)
            VALUES (p_user_id, v_achievement.id);
            
            achievement_id := v_achievement.id;
            name_zh := v_achievement.name_zh;
            name_en := v_achievement.name_en;
            RETURN NEXT;
        END IF;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
