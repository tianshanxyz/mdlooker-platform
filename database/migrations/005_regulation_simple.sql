-- 简化版 - 法规动态表
-- 请复制此文件内容执行

-- 删除旧表
DROP TABLE IF EXISTS push_notifications CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS regulation_updates CASCADE;

-- 创建法规更新表
CREATE TABLE regulation_updates (
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
  importance TEXT DEFAULT 'medium',
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

-- 创建索引
CREATE INDEX idx_regulation_country ON regulation_updates(country);
CREATE INDEX idx_regulation_importance ON regulation_updates(importance);
CREATE INDEX idx_regulation_effective_date ON regulation_updates(effective_date);
CREATE INDEX idx_regulation_created_at ON regulation_updates(created_at DESC);

-- 插入示例数据
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
  'HSA updated requirements for surgical masks.',
  '新加坡卫生科学局更新了医用口罩要求。',
  ARRAY['MASK-SURG', '口罩'],
  'high',
  'Classification Update',
  '2026-04-01', '2026-03-15',
  'Updated classification and testing requirements.',
  '更新了分类和测试要求。',
  true,
  'Health Sciences Authority (HSA)'
),
(
  'US', '美国',
  'FDA Guidance on N95 Respirators',
  'FDA 关于 N95 呼吸器的指南',
  'FDA issued new guidance on N95 respirators.',
  'FDA 发布了 N95 呼吸器新指南。',
  ARRAY['MASK-N95', 'N95 呼吸器', 'PPE'],
  'critical',
  'New Guidance',
  '2026-05-01', '2026-03-10',
  'Enhanced quality control and reporting.',
  '强化质量控制和报告要求。',
  true,
  'U.S. Food and Drug Administration (FDA)'
),
(
  'EU', '欧盟',
  'MDR Implementation Update',
  'MDR 实施更新',
  'EC published MDR guidance for Class I devices.',
  '欧盟委员会发布了 I 类器械 MDR 指南。',
  ARRAY['medical device', '医疗器械'],
  'medium',
  'Implementation Guidance',
  '2026-06-01', '2026-03-01',
  'Clarified classification and documentation.',
  '明确了分类和文件要求。',
  false,
  'European Commission'
),
(
  'CN', '中国',
  '医疗器械注册管理办法修订',
  'Revision of Medical Device Registration Measures',
  'NMPA released revised registration measures.',
  '国家药监局发布了修订后的注册管理办法。',
  ARRAY['medical device', '医疗器械', 'IVD'],
  'critical',
  'Regulatory Revision',
  '2026-07-01', '2026-02-28',
  'Optimized process and accelerated approval.',
  '优化流程，加速审批。',
  true,
  '国家药品监督管理局 (NMPA)'
);

-- 创建用户订阅表
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  user_id UUID,
  countries TEXT[],
  product_categories TEXT[],
  notification_types TEXT[] DEFAULT ARRAY['email'],
  frequency TEXT DEFAULT 'immediate',
  importance_filter TEXT[] DEFAULT ARRAY['high', 'critical'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_notification_sent TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_subscription_email ON user_subscriptions(user_email);
CREATE INDEX idx_subscription_active ON user_subscriptions(is_active);

-- 创建推送通知表
CREATE TABLE push_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  regulation_id UUID REFERENCES regulation_updates(id),
  notification_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  subject TEXT,
  content TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_notification_user ON push_notifications(user_email);
CREATE INDEX idx_notification_status ON push_notifications(status);
CREATE INDEX idx_notification_created_at ON push_notifications(created_at DESC);

-- 验证
SELECT 'regulation_updates' as table_name, COUNT(*) as records FROM regulation_updates
UNION ALL SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
UNION ALL SELECT 'push_notifications', COUNT(*) FROM push_notifications;
