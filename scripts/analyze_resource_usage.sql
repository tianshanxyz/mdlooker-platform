-- ============================================
-- 资源使用分析脚本
-- 评估Small+20G配置是否满足需求
-- ============================================

-- 1. 查看所有表的大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. 查看总数据大小（不含WAL）
SELECT 
    pg_size_pretty(sum(pg_relation_size(schemaname||'.'||tablename))) as total_data_size
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. 查看连接数使用情况
SELECT 
    count(*) as current_connections,
    max_conn.max_connections as max_allowed
FROM pg_stat_activity, 
    (SELECT setting::int as max_connections FROM pg_settings WHERE name = 'max_connections') as max_conn
GROUP BY max_conn.max_connections;

-- 4. 查看活跃查询
SELECT 
    count(*) as active_queries
FROM pg_stat_activity 
WHERE state = 'active';

-- 5. 查看缓存命中率（评估内存是否足够）
SELECT 
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as cache_hit_ratio
FROM pg_statio_user_tables;

-- 6. 查看数据库统计信息
SELECT 
    datname,
    pg_size_pretty(pg_database_size(datname)) as db_size,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched,
    tup_inserted,
    tup_updated,
    tup_deleted
FROM pg_stat_database 
WHERE datname = current_database();

-- 7. 查看表行数统计
SELECT 
    'nmpa_registrations' as table_name,
    count(*) as row_count
FROM nmpa_registrations
UNION ALL
SELECT 
    'hsa_registrations',
    count(*)
FROM hsa_registrations
UNION ALL
SELECT 
    'pmda_registrations',
    count(*)
FROM pmda_registrations
UNION ALL
SELECT 
    'companies',
    count(*)
FROM companies;
