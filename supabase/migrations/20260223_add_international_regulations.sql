-- Phase 3: 国际医疗器械监管数据库扩展
-- 添加新加坡HSA、日本PMDA、中东SFDA数据表

-- ============================================
-- 1. 新加坡HSA (Health Sciences Authority)
-- ============================================

-- HSA注册产品表
CREATE TABLE IF NOT EXISTS hsa_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    device_name TEXT NOT NULL,
    device_name_zh TEXT,
    manufacturer_name TEXT NOT NULL,
    manufacturer_name_zh TEXT,
    manufacturer_address TEXT,
    local_representative TEXT,
    product_owner TEXT,
    
    -- 分类信息
    risk_class VARCHAR(10) CHECK (risk_class IN ('A', 'B', 'C', 'D')),
    device_category TEXT,
    gmdn_code VARCHAR(20),
    
    -- 注册信息
    registration_type VARCHAR(50), -- Full, Abridged, Immediate, etc.
    registration_status VARCHAR(20) DEFAULT 'Active' CHECK (registration_status IN ('Active', 'Expired', 'Cancelled', 'Suspended')),
    registration_date DATE,
    expiry_date DATE,
    
    -- 技术信息
    intended_use TEXT,
    indications_for_use TEXT,
    
    -- 元数据
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_source VARCHAR(50) DEFAULT 'HSA_MEDICS',
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 搜索优化
    search_vector TSVECTOR
);

-- HSA注册历史表
CREATE TABLE IF NOT EXISTS hsa_registration_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES hsa_registrations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- Registration, Renewal, Amendment, etc.
    event_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HSA产品变体表
CREATE TABLE IF NOT EXISTS hsa_product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES hsa_registrations(id) ON DELETE CASCADE,
    variant_name TEXT NOT NULL,
    model_number VARCHAR(100),
    specifications TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. 日本PMDA (Pharmaceuticals and Medical Devices Agency)
-- ============================================

-- PMDA批准产品表
CREATE TABLE IF NOT EXISTS pmda_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_number VARCHAR(50) UNIQUE NOT NULL,
    marketing_authorization_number VARCHAR(50),
    
    -- 产品信息
    device_name TEXT NOT NULL,
    device_name_jp TEXT,
    generic_name TEXT,
    brand_name TEXT,
    
    -- 制造商信息
    manufacturer_name TEXT NOT NULL,
    manufacturer_name_jp TEXT,
    manufacturer_country VARCHAR(100),
    marketing_authorization_holder TEXT,
    marketing_authorization_holder_jp TEXT,
    
    -- 分类信息
    classification VARCHAR(20), -- Class I, II, III, IV
    classification_code VARCHAR(20),
    ninsyo_category VARCHAR(50), -- 認証カテゴリ
    
    -- 批准信息
    approval_type VARCHAR(50), -- New, Partial Change, etc.
    approval_status VARCHAR(20) DEFAULT 'Approved' CHECK (approval_status IN ('Approved', 'Withdrawn', 'Suspended')),
    approval_date DATE,
    effective_date DATE,
    
    -- 技术信息
    intended_use TEXT,
    intended_use_jp TEXT,
    indications TEXT,
    indications_jp TEXT,
    
    -- 附件信息
    attached_documents JSONB,
    
    -- 元数据
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_source VARCHAR(50) DEFAULT 'PMDA_NINSHO',
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 搜索优化
    search_vector TSVECTOR
);

-- PMDA认证机构表 (Registered Certification Bodies)
CREATE TABLE IF NOT EXISTS pmda_certification_bodies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    body_name TEXT NOT NULL,
    body_name_jp TEXT,
    registration_number VARCHAR(50) UNIQUE,
    address TEXT,
    contact_info JSONB,
    scope_of_authorization TEXT[],
    valid_from DATE,
    valid_until DATE,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PMDA产品标准表
CREATE TABLE IF NOT EXISTS pmda_product_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id UUID REFERENCES pmda_approvals(id) ON DELETE CASCADE,
    standard_name TEXT NOT NULL,
    standard_number VARCHAR(50),
    standard_type VARCHAR(50), -- JIS, ISO, etc.
    compliance_status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. 中东SFDA (Saudi Food and Drug Authority)
-- ============================================

-- SFDA MDMA注册表
CREATE TABLE IF NOT EXISTS sfda_mdma (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mdma_number VARCHAR(50) UNIQUE NOT NULL,
    gmdn_term TEXT,
    gmdn_code VARCHAR(20),
    
    -- 产品信息
    device_name TEXT NOT NULL,
    device_name_ar TEXT,
    model_number VARCHAR(100),
    
    -- 制造商信息
    manufacturer_name TEXT NOT NULL,
    manufacturer_name_ar TEXT,
    manufacturer_country VARCHAR(100),
    manufacturing_site TEXT,
    
    -- 授权代表
    authorized_representative TEXT,
    authorized_representative_ar TEXT,
    ar_license_number VARCHAR(50),
    
    -- 分类信息
    risk_class VARCHAR(20), -- Class A, B, C, D
    device_category TEXT,
    
    -- 注册信息
    application_type VARCHAR(50), -- New, Renewal, Amendment
    approval_status VARCHAR(20) DEFAULT 'Approved' CHECK (approval_status IN ('Approved', 'Rejected', 'Expired', 'Cancelled')),
    issue_date DATE,
    expiry_date DATE,
    
    -- 参考国家批准
    reference_country VARCHAR(100),
    reference_approval_number VARCHAR(100),
    reference_approval_date DATE,
    
    -- 元数据
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_source VARCHAR(50) DEFAULT 'SFDA_MDMA',
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 搜索优化
    search_vector TSVECTOR
);

-- SFDA企业许可表
CREATE TABLE IF NOT EXISTS sfda_establishment_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_number VARCHAR(50) UNIQUE NOT NULL,
    establishment_name TEXT NOT NULL,
    establishment_name_ar TEXT,
    establishment_type VARCHAR(50), -- Manufacturer, Importer, Distributor
    address TEXT,
    address_ar TEXT,
    license_status VARCHAR(20) DEFAULT 'Active',
    issue_date DATE,
    expiry_date DATE,
    activities TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. 通用索引和搜索优化
-- ============================================

-- HSA索引
CREATE INDEX IF NOT EXISTS idx_hsa_reg_number ON hsa_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_hsa_manufacturer ON hsa_registrations(manufacturer_name);
CREATE INDEX IF NOT EXISTS idx_hsa_status ON hsa_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_hsa_risk_class ON hsa_registrations(risk_class);
CREATE INDEX IF NOT EXISTS idx_hsa_expiry ON hsa_registrations(expiry_date);

-- PMDA索引
CREATE INDEX IF NOT EXISTS idx_pmda_approval_number ON pmda_approvals(approval_number);
CREATE INDEX IF NOT EXISTS idx_pmda_manufacturer ON pmda_approvals(manufacturer_name);
CREATE INDEX IF NOT EXISTS idx_pmda_status ON pmda_approvals(approval_status);
CREATE INDEX IF NOT EXISTS idx_pmda_classification ON pmda_approvals(classification);
CREATE INDEX IF NOT EXISTS idx_pmda_date ON pmda_approvals(approval_date);

-- SFDA索引
CREATE INDEX IF NOT EXISTS idx_sfda_mdma_number ON sfda_mdma(mdma_number);
CREATE INDEX IF NOT EXISTS idx_sfda_manufacturer ON sfda_mdma(manufacturer_name);
CREATE INDEX IF NOT EXISTS idx_sfda_status ON sfda_mdma(approval_status);
CREATE INDEX IF NOT EXISTS idx_sfda_risk_class ON sfda_mdma(risk_class);
CREATE INDEX IF NOT EXISTS idx_sfda_expiry ON sfda_mdma(expiry_date);

-- ============================================
-- 5. 全文搜索向量更新触发器
-- ============================================

-- HSA搜索向量更新
CREATE OR REPLACE FUNCTION update_hsa_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.device_name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.device_name_zh, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.manufacturer_name, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.manufacturer_name_zh, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.intended_use, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hsa_search_vector_update
    BEFORE INSERT OR UPDATE ON hsa_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_hsa_search_vector();

-- PMDA搜索向量更新
CREATE OR REPLACE FUNCTION update_pmda_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.device_name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.device_name_jp, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.manufacturer_name, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.manufacturer_name_jp, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.intended_use, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pmda_search_vector_update
    BEFORE INSERT OR UPDATE ON pmda_approvals
    FOR EACH ROW
    EXECUTE FUNCTION update_pmda_search_vector();

-- SFDA搜索向量更新
CREATE OR REPLACE FUNCTION update_sfda_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.device_name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.device_name_ar, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.manufacturer_name, '')), 'B') ||
        setweight(to_tsvector('simple', COALESCE(NEW.manufacturer_name_ar, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sfda_search_vector_update
    BEFORE INSERT OR UPDATE ON sfda_mdma
    FOR EACH ROW
    EXECUTE FUNCTION update_sfda_search_vector();

-- ============================================
-- 6. 统一搜索视图
-- ============================================

CREATE OR REPLACE VIEW unified_registrations AS
SELECT 
    id,
    registration_number as reg_number,
    device_name,
    manufacturer_name,
    'HSA' as authority,
    'Singapore' as country,
    risk_class as device_class,
    registration_status as status,
    registration_date as issue_date,
    expiry_date,
    search_vector
FROM hsa_registrations
WHERE registration_status = 'Active'

UNION ALL

SELECT 
    id,
    approval_number as reg_number,
    device_name,
    manufacturer_name,
    'PMDA' as authority,
    'Japan' as country,
    classification as device_class,
    approval_status as status,
    approval_date as issue_date,
    NULL as expiry_date,
    search_vector
FROM pmda_approvals
WHERE approval_status = 'Approved'

UNION ALL

SELECT 
    id,
    mdma_number as reg_number,
    device_name,
    manufacturer_name,
    'SFDA' as authority,
    'Saudi Arabia' as country,
    risk_class as device_class,
    approval_status as status,
    issue_date,
    expiry_date,
    search_vector
FROM sfda_mdma
WHERE approval_status = 'Approved';

-- ============================================
-- 7. 数据同步日志表
-- ============================================

CREATE TABLE IF NOT EXISTS data_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source VARCHAR(50) NOT NULL,
    sync_type VARCHAR(50) NOT NULL, -- Full, Incremental
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'Running' CHECK (status IN ('Running', 'Completed', 'Failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_source ON data_sync_logs(data_source);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON data_sync_logs(status);

-- ============================================
-- 8. 统计信息表
-- ============================================

CREATE TABLE IF NOT EXISTS regulatory_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    authority VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    stat_date DATE NOT NULL,
    total_registrations INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    active_registrations INTEGER DEFAULT 0,
    expired_registrations INTEGER DEFAULT 0,
    by_risk_class JSONB,
    by_device_category JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(authority, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_stats_authority ON regulatory_statistics(authority);
CREATE INDEX IF NOT EXISTS idx_stats_date ON regulatory_statistics(stat_date);

-- 添加注释
COMMENT ON TABLE hsa_registrations IS 'Singapore HSA medical device registrations from MEDICS';
COMMENT ON TABLE pmda_approvals IS 'Japan PMDA medical device approvals from NINSHO system';
COMMENT ON TABLE sfda_mdma IS 'Saudi Arabia SFDA MDMA registrations';
COMMENT ON VIEW unified_registrations IS 'Unified view of all international medical device registrations';

-- 初始化统计
INSERT INTO regulatory_statistics (authority, country, stat_date, total_registrations, active_registrations)
VALUES 
    ('HSA', 'Singapore', CURRENT_DATE, 0, 0),
    ('PMDA', 'Japan', CURRENT_DATE, 0, 0),
    ('SFDA', 'Saudi Arabia', CURRENT_DATE, 0, 0)
ON CONFLICT (authority, stat_date) DO NOTHING;