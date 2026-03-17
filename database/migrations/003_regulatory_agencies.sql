-- MDLooker Database Migration: Regulatory Agencies Tables
-- 全球监管机构数据库
-- Created: 2026-03-15

-- 监管机构表
CREATE TABLE IF NOT EXISTS regulatory_agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(100) NOT NULL,
    country_code VARCHAR(10),
    agency_name VARCHAR(255) NOT NULL,
    agency_name_en VARCHAR(255),
    agency_name_zh VARCHAR(255),
    agency_type VARCHAR(50), -- national, regional, local
    jurisdiction TEXT,
    official_website VARCHAR(500),
    database_url VARCHAR(500),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(100),
    contact_fax VARCHAR(100),
    contact_address TEXT,
    description TEXT,
    description_zh TEXT,
    establishment_date DATE,
    parent_organization VARCHAR(255),
    regulatory_framework TEXT,
    device_classification_system TEXT,
    approval_process_description TEXT,
    average_approval_time VARCHAR(100),
    official_fees TEXT,
    languages_supported TEXT[],
    data_source VARCHAR(100),
    source_url TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_regulatory_agencies_country ON regulatory_agencies(country);
CREATE INDEX IF NOT EXISTS idx_regulatory_agencies_country_code ON regulatory_agencies(country_code);
CREATE INDEX IF NOT EXISTS idx_regulatory_agencies_name ON regulatory_agencies(agency_name);
CREATE INDEX IF NOT EXISTS idx_regulatory_agencies_type ON regulatory_agencies(agency_type);

-- 添加注释
COMMENT ON TABLE regulatory_agencies IS '全球医疗器械监管机构信息表';
COMMENT ON COLUMN regulatory_agencies.country IS '国家/地区名称';
COMMENT ON COLUMN regulatory_agencies.country_code IS '国家/地区代码 (如 US, CN, EU)';
COMMENT ON COLUMN regulatory_agencies.agency_name IS '监管机构英文名称';
COMMENT ON COLUMN regulatory_agencies.agency_name_en IS '监管机构英文名称 (备用)';
COMMENT ON COLUMN regulatory_agencies.agency_name_zh IS '监管机构中文名称';
COMMENT ON COLUMN regulatory_agencies.agency_type IS '机构类型：national(国家级), regional(区域级), local(地方级)';
COMMENT ON COLUMN regulatory_agencies.jurisdiction IS '管辖范围描述';
COMMENT ON COLUMN regulatory_agencies.official_website IS '官方网站 URL';
COMMENT ON COLUMN regulatory_agencies.database_url IS '官方数据库/查询系统 URL';
COMMENT ON COLUMN regulatory_agencies.contact_email IS '联系邮箱';
COMMENT ON COLUMN regulatory_agencies.contact_phone IS '联系电话';
COMMENT ON COLUMN regulatory_agencies.contact_fax IS '联系传真';
COMMENT ON COLUMN regulatory_agencies.contact_address IS '联系地址';
COMMENT ON COLUMN regulatory_agencies.description IS '机构简介 (英文)';
COMMENT ON COLUMN regulatory_agencies.description_zh IS '机构简介 (中文)';
COMMENT ON COLUMN regulatory_agencies.establishment_date IS '成立日期';
COMMENT ON COLUMN regulatory_agencies.parent_organization IS '上级机构';
COMMENT ON COLUMN regulatory_agencies.regulatory_framework IS '监管体系说明';
COMMENT ON COLUMN regulatory_agencies.device_classification_system IS '医疗器械分类系统';
COMMENT ON COLUMN regulatory_agencies.approval_process_description IS '审批流程说明';
COMMENT ON COLUMN regulatory_agencies.average_approval_time IS '平均审批时间';
COMMENT ON COLUMN regulatory_agencies.official_fees IS '官方费用标准';
COMMENT ON COLUMN regulatory_agencies.languages_supported IS '支持的语言列表';
COMMENT ON COLUMN regulatory_agencies.data_source IS '数据来源';
COMMENT ON COLUMN regulatory_agencies.source_url IS '数据来源 URL';
COMMENT ON COLUMN regulatory_agencies.verified IS '是否已验证';

-- 创建更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_regulatory_agencies_updated_at
    BEFORE UPDATE ON regulatory_agencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 权限设置 (如果需要)
-- GRANT SELECT ON regulatory_agencies TO PUBLIC;
-- GRANT ALL ON regulatory_agencies TO mdlooker_admin;
