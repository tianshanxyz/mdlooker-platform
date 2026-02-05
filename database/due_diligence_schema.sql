-- Due Diligence Report Schema
-- 公司尽职调查报告数据库结构

-- Due diligence reports table
CREATE TABLE IF NOT EXISTS public.due_diligence_reports (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES public.companies(id) ON DELETE CASCADE,
    generated_by UUID REFERENCES auth.users(id),
    report_type TEXT NOT NULL CHECK (report_type IN ('basic', 'standard', 'comprehensive')),
    report_data JSONB NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    is_downloadable BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Report access log
CREATE TABLE IF NOT EXISTS public.report_access_log (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES public.due_diligence_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download')),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);

-- Enable RLS
ALTER TABLE public.due_diligence_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_access_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for due_diligence_reports
-- Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON public.due_diligence_reports FOR SELECT
    TO authenticated
    USING (generated_by = auth.uid());

-- Users can create reports
CREATE POLICY "Users can create reports"
    ON public.due_diligence_reports FOR INSERT
    TO authenticated
    WITH CHECK (generated_by = auth.uid());

-- RLS Policies for report_access_log
CREATE POLICY "Users can view own access logs"
    ON public.report_access_log FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create access logs"
    ON public.report_access_log FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Function to increment download count
CREATE OR REPLACE FUNCTION public.increment_report_download()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.due_diligence_reports
    SET download_count = download_count + 1
    WHERE id = NEW.report_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for download count
DROP TRIGGER IF EXISTS on_report_download ON public.report_access_log;
CREATE TRIGGER on_report_download
    AFTER INSERT ON public.report_access_log
    FOR EACH ROW
    WHEN (NEW.access_type = 'download')
    EXECUTE FUNCTION public.increment_report_download();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dd_reports_company ON public.due_diligence_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_dd_reports_user ON public.due_diligence_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_dd_reports_type ON public.due_diligence_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_report_access_report ON public.report_access_log(report_id);
CREATE INDEX IF NOT EXISTS idx_report_access_user ON public.report_access_log(user_id);
