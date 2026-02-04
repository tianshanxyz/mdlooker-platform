-- MDLooker Database Schema
-- 全球医疗器械合规数据平台

-- 公司基础信息表
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_zh VARCHAR(255),
    country VARCHAR(100),
    address TEXT,
    website VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(100),
    business_type VARCHAR(100),
    established_year INTEGER,
    employee_count VARCHAR(50),
    description TEXT,
    description_zh TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FDA 注册信息表
CREATE TABLE IF NOT EXISTS fda_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    fei_number VARCHAR(50),
    registration_number VARCHAR(100),
    owner_operator_number VARCHAR(100),
    registration_status VARCHAR(50),
    registration_date DATE,
    expiration_date DATE,
    product_code VARCHAR(50),
    device_class VARCHAR(10),
    device_name TEXT,
    device_description TEXT,
    regulation_number VARCHAR(50),
    establishment_type VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(20),
    country VARCHAR(100),
    source_url TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NMPA 注册信息表
CREATE TABLE IF NOT EXISTS nmpa_registrations (
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

-- EUDAMED 注册信息表
CREATE TABLE IF NOT EXISTS eudamed_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    actor_id VARCHAR(100),
    actor_type VARCHAR(100),
    actor_name VARCHAR(255),
    actor_name_en VARCHAR(255),
    actor_address TEXT,
    country VARCHAR(100),
    srn VARCHAR(100),
    registration_status VARCHAR(50),
    registration_date DATE,
    device_name TEXT,
    device_description TEXT,
    udi_di VARCHAR(255),
    nca VARCHAR(100),
    notified_body VARCHAR(255),
    certificate_number VARCHAR(100),
    source_url TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PMDA (日本) 注册信息表
CREATE TABLE IF NOT EXISTS pmda_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    approval_number VARCHAR(100) NOT NULL,
    product_name VARCHAR(500),
    product_name_jp VARCHAR(500),
    manufacturer VARCHAR(255),
    manufacturer_jp VARCHAR(255),
    manufacturer_address TEXT,
    marketing_authorization_holder VARCHAR(255),
    marketing_authorization_holder_jp VARCHAR(255),
    device_classification VARCHAR(50),
    approval_date DATE,
    expiration_date DATE,
    product_description TEXT,
    intended_use TEXT,
    source_url TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health Canada (加拿大) 注册信息表
CREATE TABLE IF NOT EXISTS health_canada_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    device_identifier VARCHAR(100) NOT NULL,
    company_name VARCHAR(255),
    device_name VARCHAR(500),
    device_name_fr VARCHAR(500),
    device_class VARCHAR(50),
    licence_number VARCHAR(100),
    licence_status VARCHAR(50),
    issue_date DATE,
    expiry_date DATE,
    device_description TEXT,
    intended_use TEXT,
    source_url TEXT,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 产品信息表
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(500) NOT NULL,
    name_zh VARCHAR(500),
    description TEXT,
    description_zh TEXT,
    category VARCHAR(200),
    intended_use TEXT,
    model_number VARCHAR(200),
    brand_name VARCHAR(200),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 数据同步日志表
CREATE TABLE IF NOT EXISTS sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source VARCHAR(100) NOT NULL,
    sync_type VARCHAR(50) NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 搜索索引（用于全文搜索）
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_companies_name_zh ON companies USING gin(to_tsvector('simple', name_zh));
CREATE INDEX IF NOT EXISTS idx_fda_device_name ON fda_registrations USING gin(to_tsvector('english', device_name));
CREATE INDEX IF NOT EXISTS idx_nmpa_product_name ON nmpa_registrations USING gin(to_tsvector('simple', product_name_zh));
CREATE INDEX IF NOT EXISTS idx_pmda_product_name ON pmda_registrations USING gin(to_tsvector('simple', product_name_jp));
CREATE INDEX IF NOT EXISTS idx_health_canada_device_name ON health_canada_registrations USING gin(to_tsvector('english', device_name));

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fda_registrations_updated_at BEFORE UPDATE ON fda_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nmpa_registrations_updated_at BEFORE UPDATE ON nmpa_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eudamed_registrations_updated_at BEFORE UPDATE ON eudamed_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pmda_registrations_updated_at BEFORE UPDATE ON pmda_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_canada_registrations_updated_at BEFORE UPDATE ON health_canada_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
