-- EMA (欧洲药品管理局) 注册信息表
CREATE TABLE IF NOT EXISTS ema_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- EUDAMED Actor/Organization 信息
    actor_id VARCHAR(100),
    actor_name VARCHAR(255),
    actor_name_en VARCHAR(255),
    actor_address TEXT,
    actor_country VARCHAR(100),
    srn VARCHAR(100), -- Single Registration Number
    
    -- 设备信息
    device_name TEXT,
    device_name_en TEXT,
    device_description TEXT,
    udi_di VARCHAR(255), -- Unique Device Identifier - Device Identifier
    udi_pi VARCHAR(255), -- Unique Device Identifier - Production Identifier
    
    -- 分类信息
    device_risk_class VARCHAR(50), -- Class I, IIa, IIb, III
    device_nomenclature_code VARCHAR(100), -- GMDN or EMDN code
    
    -- 注册状态
    registration_status VARCHAR(50), -- Active, Inactive, Suspended
    registration_date DATE,
    expiration_date DATE,
    
    -- 公告机构信息
    notified_body_name VARCHAR(255),
    notified_body_code VARCHAR(100),
    certificate_number VARCHAR(100),
    certificate_type VARCHAR(100), -- CE Certificate, Quality System Certificate
    
    -- 制造商信息
    manufacturer_name VARCHAR(255),
    manufacturer_address TEXT,
    manufacturer_country VARCHAR(100),
    
    -- 欧盟代表
    authorized_representative VARCHAR(255),
    ar_address TEXT,
    ar_country VARCHAR(100),
    
    -- 数据源
    source_url TEXT,
    eudamed_url TEXT,
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MHRA (英国药品和保健品管理局) 注册信息表
CREATE TABLE IF NOT EXISTS mhra_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 注册信息
    registration_number VARCHAR(100) NOT NULL,
    device_name TEXT,
    device_description TEXT,
    
    -- 设备分类 (UKCA分类)
    device_class VARCHAR(50), -- Class I, IIa, IIb, III, Active Implantable
    device_category VARCHAR(100), -- General Medical Device, IVD, Active Device, etc.
    gmdn_code VARCHAR(100), -- Global Medical Device Nomenclature
    
    -- 制造商信息
    manufacturer_name VARCHAR(255),
    manufacturer_address TEXT,
    manufacturer_country VARCHAR(100),
    
    -- 英国负责人 (UK Responsible Person)
    uk_responsible_person VARCHAR(255),
    ukrp_address TEXT,
    ukrp_country VARCHAR(100),
    
    -- 注册状态
    registration_status VARCHAR(50), -- Registered, Expired, Suspended, Cancelled
    registration_date DATE,
    expiration_date DATE,
    
    -- 批准机构
    approved_body_name VARCHAR(255), -- UK Approved Body (取代EU Notified Body)
    approved_body_number VARCHAR(100),
    certificate_number VARCHAR(100),
    
    -- 北爱尔兰特殊规定
    is_northern_ireland BOOLEAN DEFAULT FALSE, -- 是否适用北爱尔兰规则
    ni_notified_body VARCHAR(255), -- 北爱尔兰公告机构
    
    -- 数据源
    source_url TEXT,
    mhra_url TEXT,
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 警告信记录表 (Warning Letters)
CREATE TABLE IF NOT EXISTS regulatory_warning_letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 监管机构
    issuing_agency VARCHAR(100) NOT NULL, -- FDA, MHRA, etc.
    agency_country VARCHAR(100),
    
    -- 警告信信息
    letter_number VARCHAR(100),
    letter_date DATE,
    issue_date DATE,
    response_due_date DATE,
    
    -- 涉及产品/设施
    facility_name VARCHAR(255),
    facility_address TEXT,
    fei_number VARCHAR(100), -- FDA Establishment Identifier
    
    -- 违规详情
    violation_summary TEXT,
    violation_categories TEXT[], -- 违规类别数组
    cfr_references TEXT[], -- 违反的法规条款
    
    -- 状态
    status VARCHAR(50), -- Open, Closed, Under Review
    closure_date DATE,
    
    -- 文件链接
    letter_url TEXT,
    pdf_url TEXT,
    response_url TEXT,
    
    -- 原始数据
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 召回记录表 (Recall Records)
CREATE TABLE IF NOT EXISTS regulatory_recalls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- 监管机构
    issuing_agency VARCHAR(100) NOT NULL, -- FDA, MHRA, NMPA, etc.
    agency_country VARCHAR(100),
    
    -- 召回信息
    recall_number VARCHAR(100),
    recall_initiation_date DATE,
    recall_classification VARCHAR(50), -- Class I, II, III (FDA) / High, Medium, Low
    
    -- 产品信息
    product_name TEXT,
    product_code VARCHAR(100),
    product_description TEXT,
    udi_di VARCHAR(255),
    
    -- 召回详情
    recall_reason TEXT,
    health_risk_basis TEXT,
    voluntary_mandated VARCHAR(50), -- Voluntary, Mandated
    
    -- 分布信息
    distribution_pattern TEXT,
    distribution_countries TEXT[],
    
    -- 数量
    quantity_in_commerce INTEGER,
    units_affected VARCHAR(100),
    
    -- 状态
    recall_status VARCHAR(50), -- Ongoing, Completed, Terminated
    termination_date DATE,
    
    -- 纠正措施
    correction_action TEXT,
    root_cause TEXT,
    
    -- 文件链接
    recall_url TEXT,
    press_release_url TEXT,
    
    -- 原始数据
    raw_data JSONB,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_ema_actor_id ON ema_registrations(actor_id);
CREATE INDEX IF NOT EXISTS idx_ema_srn ON ema_registrations(srn);
CREATE INDEX IF NOT EXISTS idx_ema_device_name ON ema_registrations USING gin(to_tsvector('english', COALESCE(device_name, '')::text));
CREATE INDEX IF NOT EXISTS idx_ema_company_id ON ema_registrations(company_id);

CREATE INDEX IF NOT EXISTS idx_mhra_registration_number ON mhra_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_mhra_device_name ON mhra_registrations USING gin(to_tsvector('english', COALESCE(device_name, '')::text));
CREATE INDEX IF NOT EXISTS idx_mhra_company_id ON mhra_registrations(company_id);

CREATE INDEX IF NOT EXISTS idx_warning_letters_company ON regulatory_warning_letters(company_id);
CREATE INDEX IF NOT EXISTS idx_warning_letters_agency ON regulatory_warning_letters(issuing_agency);
CREATE INDEX IF NOT EXISTS idx_warning_letters_date ON regulatory_warning_letters(letter_date);
CREATE INDEX IF NOT EXISTS idx_warning_letters_status ON regulatory_warning_letters(status);

CREATE INDEX IF NOT EXISTS idx_recalls_company ON regulatory_recalls(company_id);
CREATE INDEX IF NOT EXISTS idx_recalls_agency ON regulatory_recalls(issuing_agency);
CREATE INDEX IF NOT EXISTS idx_recalls_date ON regulatory_recalls(recall_initiation_date);
CREATE INDEX IF NOT EXISTS idx_recalls_status ON regulatory_recalls(recall_status);
CREATE INDEX IF NOT EXISTS idx_recalls_classification ON regulatory_recalls(recall_classification);

-- 添加更新时间触发器
CREATE TRIGGER update_ema_registrations_updated_at BEFORE UPDATE ON ema_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mhra_registrations_updated_at BEFORE UPDATE ON mhra_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_warning_letters_updated_at BEFORE UPDATE ON regulatory_warning_letters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recalls_updated_at BEFORE UPDATE ON regulatory_recalls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 添加评论说明
COMMENT ON TABLE ema_registrations IS 'EMA/EUDAMED医疗器械注册信息';
COMMENT ON TABLE mhra_registrations IS 'MHRA英国医疗器械注册信息';
COMMENT ON TABLE regulatory_warning_letters IS '监管机构警告信记录';
COMMENT ON TABLE regulatory_recalls IS '医疗器械召回记录';
