-- 存储监控设置脚本
-- 在Supabase SQL Editor中执行此脚本

-- 1. 创建存储监控日志表
CREATE TABLE IF NOT EXISTS storage_monitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_size_gb DECIMAL(10, 2),
    table_count INTEGER,
    growth_estimate JSONB,
    alerts TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. 创建索引
CREATE INDEX idx_storage_monitor_created_at ON storage_monitor_logs(created_at DESC);

-- 3. 创建获取表大小的函数
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
    table_name TEXT,
    row_count BIGINT,
    table_size TEXT,
    index_size TEXT,
    total_size TEXT,
    size_bytes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::TEXT as table_name,
        c.reltuples::BIGINT as row_count,
        pg_size_pretty(pg_relation_size(c.oid)) as table_size,
        pg_size_pretty(pg_indexes_size(c.oid)) as index_size,
        pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
        pg_total_relation_size(c.oid)::BIGINT as size_bytes
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 创建获取数据库大小的函数
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS TABLE (
    database_name TEXT,
    size_pretty TEXT,
    size_bytes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        current_database()::TEXT as database_name,
        pg_size_pretty(pg_database_size(current_database())) as size_pretty,
        pg_database_size(current_database())::BIGINT as size_bytes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 创建压缩raw_data字段的函数（FDA）
CREATE OR REPLACE FUNCTION compress_fda_raw_data()
RETURNS TABLE (
    processed_count INTEGER,
    saved_bytes BIGINT
) AS $$
DECLARE
    v_processed INTEGER := 0;
    v_saved BIGINT := 0;
    v_before_size BIGINT;
    v_after_size BIGINT;
BEGIN
    -- 获取压缩前总大小
    SELECT COALESCE(SUM(pg_column_size(raw_data)), 0) INTO v_before_size
    FROM fda_registrations
    WHERE raw_data IS NOT NULL;
    
    -- 压缩：只保留关键字段
    UPDATE fda_registrations
    SET raw_data = jsonb_build_object(
        'registration_number', raw_data->'registration_number',
        'fei_number', raw_data->'fei_number',
        'registration_status', raw_data->'registration_status',
        'registration_date', raw_data->'registration_date',
        'device_name', raw_data->'device_name',
        'device_class', raw_data->'device_class',
        'product_code', raw_data->'product_code'
    )
    WHERE raw_data IS NOT NULL
    AND jsonb_typeof(raw_data) = 'object';
    
    GET DIAGNOSTICS v_processed = ROW_COUNT;
    
    -- 获取压缩后大小
    SELECT COALESCE(SUM(pg_column_size(raw_data)), 0) INTO v_after_size
    FROM fda_registrations
    WHERE raw_data IS NOT NULL;
    
    v_saved := v_before_size - v_after_size;
    
    RETURN QUERY SELECT v_processed, v_saved;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 创建清理旧日志的函数
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS TABLE (
    sync_logs_deleted INTEGER,
    storage_logs_deleted INTEGER
) AS $$
DECLARE
    v_sync_deleted INTEGER;
    v_storage_deleted INTEGER;
BEGIN
    -- 清理90天前的同步日志
    DELETE FROM sync_logs
    WHERE created_at < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS v_sync_deleted = ROW_COUNT;
    
    -- 清理30天前的存储监控日志
    DELETE FROM storage_monitor_logs
    WHERE created_at < NOW() - INTERVAL '30 days';
    GET DIAGNOSTICS v_storage_deleted = ROW_COUNT;
    
    RETURN QUERY SELECT v_sync_deleted, v_storage_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 创建获取存储报告的函数
CREATE OR REPLACE FUNCTION get_storage_report()
RETURNS JSONB AS $$
DECLARE
    v_total_size BIGINT;
    v_tables JSONB;
    v_result JSONB;
BEGIN
    -- 获取数据库总大小
    SELECT pg_database_size(current_database()) INTO v_total_size;
    
    -- 获取所有表的大小信息
    SELECT jsonb_agg(
        jsonb_build_object(
            'table_name', table_name,
            'row_count', row_count,
            'total_size', total_size,
            'size_bytes', size_bytes
        )
    ) INTO v_tables
    FROM get_table_sizes();
    
    -- 构建完整报告
    v_result := jsonb_build_object(
        'timestamp', NOW(),
        'total_size_bytes', v_total_size,
        'total_size_gb', ROUND(v_total_size::numeric / (1024*1024*1024), 2),
        'tables', COALESCE(v_tables, '[]'::jsonb),
        'storage_limit_gb', 40,
        'usage_percent', ROUND((v_total_size::numeric / (40*1024*1024*1024)) * 100, 2)
    );
    
    -- 记录到日志表
    INSERT INTO storage_monitor_logs (total_size_gb, table_count, growth_estimate, alerts)
    VALUES (
        ROUND(v_total_size::numeric / (1024*1024*1024), 2),
        COALESCE(jsonb_array_length(v_tables), 0),
        '{}'::jsonb,
        CASE 
            WHEN v_total_size > (35*1024*1024*1024) THEN ARRAY['存储空间紧张']
            WHEN v_total_size > (28*1024*1024*1024) THEN ARRAY['存储使用率超过70%']
            ELSE ARRAY[]::TEXT[]
        END
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 验证安装
SELECT 'Storage monitor setup completed successfully' as status;
SELECT * FROM get_database_size();
SELECT * FROM get_table_sizes() LIMIT 10;
