-- ============================================
-- WAL清理脚本（在Supabase Dashboard执行）
-- ============================================

-- 方法1：执行VACUUM（不需要超级权限）
VACUUM;

-- 方法2：分析表，更新统计信息
ANALYZE nmpa_registrations;

-- 方法3：如果以上无效，可以尝试以下方法
-- 强制触发WAL归档（通过大量小事务）
DO $$
BEGIN
    -- 执行一些空事务来触发WAL切换
    FOR i IN 1..10 LOOP
        PERFORM pg_sleep(0.1);
    END LOOP;
END $$;

-- ============================================
-- 查看WAL相关配置
-- ============================================

-- 查看WAL配置
SHOW wal_level;
SHOW max_wal_size;
SHOW min_wal_size;
SHOW checkpoint_timeout;

-- 查看复制槽（如果有的话）
SELECT * FROM pg_replication_slots;

-- 查看WAL文件状态
SELECT 
    pg_walfile_name(pg_current_wal_lsn()),
    pg_current_wal_lsn();

-- ============================================
-- 如果WAL仍然很大，可能是以下原因：
-- 1. 有未确认的复制槽
-- 2. 有长时间运行的事务
-- 3. 归档配置问题
-- ============================================

-- 查看长时间运行的事务
SELECT 
    pid,
    usename,
    application_name,
    state,
    query_start,
    now() - query_start as duration,
    query
FROM pg_stat_activity
WHERE state != 'idle'
AND query_start < now() - interval '1 hour'
ORDER BY query_start;

-- 查看复制延迟
SELECT 
    client_addr,
    state,
    sent_lsn,
    write_lsn,
    flush_lsn,
    replay_lsn
FROM pg_stat_replication;
