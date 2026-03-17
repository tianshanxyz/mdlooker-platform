-- MDLooker Database Migration: Product Registration Tables
-- 产品注册追踪数据库
-- Created: 2026-03-15

-- 产品基础信息表
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    product_name VARCHAR(500) NOT NULL,
    product_name_en VARCHAR(500),
    product_name_zh VARCHAR(500),
    model_number VARCHAR(200),
    udi_di VARCHAR(255), -- UDI Device Identifier
    product_category VARCHAR(100), -- 产品分类
    device_class_us VARCHAR(10), -- FDA 分类
    device_class_eu VARCHAR(10), -- EU MDR 分类
    device_class_cn VARCHAR(10), -- NMPA 分类
    description TEXT,
    description_zh TEXT,
    intended_use TEXT,
    intended_use_zh TEXT,
    specifications TEXT,
    manufacturer_name VARCHAR(255),
    manufacturer_country VARCHAR(100),
    registration_status VARCHAR(50), -- active, expired, pending, cancelled
    first_approval_date DATE,
    latest_approval_date DATE,
    total_registrations INTEGER DEFAULT 0, -- 全球注册国家数量
    source_url TEXT,
    data_source VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品 - 国家注册关联表
CREATE TABLE IF NOT EXISTS product_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(10),
    regulatory_agency_id UUID REFERENCES regulatory_agencies(id),
    registration_number VARCHAR(200) NOT NULL, -- 注册证号
    registration_status VARCHAR(50) NOT NULL, -- approved, pending, rejected, expired, cancelled
    registration_type VARCHAR(100), -- 510k, PMA, CE, NMPA, etc.
    approval_date DATE,
    expiration_date DATE,
    original_approval_date DATE, -- 首次获批日期
    certificate_url TEXT, -- 证书链接
    product_classification VARCHAR(100), -- 在当地的产品分类
    indication_for_use TEXT, -- 适用范围
    notes TEXT, -- 备注信息
    source_url TEXT,
    data_source VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品注册时间线表
CREATE TABLE IF NOT EXISTS product_registration_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES product_registrations(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- application, approval, renewal, change, cancellation
    event_date DATE NOT NULL,
    event_description TEXT,
    event_description_zh TEXT,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_udi ON products(udi_di);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(product_category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(registration_status);

CREATE INDEX IF NOT EXISTS idx_product_registrations_product ON product_registrations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_registrations_country ON product_registrations(country);
CREATE INDEX IF NOT EXISTS idx_product_registrations_status ON product_registrations(registration_status);
CREATE INDEX IF NOT EXISTS idx_product_registrations_number ON product_registrations(registration_number);

CREATE INDEX IF NOT EXISTS idx_product_timeline_registration ON product_registration_timeline(registration_id);
CREATE INDEX IF NOT EXISTS idx_product_timeline_event_type ON product_registration_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_product_timeline_event_date ON product_registration_timeline(event_date);

-- 添加注释
COMMENT ON TABLE products IS '医疗器械产品基础信息表';
COMMENT ON COLUMN products.udi_di IS '唯一设备标识符 (UDI-DI)';
COMMENT ON COLUMN products.product_category IS '产品类别 (如：影像设备、体外诊断、植入物等)';
COMMENT ON COLUMN products.device_class_us IS 'FDA 分类 (Class I/II/III)';
COMMENT ON COLUMN products.device_class_eu IS 'EU MDR 分类 (Class I/IIa/IIb/III)';
COMMENT ON COLUMN products.device_class_cn IS 'NMPA 分类 (Class I/II/III)';
COMMENT ON COLUMN products.intended_use IS '预期用途';
COMMENT ON COLUMN products.total_registrations IS '全球注册国家数量';

COMMENT ON TABLE product_registrations IS '产品 - 国家注册关联表';
COMMENT ON COLUMN product_registrations.registration_type IS '注册类型 (如：510(k), PMA, CE Mark, NMPA Register)';
COMMENT ON COLUMN product_registrations.original_approval_date IS '首次获批日期 (用于计算注册时间线)';
COMMENT ON COLUMN product_registrations.product_classification IS '在产品注册国的分类';
COMMENT ON COLUMN product_registrations.indication_for_use IS '适用范围/适应症';

COMMENT ON TABLE product_registration_timeline IS '产品注册时间线表';
COMMENT ON COLUMN product_registration_timeline.event_type IS '事件类型：application(申请), approval(获批), renewal(延续), change(变更), cancellation(注销)';

-- 创建更新触发器
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_registrations_updated_at
    BEFORE UPDATE ON product_registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建统计视图：产品全球注册统计
CREATE OR REPLACE VIEW product_global_stats AS
SELECT 
    p.id AS product_id,
    p.product_name,
    p.company_id,
    COUNT(DISTINCT pr.country) AS total_countries,
    COUNT(CASE WHEN pr.registration_status = 'approved' THEN 1 END) AS approved_count,
    COUNT(CASE WHEN pr.registration_status = 'pending' THEN 1 END) AS pending_count,
    COUNT(CASE WHEN pr.registration_status = 'expired' THEN 1 END) AS expired_count,
    ARRAY_AGG(DISTINCT pr.country) FILTER (WHERE pr.registration_status = 'approved') AS approved_countries,
    MIN(pr.approval_date) AS first_approval_date,
    MAX(pr.approval_date) AS latest_approval_date
FROM products p
LEFT JOIN product_registrations pr ON p.id = pr.product_id
GROUP BY p.id, p.product_name, p.company_id;

-- 创建统计视图：国家注册地图数据
CREATE OR REPLACE VIEW country_registration_map AS
SELECT 
    pr.country,
    pr.country_code,
    COUNT(*) AS total_products,
    COUNT(CASE WHEN pr.registration_status = 'approved' THEN 1 END) AS approved_products,
    ARRAY_AGG(DISTINCT p.product_name) AS product_names
FROM product_registrations pr
JOIN products p ON pr.product_id = p.id
GROUP BY pr.country, pr.country_code
ORDER BY total_products DESC;

-- 权限设置
-- GRANT SELECT ON products, product_registrations, product_registration_timeline TO PUBLIC;
-- GRANT ALL ON products, product_registrations, product_registration_timeline TO mdlooker_admin;
