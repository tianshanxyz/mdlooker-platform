-- ============================================
-- NMPA表优化脚本
-- 解决7.2G大体积问题和查询性能优化
-- ============================================

-- ============================================
-- 第一部分：数据清理和压缩
-- ============================================

-- 1. 清理raw_data中的冗余字段（保留关键信息）
-- 创建一个新表，压缩raw_data
CREATE TABLE IF NOT EXISTS nmpa_registrations_optimized (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    registration_number VARCHAR(100) NOT NULL,
    product_name VARCHAR(500),
    product_name_zh VARCHAR(500),
    manufacturer VARCHAR(255),
    manufacturer_zh VARCHAR(255),
    manufacturer_address TEXT,
    registration_holder VARCHAR(255),
    registration_holder_zh VARCHAR(255),
    registration_holder_address TEXT,
    device_classification VARCHAR(50),
    approval_date DATE,
    expiration_date DATE,
    product_description TEXT,
    scope_of_application TEXT,
    source_url TEXT,
    -- 压缩后的raw_data，只保留关键字段
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建压缩后的数据（清理raw_data中的大字段）
INSERT INTO nmpa_registrations_optimized (
    id, company_id, registration_number, product_name, product_name_zh,
    manufacturer, manufacturer_zh, manufacturer_address,
    registration_holder, registration_holder_zh, registration_holder_address,
    device_classification, approval_date, expiration_date,
    product_description, scope_of_application, source_url,
    raw_data, created_at, updated_at
)
SELECT 
    id,
    company_id,
    registration_number,
    product_name,
    product_name_zh,
    manufacturer,
    manufacturer_zh,
    manufacturer_address,
    registration_holder,
    registration_holder_zh,
    registration_holder_address,
    device_classification,
    approval_date,
    expiration_date,
    product_description,
    scope_of_application,
    source_url,
    -- 压缩raw_data：只保留关键字段
    jsonb_build_object(
        'registration_number', registration_number,
        'product_name', product_name,
        'manufacturer', manufacturer,
        'device_classification', device_classification,
        'approval_date', approval_date,
        'source', 'NMPA'
    ) as raw_data,
    created_at,
    updated_at
FROM nmpa_registrations;

-- 3. 创建优化后的索引
CREATE INDEX idx_nmpa_opt_reg_number ON nmpa_registrations_optimized(registration_number);
CREATE INDEX idx_nmpa_opt_product_name ON nmpa_registrations_optimized USING gin(to_tsvector('simple', COALESCE(product_name_zh, '')::text));
CREATE INDEX idx_nmpa_opt_manufacturer ON nmpa_registrations_optimized(manufacturer);
CREATE INDEX idx_nmpa_opt_approval_date ON nmpa_registrations_optimized(approval_date);
CREATE INDEX idx_nmpa_opt_company_id ON nmpa_registrations_optimized(company_id);

-- 4. 添加更新时间触发器
CREATE TRIGGER update_nmpa_opt_updated_at 
BEFORE UPDATE ON nmpa_registrations_optimized 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第二部分：分区表方案（如果数据量继续增长）
-- ============================================

-- 创建按年份分区的主表
CREATE TABLE IF NOT EXISTS nmpa_registrations_partitioned (
    id UUID,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    registration_number VARCHAR(100) NOT NULL,
    product_name VARCHAR(500),
    product_name_zh VARCHAR(500),
    manufacturer VARCHAR(255),
    manufacturer_zh VARCHAR(255),
    device_classification VARCHAR(50),
    approval_date DATE NOT NULL,
    expiration_date DATE,
    product_description TEXT,
    source_url TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (id, approval_date)
) PARTITION BY RANGE (approval_date);

-- 创建分区（按年份）
CREATE TABLE nmpa_registrations_2020 PARTITION OF nmpa_registrations_partitioned
    FOR VALUES FROM ('2020-01-01') TO ('2021-01-01');
CREATE TABLE nmpa_registrations_2021 PARTITION OF nmpa_registrations_partitioned
    FOR VALUES FROM ('2021-01-01') TO ('2022-01-01');
CREATE TABLE nmpa_registrations_2022 PARTITION OF nmpa_registrations_partitioned
    FOR VALUES FROM ('2022-01-01') TO ('2023-01-01');
CREATE TABLE nmpa_registrations_2023 PARTITION OF nmpa_registrations_partitioned
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');
CREATE TABLE nmpa_registrations_2024 PARTITION OF nmpa_registrations_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE nmpa_registrations_2025 PARTITION OF nmpa_registrations_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- ============================================
-- 第三部分：查询优化视图
-- ============================================

-- 创建物化视图用于快速查询
CREATE MATERIALIZED VIEW IF NOT EXISTS nmpa_registrations_summary AS
SELECT 
    id,
    registration_number,
    product_name,
    product_name_zh,
    manufacturer,
    device_classification,
    approval_date,
    expiration_date,
    -- 计算是否过期
    CASE 
        WHEN expiration_date IS NULL THEN 'Unknown'
        WHEN expiration_date < CURRENT_DATE THEN 'Expired'
        ELSE 'Valid'
    END as status
FROM nmpa_registrations_optimized;

-- 为物化视图创建索引
CREATE INDEX idx_nmpa_summary_reg_number ON nmpa_registrations_summary(registration_number);
CREATE INDEX idx_nmpa_summary_product ON nmpa_registrations_summary USING gin(to_tsvector('simple', COALESCE(product_name_zh, '')::text));

-- ============================================
-- 第四部分：清理和维护
-- ============================================

-- 1. 清理死元组（需要在维护窗口执行）
-- VACUUM FULL ANALYZE nmpa_registrations;

-- 2. 重新索引（需要在维护窗口执行）
-- REINDEX TABLE nmpa_registrations;

-- 3. 更新统计信息
ANALYZE nmpa_registrations;

-- ============================================
-- 第五部分：查看优化效果
-- ============================================

-- 比较原表和优化后表的大小
SELECT 
    'Original' as table_type,
    pg_size_pretty(pg_total_relation_size('nmpa_registrations')) as size
UNION ALL
SELECT 
    'Optimized' as table_type,
    pg_size_pretty(pg_total_relation_size('nmpa_registrations_optimized')) as size;

-- 查看优化后表的行数
SELECT COUNT(*) as optimized_rows FROM nmpa_registrations_optimized;
