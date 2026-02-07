-- 添加更多监管机构数据源表
-- TGA (澳大利亚)、HSA (新加坡)、Swissmedic (瑞士)、MFDS (韩国)、ANVISA (巴西)

-- TGA (Therapeutic Goods Administration) 澳大利亚注册信息表
CREATE TABLE IF NOT EXISTS tga_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- ARTG (Australian Register of Therapeutic Goods) 信息
    artg_id VARCHAR(100),
    artg_number VARCHAR(100) NOT NULL,
    
    -- 产品信息
    product_name TEXT,
    device_description TEXT,
    
    -- 分类信息
    device_class VARCHAR(50), -- Class I, IIa, IIb, III, AIMD
    gmdn_code VARCHAR(100),
    
    -- 制造商信息
    manufacturer_name VARCHAR(255),
    manufacturer_address TEXT,
    manufacturer_country VARCHAR(100),
    
    -- 赞助商信息 (Sponsor)
    sponsor_name VARCHAR(255),
    sponsor_address TEXT,
    
    -- 注册状态
    registration_status VARCHAR(50), -- Active, Cancelled, Expired
    registration_date DATE,
    expiry_date DATE,
    
    -- 批准机构
    conformity_assessment_body VARCHAR(255),
    
    -- 数据源
    source_url TEXT,
    tga_url TEXT,
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HSA (Health Sciences Authority) 新加坡注册信息表
CREATE TABLE IF NOT EXISTS hsa_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 注册信息
    registration_number VARCHAR(100) NOT NULL,
    device_name TEXT,
    device_description TEXT,
    
    -- 分类信息
    device_class VARCHAR(50), -- Class A, B, C, D
    device_category VARCHAR(100),
    
    -- 制造商信息
    manufacturer_name VARCHAR(255),
    manufacturer_address TEXT,
    manufacturer_country VARCHAR(100),
    
    -- 注册人信息 (Registrant)
    registrant_name VARCHAR(255),
    registrant_address TEXT,
    
    -- 注册状态
    registration_status VARCHAR(50), -- Active, Expired, Cancelled
    registration_date DATE,
    expiry_date DATE,
    
    -- 数据源
    source_url TEXT,
    hsa_url TEXT,
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Swissmedic (瑞士) 注册信息表
CREATE TABLE IF NOT EXISTS swissmedic_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Swissmedic注册号
    swissmedic_number VARCHAR(100) NOT NULL,
    
    -- 产品信息
    product_name TEXT,
    product_name_de TEXT, -- 德语名称
    product_name_fr TEXT, -- 法语名称
    product_name_it TEXT, -- 意大利语名称
    device_description TEXT,
    
    -- 分类信息 (基于MDR)
    device_risk_class VARCHAR(50), -- Class I, IIa, IIb, III
    
    -- 制造商信息
    manufacturer_name VARCHAR(255),
    manufacturer_address TEXT,
    manufacturer_country VARCHAR(100),
    
    -- 瑞士授权代表 (CH-REP)
    swiss_authorized_representative VARCHAR(255),
    chrep_address TEXT,
    
    -- 注册状态
    registration_status VARCHAR(50),
    registration_date DATE,
    expiry_date DATE,
    
    -- 公告机构
    notified_body_name VARCHAR(255),
    notified_body_number VARCHAR(100),
    
    -- 数据源
    source_url TEXT,
    swissmedic_url TEXT,
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MFDS (Ministry of Food and Drug Safety) 韩国注册信息表
CREATE TABLE IF NOT EXISTS mfds_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 韩国注册号
    product_approval_number VARCHAR(100) NOT NULL, -- 품목허가번호
    
    -- 产品信息
    product_name TEXT,
    product_name_ko TEXT, -- 韩语名称
    device_description TEXT,
    model_name VARCHAR(255),
    
    -- 分类信息
    device_class VARCHAR(50), -- Class I, II, III, IV
    classification_code VARCHAR(100), -- 분류번호
    
    -- 制造商信息
    manufacturer_name VARCHAR(255),
    manufacturer_name_ko VARCHAR(255),
    manufacturer_address TEXT,
    manufacturer_country VARCHAR(100),
    
    -- 韩国许可证持有人
    korea_license_holder VARCHAR(255),
    klh_address TEXT,
    
    -- 注册状态
    approval_status VARCHAR(50), -- Approved, Cancelled, Suspended
    approval_date DATE,
    expiry_date DATE,
    
    -- 数据源
    source_url TEXT,
    mfds_url TEXT,
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ANVISA (Agência Nacional de Vigilância Sanitária) 巴西注册信息表
CREATE TABLE IF NOT EXISTS anvisa_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- ANVISA注册号
    registration_number VARCHAR(100) NOT NULL, -- Número de Registro
    
    -- 产品信息
    product_name TEXT,
    product_name_pt TEXT, -- 葡萄牙语名称
    device_description TEXT,
    
    -- 分类信息 (RDC 185/2001)
    risk_class VARCHAR(50), -- Class I, II, III, IV
    
    -- 制造商信息
    manufacturer_name VARCHAR(255),
    manufacturer_address TEXT,
    manufacturer_country VARCHAR(100),
    
    -- 巴西注册持有人 (BRH)
    brazil_registration_holder VARCHAR(255),
    brh_address TEXT,
    brh_cnpj VARCHAR(50),
    
    -- 注册状态
    registration_status VARCHAR(50), -- Active, Cancelled, Suspended
    registration_date DATE,
    expiry_date DATE,
    
    -- 数据源
    source_url TEXT,
    anvisa_url TEXT,
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_tga_artg_number ON tga_registrations(artg_number);
CREATE INDEX IF NOT EXISTS idx_tga_device_name ON tga_registrations USING gin(to_tsvector('english', COALESCE(product_name, '')::text));
CREATE INDEX IF NOT EXISTS idx_tga_company_id ON tga_registrations(company_id);

CREATE INDEX IF NOT EXISTS idx_hsa_registration_number ON hsa_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_hsa_device_name ON hsa_registrations USING gin(to_tsvector('english', COALESCE(device_name, '')::text));
CREATE INDEX IF NOT EXISTS idx_hsa_company_id ON hsa_registrations(company_id);

CREATE INDEX IF NOT EXISTS idx_swissmedic_number ON swissmedic_registrations(swissmedic_number);
CREATE INDEX IF NOT EXISTS idx_swissmedic_device_name ON swissmedic_registrations USING gin(to_tsvector('english', COALESCE(product_name, '')::text));
CREATE INDEX IF NOT EXISTS idx_swissmedic_company_id ON swissmedic_registrations(company_id);

CREATE INDEX IF NOT EXISTS idx_mfds_approval_number ON mfds_registrations(product_approval_number);
CREATE INDEX IF NOT EXISTS idx_mfds_device_name ON mfds_registrations USING gin(to_tsvector('english', COALESCE(product_name, '')::text));
CREATE INDEX IF NOT EXISTS idx_mfds_company_id ON mfds_registrations(company_id);

CREATE INDEX IF NOT EXISTS idx_anvisa_registration_number ON anvisa_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_anvisa_device_name ON anvisa_registrations USING gin(to_tsvector('english', COALESCE(product_name, '')::text));
CREATE INDEX IF NOT EXISTS idx_anvisa_company_id ON anvisa_registrations(company_id);

-- 添加更新时间触发器
CREATE TRIGGER update_tga_registrations_updated_at BEFORE UPDATE ON tga_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hsa_registrations_updated_at BEFORE UPDATE ON hsa_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_swissmedic_registrations_updated_at BEFORE UPDATE ON swissmedic_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mfds_registrations_updated_at BEFORE UPDATE ON mfds_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anvisa_registrations_updated_at BEFORE UPDATE ON anvisa_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加评论说明
COMMENT ON TABLE tga_registrations IS 'TGA澳大利亚医疗器械注册信息';
COMMENT ON TABLE hsa_registrations IS 'HSA新加坡医疗器械注册信息';
COMMENT ON TABLE swissmedic_registrations IS 'Swissmedic瑞士医疗器械注册信息';
COMMENT ON TABLE mfds_registrations IS 'MFDS韩国医疗器械注册信息';
COMMENT ON TABLE anvisa_registrations IS 'ANVISA巴西医疗器械注册信息';
