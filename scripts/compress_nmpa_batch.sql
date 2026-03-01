-- ============================================
-- NMPA表分批压缩脚本
-- 解决超时和磁盘空间不足问题
-- ============================================

-- 方法1：分批压缩（每次处理1000条）
-- 在Supabase Dashboard中分批执行

-- 第一批：处理前1000条
UPDATE nmpa_registrations 
SET raw_data = jsonb_build_object(
    'registration_number', registration_number,
    'product_name', product_name,
    'manufacturer', manufacturer,
    'device_classification', device_classification,
    'approval_date', approval_date,
    'source', 'NMPA'
)
WHERE id IN (
    SELECT id FROM nmpa_registrations 
    WHERE raw_data IS NOT NULL 
    AND pg_column_size(raw_data) > 1000
    ORDER BY id
    LIMIT 1000
);

-- 第二批：处理接下来1000条（修改OFFSET）
-- UPDATE nmpa_registrations 
-- SET raw_data = jsonb_build_object(...)
-- WHERE id IN (
--     SELECT id FROM nmpa_registrations 
--     WHERE raw_data IS NOT NULL 
--     AND pg_column_size(raw_data) > 1000
--     ORDER BY id
--     LIMIT 1000 OFFSET 1000
-- );

-- ============================================
-- 方法2：创建新表（推荐，避免磁盘空间问题）
-- ============================================

-- 1. 创建压缩后的新表
CREATE TABLE nmpa_registrations_compressed (
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
    raw_data JSONB,  -- 压缩后的
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 分批插入压缩后的数据（每次5000条）
INSERT INTO nmpa_registrations_compressed (
    id, company_id, registration_number, product_name, product_name_zh,
    manufacturer, manufacturer_zh, manufacturer_address,
    registration_holder, registration_holder_zh, registration_holder_address,
    device_classification, approval_date, expiration_date,
    product_description, scope_of_application, source_url,
    raw_data, created_at, updated_at
)
SELECT 
    id, company_id, registration_number, product_name, product_name_zh,
    manufacturer, manufacturer_zh, manufacturer_address,
    registration_holder, registration_holder_zh, registration_holder_address,
    device_classification, approval_date, expiration_date,
    product_description, scope_of_application, source_url,
    jsonb_build_object(
        'registration_number', registration_number,
        'product_name', product_name,
        'manufacturer', manufacturer,
        'device_classification', device_classification,
        'approval_date', approval_date,
        'source', 'NMPA'
    ) as raw_data,
    created_at, updated_at
FROM nmpa_registrations
WHERE id IN (
    SELECT id FROM nmpa_registrations 
    ORDER BY id 
    LIMIT 5000
);

-- 3. 创建索引
CREATE INDEX idx_nmpa_comp_reg_number ON nmpa_registrations_compressed(registration_number);
CREATE INDEX idx_nmpa_comp_product ON nmpa_registrations_compressed USING gin(to_tsvector('simple', COALESCE(product_name_zh, '')::text));
CREATE INDEX idx_nmpa_comp_manufacturer ON nmpa_registrations_compressed(manufacturer);

-- 4. 验证数据完整性后，删除原表，重命名新表
-- DROP TABLE nmpa_registrations;
-- ALTER TABLE nmpa_registrations_compressed RENAME TO nmpa_registrations;

-- ============================================
-- 方法3：只清理最大的raw_data记录
-- ============================================

-- 先找出最大的100条记录进行清理
UPDATE nmpa_registrations 
SET raw_data = jsonb_build_object(
    'registration_number', registration_number,
    'product_name', product_name,
    'manufacturer', manufacturer,
    'device_classification', device_classification,
    'approval_date', approval_date,
    'source', 'NMPA'
)
WHERE id IN (
    SELECT id FROM nmpa_registrations 
    WHERE raw_data IS NOT NULL
    ORDER BY pg_column_size(raw_data) DESC
    LIMIT 100
);

-- ============================================
-- 方法4：使用TRUNCATE+INSERT（最快，但需要停机）
-- ============================================

-- 1. 备份数据到外部存储（可选）
-- COPY (SELECT * FROM nmpa_registrations) TO '/tmp/nmpa_backup.csv' WITH CSV;

-- 2. 创建临时表
CREATE TEMP TABLE temp_nmpa AS 
SELECT 
    id, company_id, registration_number, product_name, product_name_zh,
    manufacturer, manufacturer_zh, manufacturer_address,
    registration_holder, registration_holder_zh, registration_holder_address,
    device_classification, approval_date, expiration_date,
    product_description, scope_of_application, source_url,
    jsonb_build_object(
        'registration_number', registration_number,
        'product_name', product_name,
        'manufacturer', manufacturer,
        'device_classification', device_classification,
        'approval_date', approval_date,
        'source', 'NMPA'
    ) as raw_data,
    created_at, updated_at
FROM nmpa_registrations;

-- 3. 清空原表
-- TRUNCATE TABLE nmpa_registrations;

-- 4. 插回压缩后的数据
-- INSERT INTO nmpa_registrations SELECT * FROM temp_nmpa;

-- ============================================
-- 进度查询（执行过程中查看）
-- ============================================

-- 查看还有多少大记录需要处理
SELECT COUNT(*) as remaining_large_records
FROM nmpa_registrations 
WHERE raw_data IS NOT NULL 
AND pg_column_size(raw_data) > 1000;

-- 查看当前表大小
SELECT 
    pg_size_pretty(pg_total_relation_size('nmpa_registrations')) as current_size,
    pg_size_pretty(pg_relation_size('nmpa_registrations')) as table_size,
    pg_size_pretty(pg_indexes_size('nmpa_registrations')) as index_size;
