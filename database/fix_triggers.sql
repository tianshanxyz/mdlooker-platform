-- 修复触发器已存在的错误
-- 先删除已存在的触发器，然后重新创建

-- 删除已存在的触发器（如果存在）
DROP TRIGGER IF EXISTS update_pmda_registrations_updated_at ON pmda_registrations;
DROP TRIGGER IF EXISTS update_health_canada_registrations_updated_at ON health_canada_registrations;

-- 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 重新创建触发器
CREATE TRIGGER update_pmda_registrations_updated_at 
    BEFORE UPDATE ON pmda_registrations
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_canada_registrations_updated_at 
    BEFORE UPDATE ON health_canada_registrations
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 验证表是否创建成功
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('pmda_registrations', 'health_canada_registrations')
ORDER BY table_name, ordinal_position;
