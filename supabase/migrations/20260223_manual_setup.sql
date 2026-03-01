-- ============================================
-- MDLooker 国际医疗器械监管数据库 - 手动设置脚本
-- 请在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. 新加坡HSA注册产品表
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
    risk_class VARCHAR(10) CHECK (risk_class IN ('A', 'B', 'C', 'D')),
    device_category TEXT,
    gmdn_code VARCHAR(20),
    registration_type VARCHAR(50),
    registration_status VARCHAR(20) DEFAULT 'Active',
    registration_date DATE,
    expiry_date DATE,
    intended_use TEXT,
    indications_for_use TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_source VARCHAR(50) DEFAULT 'HSA_MEDICS',
    last_sync_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 日本PMDA批准产品表
CREATE TABLE IF NOT EXISTS pmda_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_number VARCHAR(50) UNIQUE NOT NULL,
    marketing_authorization_number VARCHAR(50),
    device_name TEXT NOT NULL,
    device_name_jp TEXT,
    generic_name TEXT,
    brand_name TEXT,
    manufacturer_name TEXT NOT NULL,
    manufacturer_name_jp TEXT,
    manufacturer_country VARCHAR(100),
    marketing_authorization_holder TEXT,
    marketing_authorization_holder_jp TEXT,
    classification VARCHAR(20),
    classification_code VARCHAR(20),
    ninsyo_category VARCHAR(50),
    approval_type VARCHAR(50),
    approval_status VARCHAR(20) DEFAULT 'Approved',
    approval_date DATE,
    effective_date DATE,
    intended_use TEXT,
    intended_use_jp TEXT,
    indications TEXT,
    indications_jp TEXT,
    attached_documents JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_source VARCHAR(50) DEFAULT 'PMDA_NINSHO',
    last_sync_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 沙特SFDA MDMA注册表
CREATE TABLE IF NOT EXISTS sfda_mdma (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mdma_number VARCHAR(50) UNIQUE NOT NULL,
    gmdn_term TEXT,
    gmdn_code VARCHAR(20),
    device_name TEXT NOT NULL,
    device_name_ar TEXT,
    model_number VARCHAR(100),
    manufacturer_name TEXT NOT NULL,
    manufacturer_name_ar TEXT,
    manufacturer_country VARCHAR(100),
    manufacturing_site TEXT,
    authorized_representative TEXT,
    authorized_representative_ar TEXT,
    ar_license_number VARCHAR(50),
    risk_class VARCHAR(20),
    device_category TEXT,
    application_type VARCHAR(50),
    approval_status VARCHAR(20) DEFAULT 'Approved',
    issue_date DATE,
    expiry_date DATE,
    reference_country VARCHAR(100),
    reference_approval_number VARCHAR(100),
    reference_approval_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    data_source VARCHAR(50) DEFAULT 'SFDA_MDMA',
    last_sync_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 数据同步日志表
CREATE TABLE IF NOT EXISTS data_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source VARCHAR(50) NOT NULL,
    sync_type VARCHAR(50) NOT NULL,
    records_processed INTEGER DEFAULT 0,
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'Running',
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 创建索引
CREATE INDEX IF NOT EXISTS idx_hsa_reg_number ON hsa_registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_hsa_manufacturer ON hsa_registrations(manufacturer_name);
CREATE INDEX IF NOT EXISTS idx_hsa_status ON hsa_registrations(registration_status);

CREATE INDEX IF NOT EXISTS idx_pmda_approval_number ON pmda_approvals(approval_number);
CREATE INDEX IF NOT EXISTS idx_pmda_manufacturer ON pmda_approvals(manufacturer_name);
CREATE INDEX IF NOT EXISTS idx_pmda_status ON pmda_approvals(approval_status);

CREATE INDEX IF NOT EXISTS idx_sfda_mdma_number ON sfda_mdma(mdma_number);
CREATE INDEX IF NOT EXISTS idx_sfda_manufacturer ON sfda_mdma(manufacturer_name);
CREATE INDEX IF NOT EXISTS idx_sfda_status ON sfda_mdma(approval_status);

-- 6. 插入示例数据

-- HSA示例数据
INSERT INTO hsa_registrations (
    registration_number, device_name, device_name_zh, manufacturer_name,
    manufacturer_address, local_representative, product_owner, risk_class,
    device_category, gmdn_code, registration_type, registration_status,
    registration_date, expiry_date, intended_use, indications_for_use
) VALUES 
('DE0001234', 'Cardiac Monitor', '心脏监护仪', 'MedTech Solutions Pte Ltd',
 '123 Tech Park, Singapore 123456', 'Local Rep Pte Ltd', 'MedTech Global Inc',
 'B', 'Active Medical Device', '12345', 'Full', 'Active',
 '2024-01-15', '2029-01-14', 'For continuous monitoring of cardiac activity',
 'Adult patients in healthcare facilities'),

('DE0001235', 'Surgical Sutures', '外科缝合线', 'SutureTech Manufacturing',
 '456 Industrial Ave, Singapore 456789', 'MedSupply Singapore', 'SutureTech Global',
 'A', 'Non-Active Medical Device', '23456', 'Immediate', 'Active',
 '2024-02-01', '2029-01-31', 'For wound closure in surgical procedures',
 'General surgery applications'),

('DE0001236', 'Insulin Pump', '胰岛素泵', 'Diabetes Care Systems',
 '789 Health Blvd, Singapore 789012', 'Diabetes Solutions SG', 'Diabetes Care International',
 'C', 'Active Medical Device', '34567', 'Full', 'Active',
 '2023-12-10', '2028-12-09', 'For subcutaneous delivery of insulin',
 'Diabetes mellitus management'),

('DE0001237', 'Implantable Pacemaker', '植入式心脏起搏器', 'Cardiac Devices Inc',
 '321 Heart Center, Singapore 321654', 'Cardiac Solutions Pte Ltd', 'Cardiac Devices Global',
 'D', 'Active Implantable Device', '45678', 'Full', 'Active',
 '2023-11-20', '2028-11-19', 'For management of cardiac arrhythmias',
 'Patients with bradycardia or heart block')
ON CONFLICT (registration_number) DO NOTHING;

-- PMDA示例数据
INSERT INTO pmda_approvals (
    approval_number, device_name, device_name_jp, manufacturer_name,
    manufacturer_name_jp, classification, approval_date, approval_status
) VALUES 
('23000BZX00011000', 'MRI System', 'MRI装置', 'Siemens Healthineers Japan',
 'シーメンスヘルスケア株式会社', 'Class III', '2024-01-20', 'Approved'),

('23000BZX00022000', 'Digital X-Ray System', 'デジタルX線診断装置', 'Canon Medical Systems',
 'キヤノンメディカルシステムズ株式会社', 'Class II', '2024-02-15', 'Approved'),

('23000BZX00033000', 'Dialysis Machine', '人工透析装置', 'Fresenius Medical Care Japan',
 'フレゼニウス・メディカル・ケア・ジャパン株式会社', 'Class III', '2023-12-05', 'Approved')
ON CONFLICT (approval_number) DO NOTHING;

-- SFDA示例数据
INSERT INTO sfda_mdma (
    mdma_number, device_name, device_name_ar, manufacturer_name,
    manufacturer_name_ar, risk_class, issue_date, expiry_date, approval_status
) VALUES 
('MDMA-2024-0001234', 'Patient Monitor', 'مراقب المريض', 'Philips Healthcare',
 'فيليبس للرعاية الصحية', 'Class B', '2024-01-10', '2027-01-09', 'Approved'),

('MDMA-2024-0001235', 'Infusion Pump', 'مضخة الحقن', 'Becton Dickinson',
 'بيكتون ديكنسون', 'Class C', '2024-02-05', '2027-02-04', 'Approved'),

('MDMA-2023-0009876', 'Surgical Instruments Set', 'مجموعة الأدوات الجراحية', 'Medtronic',
 'مدترونيك', 'Class A', '2023-11-15', '2026-11-14', 'Approved')
ON CONFLICT (mdma_number) DO NOTHING;

-- 7. 创建统一搜索视图
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
    expiry_date
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
    NULL as expiry_date
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
    expiry_date
FROM sfda_mdma
WHERE approval_status = 'Approved';

-- 完成提示
SELECT 'Setup completed successfully!' as status;
SELECT 
    (SELECT COUNT(*) FROM hsa_registrations) as hsa_count,
    (SELECT COUNT(*) FROM pmda_approvals) as pmda_count,
    (SELECT COUNT(*) FROM sfda_mdma) as sfda_count;
