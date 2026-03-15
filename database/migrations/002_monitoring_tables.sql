-- 竞品监控功能数据库表
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 1. 用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  product_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_company_id ON user_favorites(company_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at);

-- 2. 监控通知表
CREATE TABLE IF NOT EXISTS favorite_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON favorite_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON favorite_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON favorite_notifications(created_at);

-- 3. 创建 RLS（行级安全策略）
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_notifications ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的收藏
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- 用户可以添加自己的收藏
CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 用户可以删除自己的收藏
CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- 用户可以更新自己的收藏
CREATE POLICY "Users can update own favorites"
  ON user_favorites FOR UPDATE
  USING (auth.uid() = user_id);

-- 用户只能查看自己的通知
CREATE POLICY "Users can view own notifications"
  ON favorite_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 系统可以插入通知（通过 trigger 或 cron job）
CREATE POLICY "System can insert notifications"
  ON favorite_notifications FOR INSERT
  WITH CHECK (true);

-- 用户可以标记通知为已读
CREATE POLICY "Users can update own notifications"
  ON favorite_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. 创建函数：检查新增注册并生成通知
CREATE OR REPLACE FUNCTION check_new_registrations_for_favorites()
RETURNS TRIGGER AS $$
BEGIN
  -- 当有新注册时，检查是否有用户收藏了该公司
  INSERT INTO favorite_notifications (user_id, favorite_id, notification_type, title, message, registration_id)
  SELECT 
    uf.user_id,
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

-- 6. 视图：用户收藏统计
CREATE OR REPLACE VIEW user_favorite_stats AS
SELECT 
  uf.user_id,
  COUNT(DISTINCT uf.id) AS total_favorites,
  COUNT(DISTINCT CASE WHEN fn.is_read = FALSE THEN fn.id END) AS unread_notifications
FROM user_favorites uf
LEFT JOIN favorite_notifications fn ON fn.favorite_id = uf.id
GROUP BY uf.user_id;

-- 7. 注释
COMMENT ON TABLE user_favorites IS '用户收藏的公司列表，用于竞品监控';
COMMENT ON TABLE favorite_notifications IS '竞品监控通知，包括新注册、状态变更等';
COMMENT ON FUNCTION check_new_registrations_for_favorites() IS '当有新注册时，自动通知收藏了该公司的用户';
