-- 报告下载追踪表
-- 用于记录所有PDF报告的下载情况，便于后台统计

CREATE TABLE IF NOT EXISTS report_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    report_type VARCHAR(10) NOT NULL CHECK (report_type IN ('MAP', 'COMP', 'PROD', 'REG', 'STAT')),
    target VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}',
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_report_downloads_report_id ON report_downloads(report_id);
CREATE INDEX IF NOT EXISTS idx_report_downloads_user_id ON report_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_report_downloads_report_type ON report_downloads(report_type);
CREATE INDEX IF NOT EXISTS idx_report_downloads_downloaded_at ON report_downloads(downloaded_at);
CREATE INDEX IF NOT EXISTS idx_report_downloads_created_at ON report_downloads(created_at);

-- 创建按月统计的视图
CREATE OR REPLACE VIEW report_downloads_monthly_stats AS
SELECT
    DATE_TRUNC('month', downloaded_at) AS month,
    report_type,
    COUNT(*) AS download_count
FROM report_downloads
GROUP BY DATE_TRUNC('month', downloaded_at), report_type
ORDER BY month DESC, report_type;

-- 创建按类型统计的视图
CREATE OR REPLACE VIEW report_downloads_type_stats AS
SELECT
    report_type,
    COUNT(*) AS total_downloads,
    COUNT(DISTINCT user_id) AS unique_users,
    MIN(downloaded_at) AS first_download,
    MAX(downloaded_at) AS last_download
FROM report_downloads
GROUP BY report_type;

-- 启用RLS
ALTER TABLE report_downloads ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许已认证用户插入自己的下载记录
CREATE POLICY "Users can insert own downloads" ON report_downloads
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- 创建策略：允许管理员查看所有下载记录
CREATE POLICY "Admins can view all downloads" ON report_downloads
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid() AND role = 'admin'
    ));

-- 创建策略：允许用户查看自己的下载记录
CREATE POLICY "Users can view own downloads" ON report_downloads
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

COMMENT ON TABLE report_downloads IS 'Tracks all PDF report downloads for analytics';
COMMENT ON COLUMN report_downloads.report_id IS 'Unique report ID in format MDL-TYPE-YYYYMMDD-XXXX';
COMMENT ON COLUMN report_downloads.report_type IS 'Report type: MAP, COMP, PROD, REG, STAT';
COMMENT ON COLUMN report_downloads.target IS 'Target market, company, product, or agency name';
COMMENT ON COLUMN report_downloads.metadata IS 'Additional metadata about the report';
