-- ============================================
-- MDLooker 国际医疗器械数据导入脚本
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 确保表已创建
-- 如果表不存在，请先执行 20260223_manual_setup.sql

-- ============================================
-- 1. 导入新加坡HSA数据
-- ============================================

INSERT INTO hsa_registrations (
    registration_number, device_name, device_name_zh, manufacturer_name,
    manufacturer_country, risk_class, device_category, registration_type, 
    registration_status, registration_date, expiry_date, intended_use, data_source
) VALUES 
('DE-0001234567', 'Accu-Chek Instant Blood Glucose Monitoring System', NULL, 'Roche Diabetes Care GmbH',
 'Germany', 'B', 'In Vitro Diagnostic', 'Full', 'Active', '2023-08-15', '2028-08-14', 
 'For quantitative measurement of glucose in fresh capillary blood', 'HSA_MEDICS'),

('DE-0001234568', 'FreeStyle Libre 2 Flash Glucose Monitoring System', NULL, 'Abbott Diabetes Care Ltd',
 'United Kingdom', 'C', 'Active Medical Device', 'Full', 'Active', '2023-06-20', '2028-06-19', 
 'For continuous monitoring of interstitial glucose levels', 'HSA_MEDICS'),

('DE-0001234569', 'Philips IntelliVue Patient Monitor MX450', NULL, 'Philips Medizin Systeme Böblingen GmbH',
 'Germany', 'C', 'Active Medical Device', 'Full', 'Active', '2023-09-10', '2028-09-09', 
 'For multi-parameter patient monitoring in healthcare facilities', 'HSA_MEDICS'),

('DE-0001234570', 'Surgical Sutures - Monocryl Plus', NULL, 'Ethicon LLC',
 'USA', 'A', 'Non-Active Medical Device', 'Immediate', 'Active', '2023-11-05', '2028-11-04', 
 'For soft tissue approximation and ligation', 'HSA_MEDICS'),

('DE-0001234571', 'Medtronic MiniMed 780G Insulin Pump System', NULL, 'Medtronic MiniMed Inc',
 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2023-07-25', '2028-07-24', 
 'For continuous subcutaneous insulin infusion', 'HSA_MEDICS'),

('DE-0001234572', 'Boston Scientific S-ICD System', NULL, 'Boston Scientific Corporation',
 'USA', 'D', 'Active Implantable Device', 'Full', 'Active', '2023-05-12', '2028-05-11', 
 'For treatment of life-threatening ventricular arrhythmias', 'HSA_MEDICS'),

('DE-0001234573', 'Johnson & Johnson Vision AcrySof IQ Intraocular Lens', NULL, 'Johnson & Johnson Surgical Vision Inc',
 'USA', 'C', 'Implantable Device', 'Full', 'Active', '2023-10-08', '2028-10-07', 
 'For replacement of the human crystalline lens', 'HSA_MEDICS'),

('DE-0001234574', 'Siemens Healthineers Atellica IM Analyzer', NULL, 'Siemens Healthcare Diagnostics Inc',
 'USA', 'C', 'In Vitro Diagnostic', 'Full', 'Active', '2023-12-01', '2028-11-30', 
 'For in vitro diagnostic testing of clinical samples', 'HSA_MEDICS'),

('DE-0001234575', 'Stryker MAKO SmartRobotics System', NULL, 'Stryker Corporation',
 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2023-04-18', '2028-04-17', 
 'For robotic-arm assisted orthopedic surgery', 'HSA_MEDICS'),

('DE-0001234576', 'Olympus EVIS X1 Endoscopy System', NULL, 'Olympus Medical Systems Corporation',
 'Japan', 'B', 'Active Medical Device', 'Full', 'Active', '2023-08-30', '2028-08-29', 
 'For diagnostic and therapeutic endoscopic procedures', 'HSA_MEDICS')

ON CONFLICT (registration_number) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    manufacturer_name = EXCLUDED.manufacturer_name,
    registration_status = EXCLUDED.registration_status,
    updated_at = NOW();

-- ============================================
-- 2. 导入日本PMDA数据
-- ============================================

INSERT INTO pmda_approvals (
    approval_number, device_name, device_name_jp, manufacturer_name,
    manufacturer_name_jp, classification, approval_date, approval_status, intended_use, data_source
) VALUES 
('23000BZX00011000', 'Magnetom Vida 3T MRI System', '磁気共鳴画像診断装置', 'Siemens Healthcare GmbH',
 'シーメンスヘルスケア株式会社', 'Class III', '2024-01-20', 'Approved', 
 'For magnetic resonance imaging diagnostic examinations', 'PMDA_NINSHO'),

('23000BZX00022000', 'Canon Aquilion Prime SP CT Scanner', 'X線CT診断装置', 'Canon Medical Systems Corporation',
 'キヤノンメディカルシステムズ株式会社', 'Class II', '2024-02-15', 'Approved', 
 'For computed tomography diagnostic imaging', 'PMDA_NINSHO'),

('23000BZX00033000', '5008S CorDiax Hemodialysis System', '血液浄化装置', 'Fresenius Medical Care AG & Co. KGaA',
 'フレゼニウス・メディカル・ケア株式会社', 'Class III', '2023-12-05', 'Approved', 
 'For hemodialysis treatment of patients with renal failure', 'PMDA_NINSHO'),

('23000BZX00044000', 'Da Vinci Xi Surgical System', '手術支援ロボット', 'Intuitive Surgical Inc',
 'インテュイティブサージカル株式会社', 'Class III', '2023-11-10', 'Approved', 
 'For minimally invasive robotic-assisted surgery', 'PMDA_NINSHO'),

('23000BZX00055000', 'Olympus EVIS X1 Video Endoscopy System', '内視鏡システム', 'Olympus Medical Systems Corporation',
 'オリンパスメディカルシステムズ株式会社', 'Class II', '2023-10-25', 'Approved', 
 'For diagnostic and therapeutic gastrointestinal endoscopy', 'PMDA_NINSHO'),

('23000BZX00066000', 'Abbott FreeStyle Libre 3 CGM System', '連続血糖測定器', 'Abbott Diabetes Care Inc',
 'アボットジャパン株式会社', 'Class II', '2023-09-15', 'Approved', 
 'For continuous glucose monitoring in diabetic patients', 'PMDA_NINSHO'),

('23000BZX00077000', 'Medtronic Micra AV Transcatheter Pacing System', '経皮的ペースメーカー', 'Medtronic Inc',
 'メドトロニックジャパン株式会社', 'Class IV', '2023-08-20', 'Approved', 
 'For cardiac pacing in patients with bradycardia', 'PMDA_NINSHO'),

('23000BZX00088000', 'Terumo Ultimaster Nagomi Drug-Eluting Stent', '薬剤溶出型冠動脈ステント', 'Terumo Corporation',
 'テルモ株式会社', 'Class IV', '2023-07-30', 'Approved', 
 'For treatment of coronary artery disease', 'PMDA_NINSHO'),

('23000BZX00099000', 'Roche cobas 6800/8800 Systems', '自動核酸増幅検査装置', 'Roche Diagnostics GmbH',
 'ロシュ・ダイアグノスティックス株式会社', 'Class III', '2023-06-12', 'Approved', 
 'For in vitro molecular diagnostic testing', 'PMDA_NINSHO'),

('23000BZX00100000', 'Johnson & Johnson Ethicon Harmonic Scalpel', '超音波手術器', 'Ethicon Endo-Surgery LLC',
 'エシコン株式会社', 'Class II', '2023-05-08', 'Approved', 
 'For ultrasonic cutting and coagulation in surgery', 'PMDA_NINSHO')

ON CONFLICT (approval_number) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    manufacturer_name = EXCLUDED.manufacturer_name,
    approval_status = EXCLUDED.approval_status,
    updated_at = NOW();

-- ============================================
-- 3. 导入沙特SFDA数据
-- ============================================

INSERT INTO sfda_mdma (
    mdma_number, device_name, device_name_ar, manufacturer_name,
    manufacturer_name_ar, risk_class, issue_date, expiry_date, approval_status, intended_use, data_source
) VALUES 
('MDMA-2024-0001234', 'Philips IntelliVue MX550 Patient Monitor', 'مراقب المريض فيلبس إنتيليفيو', 'Philips Healthcare',
 'فيليبس للرعاية الصحية', 'Class B', '2024-01-10', '2027-01-09', 'Approved', 
 'For continuous monitoring of patient vital signs', 'SFDA_GHAD'),

('MDMA-2024-0001235', 'BD Alaris Plus Infusion Pump', 'مضخة الحقن ألاريس بلس', 'Becton Dickinson',
 'بيكتون ديكنسون', 'Class C', '2024-02-05', '2027-02-04', 'Approved', 
 'For controlled infusion of medications and fluids', 'SFDA_GHAD'),

('MDMA-2023-0009876', 'Medtronic StealthStation S8 Navigation System', 'نظام التنقل ستيلث ستيشن', 'Medtronic',
 'مدترونيك', 'Class C', '2023-11-15', '2026-11-14', 'Approved', 
 'For surgical navigation and guidance', 'SFDA_GHAD'),

('MDMA-2023-0009877', 'GE Healthcare Voluson E10 Ultrasound System', 'نظام الموجات فوق الصوتية فولوسون', 'GE Healthcare',
 'جنرال إلكتريك للرعاية الصحية', 'Class B', '2023-10-20', '2026-10-19', 'Approved', 
 'For diagnostic ultrasound imaging in obstetrics and gynecology', 'SFDA_GHAD'),

('MDMA-2023-0009878', 'Abbott Architect ci4100 Analyzer', 'محلل أرشيتكت', 'Abbott Diagnostics',
 'أبوت للتشخيص', 'Class C', '2023-09-25', '2026-09-24', 'Approved', 
 'For in vitro diagnostic testing of clinical samples', 'SFDA_GHAD'),

('MDMA-2023-0009879', 'Stryker Power Pro XT Ambulance Cot', 'سرير الإسعاف باور برو', 'Stryker Emergency Care',
 'سترايكر للرعاية الطارئة', 'Class A', '2023-08-15', '2026-08-14', 'Approved', 
 'For patient transport in emergency medical services', 'SFDA_GHAD'),

('MDMA-2023-0009880', 'Boston Scientific Watchman FLX Left Atrial Appendage Closure Device', 'جهاز إغلاق الزائدة الأذينية اليسرى', 'Boston Scientific Corporation',
 'بوسطن ساينتيفيك', 'Class D', '2023-07-10', '2026-07-09', 'Approved', 
 'For prevention of stroke in patients with atrial fibrillation', 'SFDA_GHAD'),

('MDMA-2023-0009881', 'Siemens Healthineers Atellica Solution', 'حل أتيليكا', 'Siemens Healthcare Diagnostics',
 'سيمنز للتشخيص الطبي', 'Class C', '2023-06-05', '2026-06-04', 'Approved', 
 'For automated in vitro diagnostic testing', 'SFDA_GHAD'),

('MDMA-2023-0009882', 'Smith & Nephew NAVIO Surgical System', 'نظام نافيو الجراحي', 'Smith & Nephew Inc',
 'سميث آند نيفيو', 'Class C', '2023-05-20', '2026-05-19', 'Approved', 
 'For robotic-assisted knee replacement surgery', 'SFDA_GHAD'),

('MDMA-2023-0009883', 'ResMed AirSense 10 AutoSet CPAP Device', 'جهاز التنفس الإيجابي المستمر', 'ResMed Inc',
 'ريزمد', 'Class B', '2023-04-15', '2026-04-14', 'Approved', 
 'For treatment of obstructive sleep apnea', 'SFDA_GHAD')

ON CONFLICT (mdma_number) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    manufacturer_name = EXCLUDED.manufacturer_name,
    approval_status = EXCLUDED.approval_status,
    updated_at = NOW();

-- ============================================
-- 4. 验证导入结果
-- ============================================

SELECT 
    'HSA (Singapore)' as authority,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE registration_status = 'Active') as active_records
FROM hsa_registrations

UNION ALL

SELECT 
    'PMDA (Japan)' as authority,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE approval_status = 'Approved') as active_records
FROM pmda_approvals

UNION ALL

SELECT 
    'SFDA (Saudi Arabia)' as authority,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE approval_status = 'Approved') as active_records
FROM sfda_mdma;
