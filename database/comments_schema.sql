-- Comments System Schema
-- 公司评论系统数据库结构

-- Comments table for company reviews
CREATE TABLE IF NOT EXISTS public.company_comments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    parent_id INTEGER REFERENCES public.company_comments(id) ON DELETE CASCADE,
    is_approved BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comment votes (likes/dislikes)
CREATE TABLE IF NOT EXISTS public.comment_votes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES public.company_comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vote_type SMALLINT CHECK (vote_type IN (-1, 1)), -- -1 for dislike, 1 for like
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, user_id)
);

-- Comment reports (for moderation)
CREATE TABLE IF NOT EXISTS public.comment_reports (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES public.company_comments(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.company_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_comments
-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
    ON public.company_comments FOR SELECT
    USING (is_approved = true AND is_deleted = false);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
    ON public.company_comments FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
    ON public.company_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can delete their own comments (soft delete)
CREATE POLICY "Users can delete own comments"
    ON public.company_comments FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for comment_votes
CREATE POLICY "Anyone can view votes"
    ON public.comment_votes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can vote"
    ON public.comment_votes FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change their vote"
    ON public.comment_votes FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote"
    ON public.comment_votes FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- RLS Policies for comment_reports
CREATE POLICY "Users can create reports"
    ON public.comment_reports FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = reporter_id);

-- Function to update comment votes count
CREATE OR REPLACE FUNCTION public.update_comment_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.company_comments
        SET rating = rating + NEW.vote_type
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.company_comments
        SET rating = rating - OLD.vote_type
        WHERE id = OLD.comment_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.company_comments
        SET rating = rating - OLD.vote_type + NEW.vote_type
        WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for vote count
DROP TRIGGER IF EXISTS on_vote_change ON public.comment_votes;
CREATE TRIGGER on_vote_change
    AFTER INSERT OR UPDATE OR DELETE ON public.comment_votes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comment_vote_count();

-- Function to auto-approve comments from trusted users (optional)
CREATE OR REPLACE FUNCTION public.auto_approve_comment()
RETURNS TRIGGER AS $$
DECLARE
    user_role TEXT;
    user_comment_count INTEGER;
BEGIN
    -- Get user role
    SELECT role INTO user_role
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Get user's approved comment count
    SELECT COUNT(*) INTO user_comment_count
    FROM public.company_comments
    WHERE user_id = NEW.user_id AND is_approved = true;
    
    -- Auto-approve if user is VIP or has 5+ approved comments
    IF user_role = 'vip' OR user_comment_count >= 5 THEN
        NEW.is_approved := true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-approval
DROP TRIGGER IF EXISTS on_comment_created ON public.company_comments;
CREATE TRIGGER on_comment_created
    BEFORE INSERT ON public.company_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_approve_comment();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_company ON public.company_comments(company_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON public.company_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON public.company_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON public.company_comments(is_approved, is_deleted);
CREATE INDEX IF NOT EXISTS idx_votes_comment ON public.comment_votes(comment_id);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.comment_votes(user_id);
