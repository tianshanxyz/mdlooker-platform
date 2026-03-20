-- 法规动态与推送系统数据库设计
-- Regulation Updates & Notification System

-- ============================================
-- 1. 法规更新表
-- ============================================
CREATE TABLE IF NOT EXISTS regulation_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  country_name TEXT,
  title TEXT NOT NULL,
  title_zh TEXT,
  summary TEXT,
  summary_zh TEXT,
  content TEXT,
  content_zh TEXT,
  product_categories TEXT[],
  affected_products TEXT[],
  importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
  regulation_type TEXT,
  effective_date DATE,
  published_date DATE,
  deadline_date DATE,
  changes_summary TEXT,
  changes_summary_zh TEXT,
  action_required BOOLEAN DEFAULT false,
  source_url TEXT,
  source_organization TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 索引优化
CREATE INDEX idx_regulation_country ON regulation_updates(country);
CREATE INDEX idx_regulation_importance ON regulation_updates(importance);
CREATE INDEX idx_regulation_effective_date ON regulation_updates(effective_date);
CREATE INDEX idx_regulation_created_at ON regulation_updates(created_at DESC);

-- ============================================
-- 2. 用户订阅表
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_id UUID,
  countries TEXT[],
  product_categories TEXT[],
  notification_types TEXT[] DEFAULT ARRAY['email'],
  frequency TEXT DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
  importance_filter TEXT[] DEFAULT ARRAY['high', 'critical'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_notification_sent TIMESTAMP WITH TIME ZONE
);

-- 索引
CREATE INDEX idx_subscription_email ON user_subscriptions(user_email);
CREATE INDEX idx_subscription_active ON user_subscriptions(is_active);

-- ============================================
-- 3. 推送通知记录表
-- ============================================
CREATE TABLE IF NOT EXISTS push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  regulation_id UUID REFERENCES regulation_updates(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('email', 'sms', 'in_app', 'wechat')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'opened', 'clicked')),
  subject TEXT,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 索引
CREATE INDEX idx_notification_user ON push_notifications(user_email);
CREATE INDEX idx_notification_status ON push_notifications(status);
CREATE INDEX idx_notification_created_at ON push_notifications(created_at DESC);

-- ============================================
-- 4. 插入示例数据
-- ============================================

-- 法规更新示例
INSERT INTO regulation_updates (
  country, country_name, title, title_zh, summary, summary_zh,
  product_categories, importance, regulation_type,
  effective_date, published_date,
  changes_summary, changes_summary_zh,
  action_required, source_organization
) VALUES
(
  'SG', '新加坡',
  'Updated Requirements for Surgical Masks',
  '医用口罩要求更新',
  'HSA has updated the classification and documentation requirements for surgical masks effective from 1 April 2026.',
  '新加坡卫生科学局更新了医用口罩的分类和文件要求，2026 年 4 月 1 日起生效。',
  ARRAY['MASK-SURG', '口罩'],
  'high',
  'Classification Update',
  '2026-04-01', '2026-03-15',
  '1. Updated classification from Class A to Class B\n2. Additional biocompatibility testing required\n3. Enhanced labeling requirements',
  '1. 分类从 Class A 更新为 Class B\n2. 需要额外的生物相容性测试\n3. 强化的标签要求',
  true,
  'Health Sciences Authority (HSA)'
),
(
  'US', '美国',
  'FDA Guidance on N95 Respirators',
  'FDA 关于 N95 呼吸器的指南',
  'FDA issued new guidance on N95 respirator authorization and quality control requirements.',
  'FDA 发布了关于 N95 呼吸器授权和质量控制要求的新指南。',
  ARRAY['MASK-N95', 'N95 呼吸器', 'PPE'],
  'critical',
  'New Guidance',
  '2026-05-01', '2026-03-10',
  '1. Enhanced quality control testing\n2. Quarterly reporting requirements\n3. Facility inspection frequency increased',
  '1. 强化质量控制测试\n2. 季度报告要求\n3. 增加设施检查频率',
  true,
  'U.S. Food and Drug Administration (FDA)'
),
(
  'EU', '欧盟',
  'MDR Implementation Update',
  'MDR 实施更新',
  'European Commission published updated guidance on MDR implementation for Class I devices.',
  '欧盟委员会发布了关于 I 类器械 MDR 实施的更新指南。',
  ARRAY['medical device', '医疗器械'],
  'medium',
  'Implementation Guidance',
  '2026-06-01', '2026-03-01',
  '1. Clarified classification rules\n2. Updated technical documentation requirements\n3. Extended transition periods for certain devices',
  '1. 明确的分类规则\n2. 更新的技术文件要求\n3. 某些器械的过渡期延长',
  false,
  'European Commission'
),
(
  'CN', '中国',
  '医疗器械注册管理办法修订',
  'Revision of Medical Device Registration Measures',
  'NMPA released revised measures for medical device registration management.',
  '国家药监局发布了修订后的医疗器械注册管理办法。',
  ARRAY['medical device', '医疗器械', 'IVD'],
  'critical',
  'Regulatory Revision',
  '2026-07-01', '2026-02-28',
  '1. Optimized registration process\n2. Accelerated innovative device approval\n3. Enhanced post-market surveillance',
  '1. 优化注册流程\n2. 加速创新器械审批\n3. 强化上市后监管',
  true,
  '国家药品监督管理局 (NMPA)'
);

-- ============================================
-- 5. 视图：待发送的通知
-- ============================================
CREATE OR REPLACE VIEW pending_notifications AS
SELECT 
  s.user_email,
  r.id as regulation_id,
  r.title,
  r.importance,
  r.country,
  r.published_date,
  'email' as notification_type
FROM user_subscriptions s
CROSS JOIN regulation_updates r
WHERE s.is_active = true
  AND r.importance = ANY(s.importance_filter)
  AND (s.countries IS NULL OR r.country = ANY(s.countries))
  AND NOT EXISTS (
    SELECT 1 FROM push_notifications pn
    WHERE pn.user_email = s.user_email
      AND pn.regulation_id = r.id
      AND pn.status IN ('sent', 'opened', 'clicked')
  )
ORDER BY r.importance DESC, r.published_date DESC;

-- ============================================
-- 6. 函数：发送通知
-- ============================================
CREATE OR REPLACE FUNCTION send_notification(
  p_user_email TEXT,
  p_regulation_id UUID,
  p_type TEXT
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO push_notifications (
    user_email,
    regulation_id,
    notification_type,
    status,
    subject,
    content,
    sent_at
  ) VALUES (
    p_user_email,
    p_regulation_id,
    p_type,
    'sent',
    'New Regulation Update',
    'You have a new regulation update',
    NOW()
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. 验证查询
-- ============================================

-- 检查表是否创建成功
SELECT 
  'regulation_updates' as table_name,
  COUNT(*) as record_count
FROM regulation_updates
UNION ALL
SELECT 
  'user_subscriptions',
  COUNT(*)
FROM user_subscriptions
UNION ALL
SELECT 
  'push_notifications',
  COUNT(*)
FROM push_notifications;

-- 查看示例法规数据
SELECT 
  country_name,
  title_zh,
  importance,
  effective_date,
  action_required
FROM regulation_updates
ORDER BY published_date DESC;
