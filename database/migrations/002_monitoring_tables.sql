-- 竞品监控功能数据库表（简化版 - 不需要 users 表）
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 1. 用户收藏表（使用 email 标识用户）
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_email ON user_favorites(user_email);
CREATE INDEX IF NOT EXISTS idx_user_favorites_company_id ON user_favorites(company_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

-- 2. 监控通知表
CREATE TABLE IF NOT EXISTS favorite_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  favorite_id UUID REFERENCES user_favorites(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'new_registration', 'status_change', 'expiring_soon'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  registration_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_notifications_email ON favorite_notifications(user_email);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON favorite_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON favorite_notifications(created_at);

-- 3. 创建 RLS（行级安全策略）- 可选，如果需要多用户隔离
-- 如果只有单用户使用，可以跳过 RLS

-- 4. 创建函数：检查新增注册并生成通知
CREATE OR REPLACE FUNCTION check_new_registrations_for_favorites()
RETURNS TRIGGER AS $$
BEGIN
  -- 当有新注册时，检查是否有用户收藏了该公司
  INSERT INTO favorite_notifications (user_email, favorite_id, notification_type, title, message, registration_id)
  SELECT 
    uf.user_email,
    uf.id,
    'new_registration',
    '新注册通知',
    CASE 
      WHEN TG_TABLE_NAME = 'nmpa_registrations' THEN 
        '您收藏的公司新增了一条 NMPA 注册：' || COALESCE(NEW.product_name_zh, NEW.product_name)
      WHEN TG_TABLE_NAME = 'fda_registrations' THEN
        '您收藏的公司新增了一条 FDA 注册：' || COALESCE(NEW.device_name, NEW.product_name)
      WHEN TG_TABLE_NAME = 'eudamed_registrations' THEN
        '您收藏的公司新增了一条 EUDAMED 注册：' || COALESCE(NEW.device_name, NEW.product_name)
      ELSE
        '您收藏的公司新增了一条注册'
    END,
    NEW.id
  FROM user_favorites uf
  WHERE uf.company_id = NEW.company_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 创建触发器
DROP TRIGGER IF EXISTS trg_nmpa_new_registration ON nmpa_registrations;
CREATE TRIGGER trg_nmpa_new_registration
  AFTER INSERT ON nmpa_registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_new_registrations_for_favorites();

DROP TRIGGER IF EXISTS trg_fda_new_registration ON fda_registrations;
CREATE TRIGGER trg_fda_new_registration
  AFTER INSERT ON fda_registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_new_registrations_for_favorites();

DROP TRIGGER IF EXISTS trg_eudamed_new_registration ON eudamed_registrations;
CREATE TRIGGER trg_eudamed_new_registration
  AFTER INSERT ON eudamed_registrations
  FOR EACH ROW
  EXECUTE FUNCTION check_new_registrations_for_favorites();

-- 6. 注释
COMMENT ON TABLE user_favorites IS '用户收藏的公司列表，用于竞品监控（使用 email 标识用户）';
COMMENT ON TABLE favorite_notifications IS '竞品监控通知，包括新注册、状态变更等';
COMMENT ON FUNCTION check_new_registrations_for_favorites() IS '当有新注册时，自动通知收藏了该公司的用户';

-- 7. 验证查询
SELECT 
  'Tables created successfully' AS status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_favorites') AS user_favorites_exists,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'favorite_notifications') AS favorite_notifications_exists;
