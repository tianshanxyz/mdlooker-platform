-- ============================================
-- NMPA表诊断和优化脚本
-- ============================================

-- 1. 查看表基本信息和大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE tablename = 'nmpa_registrations';

-- 2. 查看表行数
SELECT COUNT(*) as total_rows FROM nmpa_registrations;

-- 3. 查看列大小分布（找出大字段）
SELECT 
    column_name,
    data_type,
    pg_size_pretty(pg_column_size(nmpa_registrations.*)) as avg_column_size
FROM information_schema.columns 
WHERE table_name = 'nmpa_registrations'
ORDER BY pg_column_size(nmpa_registrations.*) DESC;

-- 4. 查看raw_data字段的大小分布
SELECT 
    pg_size_pretty(pg_column_size(raw_data)) as raw_data_size,
    pg_column_size(raw_data) as bytes,
    COUNT(*) as count
FROM nmpa_registrations 
GROUP BY pg_column_size(raw_data)
ORDER BY bytes DESC
LIMIT 20;

-- 5. 查看最大的raw_data记录
SELECT 
    id,
    registration_number,
    product_name,
    pg_size_pretty(pg_column_size(raw_data)) as raw_data_size,
    LENGTH(raw_data::text) as json_length
FROM nmpa_registrations 
ORDER BY pg_column_size(raw_data) DESC
LIMIT 10;

-- 6. 检查是否有重复数据
SELECT 
    registration_number,
    COUNT(*) as duplicate_count
FROM nmpa_registrations
GROUP BY registration_number
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 20;

-- 7. 查看表膨胀情况
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as dead_tuple_ratio
FROM pg_stat_user_tables 
WHERE tablename = 'nmpa_registrations';

-- 8. 查看索引使用情况
SELECT 
    schemaname,
    tablename,
    indexrelname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE tablename = 'nmpa_registrations'
ORDER BY idx_scan DESC;
