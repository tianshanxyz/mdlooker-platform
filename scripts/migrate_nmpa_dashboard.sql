-- ============================================
-- NMPA表数据迁移脚本（在Supabase Dashboard执行）
-- 分批迁移，避免超时
-- ============================================

-- 步骤1：确认v2表已创建
-- 如果还没有创建，请先执行：
/*
CREATE TABLE IF NOT EXISTS nmpa_registrations_v2 (
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
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- ============================================
-- 分批迁移数据（每次3000条）
-- 请逐批执行，每批执行后检查是否成功
-- ============================================

-- 第1批：0-3000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000;

-- 第2批：3000-6000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 3000;

-- 第3批：6000-9000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 6000;

-- 第4批：9000-12000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 9000;

-- 第5批：12000-15000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 12000;

-- 第6批：15000-18000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 15000;

-- 第7批：18000-21000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 18000;

-- 第8批：21000-24000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 21000;

-- 第9批：24000-27000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 24000;

-- 第10批：27000-30000
INSERT INTO nmpa_registrations_v2 (
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
ORDER BY id
LIMIT 3000 OFFSET 27000;

-- ============================================
-- 进度检查（每批执行后可以查询）
-- ============================================

-- 查看已迁移的记录数
SELECT COUNT(*) as migrated_count FROM nmpa_registrations_v2;

-- 查看原表记录数（如果查询不超时）
-- SELECT COUNT(*) as original_count FROM nmpa_registrations;

-- ============================================
-- 所有数据迁移完成后，创建索引
-- ============================================

-- 创建索引
CREATE INDEX idx_nmpa_v2_reg_number ON nmpa_registrations_v2(registration_number);
CREATE INDEX idx_nmpa_v2_product ON nmpa_registrations_v2 USING gin(to_tsvector('simple', COALESCE(product_name_zh, '')::text));
CREATE INDEX idx_nmpa_v2_manufacturer ON nmpa_registrations_v2(manufacturer);
CREATE INDEX idx_nmpa_v2_approval_date ON nmpa_registrations_v2(approval_date);
CREATE INDEX idx_nmpa_v2_company_id ON nmpa_registrations_v2(company_id);

-- ============================================
-- 切换表（确认数据完整后执行）
-- ============================================

/*
BEGIN;
  -- 1. 重命名原表为备份
  ALTER TABLE nmpa_registrations RENAME TO nmpa_registrations_backup;
  
  -- 2. 新表重命名为正式表名
  ALTER TABLE nmpa_registrations_v2 RENAME TO nmpa_registrations;
  
  -- 3. 重命名索引
  ALTER INDEX idx_nmpa_v2_reg_number RENAME TO idx_nmpa_reg_number;
  ALTER INDEX idx_nmpa_v2_product RENAME TO idx_nmpa_product;
  ALTER INDEX idx_nmpa_v2_manufacturer RENAME TO idx_nmpa_manufacturer;
  ALTER INDEX idx_nmpa_v2_approval_date RENAME TO idx_nmpa_approval_date;
  ALTER INDEX idx_nmpa_v2_company_id RENAME TO idx_nmpa_company_id;
COMMIT;
*/

-- ============================================
-- 清理（确认新表正常后执行）
-- ============================================

-- DROP TABLE nmpa_registrations_backup;
