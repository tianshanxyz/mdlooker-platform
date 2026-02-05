-- 增强公司信息表
-- 添加更多字段以支持类似企查查的信息展示

-- 添加新列到 companies 表
ALTER TABLE companies ADD COLUMN IF NOT EXISTS legal_representative VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS registered_capital VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS registration_number VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS unified_social_credit_code VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS business_status VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS business_scope TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS tax_identification_number VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS organization_code VARCHAR(50);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS import_export_license VARCHAR(100);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS gmp_certificates JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS iso_certificates JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS risk_info JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS shareholders JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS branches JSONB DEFAULT '[]';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS intellectual_property JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS financial_info JSONB DEFAULT '{}';
ALTER TABLE companies ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}';

-- 创建公司变更记录表
CREATE TABLE IF NOT EXISTS company_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    change_type VARCHAR(100) NOT NULL,
    change_content TEXT,
    change_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建法律诉讼记录表
CREATE TABLE IF NOT EXISTS company_litigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    case_number VARCHAR(100),
    case_type VARCHAR(100),
    court VARCHAR(255),
    case_date DATE,
    case_status VARCHAR(50),
    case_amount DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建经营异常记录表
CREATE TABLE IF NOT EXISTS company_abnormal_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    reason TEXT,
    decision_date DATE,
    decision_authority VARCHAR(255),
    removal_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建专利信息表
CREATE TABLE IF NOT EXISTS company_patents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    patent_number VARCHAR(100),
    patent_name VARCHAR(500),
    patent_type VARCHAR(50),
    application_date DATE,
    publication_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建商标信息表
CREATE TABLE IF NOT EXISTS company_trademarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    trademark_name VARCHAR(255),
    registration_number VARCHAR(100),
    category VARCHAR(100),
    application_date DATE,
    status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建分支机构表
CREATE TABLE IF NOT EXISTS company_branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    branch_name VARCHAR(255),
    branch_address TEXT,
    branch_status VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 更新时间触发器
CREATE TRIGGER update_company_changes_updated_at BEFORE UPDATE ON company_changes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 更新示例数据
UPDATE companies SET 
    legal_representative = 'John Smith',
    registered_capital = '$50,000,000',
    registration_number = 'DE123456789',
    unified_social_credit_code = '91310000MA1FL1QH2J',
    business_status = 'Active',
    business_scope = 'Medical device manufacturing, R&D, sales and service',
    tax_identification_number = 'DE123456789',
    organization_code = 'MA1FL1QH-2',
    import_export_license = 'IEC-2024-001',
    gmp_certificates = '["ISO 13485:2016", "FDA GMP", "EU MDR"]'::jsonb,
    iso_certificates = '["ISO 9001", "ISO 13485", "ISO 27001"]'::jsonb,
    shareholders = '[{"name": "John Smith", "percentage": 45}, {"name": "Investment Fund A", "percentage": 30}, {"name": "Public Shareholders", "percentage": 25}]'::jsonb,
    intellectual_property = '{"patents": 156, "trademarks": 23, "software_copyrights": 8}'::jsonb,
    contact_info = '{"phone": "+49-89-12345678", "fax": "+49-89-12345679", "email": "contact@siemens-healthineers.com"}'::jsonb
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

UPDATE companies SET 
    legal_representative = 'Omar Ishrak',
    registered_capital = '$100,000,000',
    registration_number = 'US987654321',
    unified_social_credit_code = '91310000MA1FL2QH3K',
    business_status = 'Active',
    business_scope = 'Medical technology, devices, and services',
    tax_identification_number = 'US987654321',
    organization_code = 'MA1FL2QH-3',
    import_export_license = 'IEC-2024-002',
    gmp_certificates = '["FDA GMP", "ISO 13485:2016"]'::jsonb,
    iso_certificates = '["ISO 9001", "ISO 13485"]'::jsonb,
    shareholders = '[{"name": "Omar Ishrak", "percentage": 35}, {"name": "Institutional Investors", "percentage": 40}, {"name": "Public Shareholders", "percentage": 25}]'::jsonb,
    intellectual_property = '{"patents": 4890, "trademarks": 156, "software_copyrights": 234}'::jsonb,
    contact_info = '{"phone": "+1-763-514-4000", "fax": "+1-763-514-4001", "email": "contact@medtronic.com"}'::jsonb
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- 插入分支机构示例数据
INSERT INTO company_branches (company_id, branch_name, branch_address, branch_status) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Siemens Healthineers China', 'Shanghai, China', 'Active'),
('550e8400-e29b-41d4-a716-446655440002', 'Siemens Healthineers USA', 'Pennsylvania, USA', 'Active'),
('550e8400-e29b-41d4-a716-446655440000', 'Medtronic China', 'Shanghai, China', 'Active'),
('550e8400-e29b-41d4-a716-446655440000', 'Medtronic Europe', 'Dublin, Ireland', 'Active');

-- 插入专利示例数据
INSERT INTO company_patents (company_id, patent_number, patent_name, patent_type, application_date, publication_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'US10,123,456', 'Magnetic Resonance Imaging System', 'Invention', '2018-03-15', '2020-08-20', 'Granted'),
('550e8400-e29b-41d4-a716-446655440002', 'US10,234,567', 'Computed Tomography Scanner', 'Invention', '2017-06-22', '2019-11-10', 'Granted'),
('550e8400-e29b-41d4-a716-446655440000', 'US9,876,543', 'Cardiac Pacemaker System', 'Invention', '2015-01-10', '2017-05-15', 'Granted'),
('550e8400-e29b-41d4-a716-446655440000', 'US9,765,432', 'Insulin Pump Device', 'Invention', '2014-09-05', '2016-12-20', 'Granted');

-- 插入商标示例数据
INSERT INTO company_trademarks (company_id, trademark_name, registration_number, category, application_date, status) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'Siemens Healthineers', 'TM123456', 'Medical Devices', '2015-01-20', 'Active'),
('550e8400-e29b-41d4-a716-446655440002', 'MAGNETOM', 'TM234567', 'Medical Imaging', '2010-05-15', 'Active'),
('550e8400-e29b-41d4-a716-446655440000', 'Medtronic', 'TM987654', 'Medical Devices', '2000-03-10', 'Active'),
('550e8400-e29b-41d4-a716-446655440000', 'MiniMed', 'TM876543', 'Diabetes Care', '2005-08-22', 'Active');
