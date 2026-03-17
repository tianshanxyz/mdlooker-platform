-- ============================================
-- 数据库清理脚本
-- 用于清理可能重复的对象，然后重新创建
-- ============================================

-- 1. 删除所有触发器（如果存在）
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
DROP TRIGGER IF EXISTS update_fda_registrations_updated_at ON fda_registrations;
DROP TRIGGER IF EXISTS update_nmpa_registrations_updated_at ON nmpa_registrations;
DROP TRIGGER IF EXISTS update_eudamed_registrations_updated_at ON eudamed_registrations;
DROP TRIGGER IF EXISTS update_pmda_registrations_updated_at ON pmda_registrations;
DROP TRIGGER IF EXISTS update_health_canada_registrations_updated_at ON health_canada_registrations;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_company_patents_updated_at ON company_patents;
DROP TRIGGER IF EXISTS update_company_trademarks_updated_at ON company_trademarks;

-- 2. 删除函数（如果存在）
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. 删除索引（如果存在）
DROP INDEX IF EXISTS idx_companies_name;
DROP INDEX IF EXISTS idx_companies_name_zh;
DROP INDEX IF EXISTS idx_fda_device_name;
DROP INDEX IF EXISTS idx_nmpa_product_name;
DROP INDEX IF EXISTS idx_pmda_product_name;
DROP INDEX IF EXISTS idx_health_canada_device_name;

-- 4. 删除表（如果存在）- 谨慎使用！
-- 注意：这会删除所有数据！
-- DROP TABLE IF EXISTS sync_logs CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS health_canada_registrations CASCADE;
-- DROP TABLE IF EXISTS pmda_registrations CASCADE;
-- DROP TABLE IF EXISTS eudamed_registrations CASCADE;
-- DROP TABLE IF EXISTS nmpa_registrations CASCADE;
-- DROP TABLE IF EXISTS fda_registrations CASCADE;
-- DROP TABLE IF EXISTS companies CASCADE;

-- ============================================
-- 清理完成！
-- 现在可以安全地运行 schema.sql
-- ============================================
