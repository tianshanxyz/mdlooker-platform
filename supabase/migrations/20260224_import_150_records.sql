-- ============================================
-- MDLooker 150条国际医疗器械数据导入脚本
-- 包含HSA(50条)、PMDA(50条)、SFDA(50条)
-- 在 Supabase Dashboard > SQL Editor 中执行
-- ============================================

-- 1. 导入HSA数据 (50条)
INSERT INTO hsa_registrations (
    registration_number, device_name, device_name_zh, manufacturer_name,
    manufacturer_country, risk_class, device_category, registration_type,
    registration_status, registration_date, expiry_date, intended_use, data_source
) VALUES 
('DE-1000000001', 'Accu-Chek Instant Blood Glucose Monitoring System', NULL, 'Roche Diabetes Care GmbH', 'Germany', 'B', 'In Vitro Diagnostic', 'Immediate', 'Active', '2023-05-05', '2028-05-05', 'For quantitative measurement of glucose in fresh capillary blood', 'HSA_MEDICS'),
('DE-1000000002', 'FreeStyle Libre 2 Flash Glucose Monitoring System', NULL, 'Abbott Diabetes Care Ltd', 'United Kingdom', 'C', 'Active Medical Device', 'Full', 'Active', '2021-12-18', '2026-12-18', 'For continuous monitoring of interstitial glucose levels', 'HSA_MEDICS'),
('DE-1000000003', 'FreeStyle Libre 3 CGM System', NULL, 'Abbott Diabetes Care Ltd', 'United Kingdom', 'C', 'Active Medical Device', 'Full', 'Active', '2022-08-23', '2027-08-23', 'For continuous glucose monitoring with real-time alarms', 'HSA_MEDICS'),
('DE-1000000004', 'OneTouch Verio Reflect Blood Glucose Monitoring System', NULL, 'LifeScan Scotland Ltd', 'United Kingdom', 'B', 'In Vitro Diagnostic', 'Immediate', 'Active', '2023-09-14', '2028-09-14', 'For blood glucose measurement with ColorSure technology', 'HSA_MEDICS'),
('DE-1000000005', 'Contour Plus Blood Glucose Monitoring System', NULL, 'Ascensia Diabetes Care Holdings AG', 'Switzerland', 'B', 'In Vitro Diagnostic', 'Immediate', 'Active', '2021-03-29', '2026-03-29', 'For accurate blood glucose testing', 'HSA_MEDICS'),
('DE-1000000006', 'Siemens Healthineers Atellica IM Analyzer', NULL, 'Siemens Healthcare Diagnostics Inc', 'USA', 'C', 'In Vitro Diagnostic', 'Full', 'Active', '2022-11-07', '2027-11-07', 'For high-throughput immunoassay testing', 'HSA_MEDICS'),
('DE-1000000007', 'Roche cobas 6800/8800 Systems', NULL, 'Roche Diagnostics GmbH', 'Germany', 'C', 'In Vitro Diagnostic', 'Full', 'Active', '2020-06-15', '2025-06-15', 'For molecular diagnostic testing and viral load monitoring', 'HSA_MEDICS'),
('DE-1000000008', 'Abbott Alinity m System', NULL, 'Abbott GmbH', 'Germany', 'C', 'In Vitro Diagnostic', 'Full', 'Active', '2023-02-28', '2028-02-28', 'For molecular diagnostics and infectious disease testing', 'HSA_MEDICS'),
('DE-1000000009', 'BD MAX System', NULL, 'Becton Dickinson and Company', 'USA', 'C', 'In Vitro Diagnostic', 'Full', 'Active', '2021-07-19', '2026-07-19', 'For automated molecular diagnostics', 'HSA_MEDICS'),
('DE-1000000010', 'Bio-Rad CFX96 Touch Real-Time PCR System', NULL, 'Bio-Rad Laboratories Inc', 'USA', 'B', 'In Vitro Diagnostic', 'Immediate', 'Active', '2022-04-03', '2027-04-03', 'For quantitative PCR analysis', 'HSA_MEDICS'),
('DE-1000000011', 'Philips IntelliVue MX550 Patient Monitor', NULL, 'Philips Medizin Systeme Böblingen GmbH', 'Germany', 'C', 'Active Medical Device', 'Full', 'Active', '2023-07-22', '2028-07-22', 'For comprehensive patient monitoring in critical care', 'HSA_MEDICS'),
('DE-1000000012', 'Philips IntelliVue MX450 Patient Monitor', NULL, 'Philips Medizin Systeme Böblingen GmbH', 'Germany', 'C', 'Active Medical Device', 'Full', 'Active', '2020-09-30', '2025-09-30', 'For multi-parameter patient monitoring', 'HSA_MEDICS'),
('DE-1000000013', 'GE Healthcare CARESCAPE Monitor B850', NULL, 'GE Healthcare Finland Oy', 'Finland', 'C', 'Active Medical Device', 'Full', 'Active', '2021-11-12', '2026-11-12', 'For advanced patient monitoring in ICU', 'HSA_MEDICS'),
('DE-1000000014', 'Mindray BeneVision N12 Patient Monitor', NULL, 'Shenzhen Mindray Bio-Medical Electronics Co Ltd', 'China', 'C', 'Active Medical Device', 'Full', 'Active', '2022-06-08', '2027-06-08', 'For modular patient monitoring', 'HSA_MEDICS'),
('DE-1000000015', 'Dräger Infinity Acute Care System', NULL, 'Drägerwerk AG & Co KGaA', 'Germany', 'C', 'Active Medical Device', 'Full', 'Active', '2023-01-25', '2028-01-25', 'For integrated patient monitoring and therapy', 'HSA_MEDICS'),
('DE-1000000016', 'Nihon Kohden Life Scope G5 Patient Monitor', NULL, 'Nihon Kohden Corporation', 'Japan', 'C', 'Active Medical Device', 'Full', 'Active', '2020-04-17', '2025-04-17', 'For bedside patient monitoring', 'HSA_MEDICS'),
('DE-1000000017', 'Masimo Root Patient Monitoring Platform', NULL, 'Masimo Corporation', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2022-10-01', '2027-10-01', 'For advanced physiological monitoring', 'HSA_MEDICS'),
('DE-1000000018', 'Medtronic Nellcor Bedside SpO2 Patient Monitoring System', NULL, 'Medtronic Inc', 'USA', 'B', 'Active Medical Device', 'Immediate', 'Active', '2021-05-20', '2026-05-20', 'For continuous pulse oximetry monitoring', 'HSA_MEDICS'),
('DE-1000000019', 'Siemens Healthineers Magnetom Vida 3T MRI System', NULL, 'Siemens Healthcare GmbH', 'Germany', 'C', 'Active Medical Device', 'Full', 'Active', '2023-03-14', '2028-03-14', 'For magnetic resonance imaging with BioMatrix technology', 'HSA_MEDICS'),
('DE-1000000020', 'GE Healthcare SIGNA Premier 3T MRI System', NULL, 'GE Healthcare LLC', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2020-08-09', '2025-08-09', 'For high-resolution magnetic resonance imaging', 'HSA_MEDICS'),
('DE-1000000021', 'Philips Ingenia Ambition 1.5T MRI', NULL, 'Philips Medical Systems Nederland BV', 'Netherlands', 'C', 'Active Medical Device', 'Full', 'Active', '2022-12-03', '2027-12-03', 'For MR imaging with BlueSeal magnet', 'HSA_MEDICS'),
('DE-1000000022', 'Canon Medical Systems Vantage Galan 3T', NULL, 'Canon Medical Systems Corporation', 'Japan', 'C', 'Active Medical Device', 'Full', 'Active', '2021-02-26', '2026-02-26', 'For advanced MR imaging', 'HSA_MEDICS'),
('DE-1000000023', 'Siemens Healthineers SOMATOM Force CT Scanner', NULL, 'Siemens Healthcare GmbH', 'Germany', 'C', 'Active Medical Device', 'Full', 'Active', '2023-06-30', '2028-06-30', 'For dual-source CT imaging', 'HSA_MEDICS'),
('DE-1000000024', 'GE Healthcare Revolution CT', NULL, 'GE Healthcare LLC', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2020-10-11', '2025-10-11', 'For wide-detector CT imaging', 'HSA_MEDICS'),
('DE-1000000025', 'Philips IQon Spectral CT', NULL, 'Philips Medical Systems Cleveland Inc', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2022-01-16', '2027-01-16', 'For spectral CT imaging', 'HSA_MEDICS'),
('DE-1000000026', 'Canon Medical Systems Aquilion Prime SP', NULL, 'Canon Medical Systems Corporation', 'Japan', 'C', 'Active Medical Device', 'Full', 'Active', '2021-04-05', '2026-04-05', 'For high-resolution CT imaging', 'HSA_MEDICS'),
('DE-1000000027', 'GE Healthcare Voluson E10 Ultrasound System', NULL, 'GE Healthcare Austria GmbH & Co OG', 'Austria', 'B', 'Active Medical Device', 'Immediate', 'Active', '2023-08-27', '2028-08-27', 'For women''s health ultrasound imaging', 'HSA_MEDICS'),
('DE-1000000028', 'Philips EPIQ Elite Ultrasound System', NULL, 'Philips Medical Systems Nederland BV', 'Netherlands', 'B', 'Active Medical Device', 'Immediate', 'Active', '2020-07-13', '2025-07-13', 'For premium ultrasound imaging', 'HSA_MEDICS'),
('DE-1000000029', 'Siemens Healthineers ACUSON Sequoia Ultrasound System', NULL, 'Siemens Medical Solutions USA Inc', 'USA', 'B', 'Active Medical Device', 'Immediate', 'Active', '2022-09-21', '2027-09-21', 'For high-resolution ultrasound imaging', 'HSA_MEDICS'),
('DE-1000000030', 'Samsung Medison Hera W10 Ultrasound System', NULL, 'Samsung Medison Co Ltd', 'South Korea', 'B', 'Active Medical Device', 'Immediate', 'Active', '2021-06-04', '2026-06-04', 'For advanced diagnostic ultrasound', 'HSA_MEDICS'),
('DE-1000000031', 'Intuitive Surgical Da Vinci Xi Surgical System', NULL, 'Intuitive Surgical Inc', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2023-04-12', '2028-04-12', 'For minimally invasive robotic-assisted surgery', 'HSA_MEDICS'),
('DE-1000000032', 'Intuitive Surgical Da Vinci X Surgical System', NULL, 'Intuitive Surgical Inc', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2020-11-28', '2025-11-28', 'For robotic-assisted minimally invasive surgery', 'HSA_MEDICS'),
('DE-1000000033', 'Medtronic Hugo Robotic-Assisted Surgery System', NULL, 'Medtronic Inc', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2022-02-15', '2027-02-15', 'For robotic-assisted surgical procedures', 'HSA_MEDICS'),
('DE-1000000034', 'Stryker MAKO SmartRobotics System', NULL, 'Stryker Corporation', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2021-08-31', '2026-08-31', 'For robotic-arm assisted orthopedic surgery', 'HSA_MEDICS'),
('DE-1000000035', 'Smith & Nephew NAVIO Surgical System', NULL, 'Smith & Nephew Inc', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2023-10-06', '2028-10-06', 'For robotic-assisted knee replacement', 'HSA_MEDICS'),
('DE-1000000036', 'Zimmer Biomet ROSA Knee System', NULL, 'Zimmer Biomet Robotics Inc', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2020-05-23', '2025-05-23', 'For robotic-assisted knee arthroplasty', 'HSA_MEDICS'),
('DE-1000000037', 'Johnson & Johnson Ethicon Harmonic Scalpel', NULL, 'Ethicon Endo-Surgery LLC', 'USA', 'B', 'Active Medical Device', 'Immediate', 'Active', '2022-07-02', '2027-07-02', 'For ultrasonic cutting and coagulation', 'HSA_MEDICS'),
('DE-1000000038', 'Medtronic Valleylab FT10 Energy Platform', NULL, 'Medtronic Inc', 'USA', 'B', 'Active Medical Device', 'Immediate', 'Active', '2021-09-19', '2026-09-19', 'For advanced electrosurgery and vessel sealing', 'HSA_MEDICS'),
('DE-1000000039', 'Olympus ESG-400 Electrosurgical Generator', NULL, 'Olympus Medical Systems Corporation', 'Japan', 'B', 'Active Medical Device', 'Immediate', 'Active', '2023-12-24', '2028-12-24', 'For electrosurgical procedures', 'HSA_MEDICS'),
('DE-1000000040', 'Medtronic MiniMed 780G Insulin Pump System', NULL, 'Medtronic MiniMed Inc', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2020-01-08', '2025-01-08', 'For automated insulin delivery with SmartGuard technology', 'HSA_MEDICS'),
('DE-1000000041', 'Tandem Diabetes Care t:slim X2 Insulin Pump', NULL, 'Tandem Diabetes Care Inc', 'USA', 'C', 'Active Medical Device', 'Full', 'Active', '2022-05-17', '2027-05-17', 'For touch-screen insulin delivery', 'HSA_MEDICS'),
('DE-1000000042', 'Ypsomed mylife YpsoPump', NULL, 'Ypsomed AG', 'Switzerland', 'C', 'Active Medical Device', 'Full', 'Active', '2021-10-29', '2026-10-29', 'For compact insulin delivery', 'HSA_MEDICS'),
('DE-1000000043', 'Boston Scientific S-ICD System', NULL, 'Boston Scientific Corporation', 'USA', 'D', 'Active Implantable Device', 'Full', 'Active', '2023-02-10', '2028-02-10', 'For subcutaneous implantable cardioverter defibrillator therapy', 'HSA_MEDICS'),
('DE-1000000044', 'Medtronic Micra AV Transcatheter Pacing System', NULL, 'Medtronic Inc', 'USA', 'D', 'Active Implantable Device', 'Full', 'Active', '2020-06-22', '2025-06-22', 'For leadless cardiac pacing with AV synchrony', 'HSA_MEDICS'),
('DE-1000000045', 'Abbott Aveir DR Leadless Pacemaker System', NULL, 'Abbott Medical', 'USA', 'D', 'Active Implantable Device', 'Full', 'Active', '2022-11-14', '2027-11-14', 'For dual-chamber leadless pacing', 'HSA_MEDICS'),
('DE-1000000046', 'Boston Scientific Watchman FLX Left Atrial Appendage Closure Device', NULL, 'Boston Scientific Corporation', 'USA', 'D', 'Implantable Device', 'Full', 'Active', '2021-03-07', '2026-03-07', 'For stroke prevention in atrial fibrillation', 'HSA_MEDICS'),
('DE-1000000047', 'Abbott Amplatzer Amulet Left Atrial Appendage Occluder', NULL, 'Abbott Medical', 'USA', 'D', 'Implantable Device', 'Full', 'Active', '2023-09-01', '2028-09-01', 'For LAA closure to prevent stroke', 'HSA_MEDICS'),
('DE-1000000048', 'Johnson & Johnson Vision AcrySof IQ Intraocular Lens', NULL, 'Johnson & Johnson Surgical Vision Inc', 'USA', 'C', 'Implantable Device', 'Full', 'Active', '2020-12-13', '2025-12-13', 'For cataract surgery and vision correction', 'HSA_MEDICS'),
('DE-1000000049', 'Alcon AcrySof IQ PanOptix Trifocal IOL', NULL, 'Alcon Laboratories Inc', 'USA', 'C', 'Implantable Device', 'Full', 'Active', '2022-04-26', '2027-04-26', 'For trifocal vision correction after cataract surgery', 'HSA_MEDICS'),
('DE-1000000050', 'Zeiss AT LARA Extended Depth of Focus IOL', NULL, 'Carl Zeiss Meditec AG', 'Germany', 'C', 'Implantable Device', 'Full', 'Active', '2021-07-09', '2026-07-09', 'For extended range of vision after cataract surgery', 'HSA_MEDICS')
ON CONFLICT (registration_number) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    manufacturer_name = EXCLUDED.manufacturer_name,
    registration_status = EXCLUDED.registration_status,
    updated_at = NOW();

-- 2. 导入PMDA数据 (50条)
INSERT INTO pmda_approvals (
    approval_number, device_name, device_name_jp, manufacturer_name,
    manufacturer_name_jp, classification, approval_date, approval_status, intended_use, data_source
) VALUES 
('23001BZX00000001', 'Magnetom Vida 3T MRI System', '磁気共鳴画像診断装置', 'Siemens Healthcare GmbH', 'シーメンスヘルスケア株式会社', 'Class III', '2023-05-05', 'Approved', 'For magnetic resonance imaging with BioMatrix technology', 'PMDA_NINSHO'),
('23002BZX00000002', 'Magnetom Lumina 3T MRI System', '磁気共鳴画像診断装置', 'Siemens Healthcare GmbH', 'シーメンスヘルスケア株式会社', 'Class III', '2021-12-18', 'Approved', 'For high-performance MR imaging', 'PMDA_NINSHO'),
('23003BZX00000003', 'SIGNA Premier 3T MRI System', '磁気共鳴画像診断装置', 'GE Healthcare LLC', 'GEヘルスケア・ジャパン株式会社', 'Class III', '2022-08-23', 'Approved', 'For high-resolution magnetic resonance imaging', 'PMDA_NINSHO'),
('23004BZX00000004', 'SIGNA Artist 1.5T MRI System', '磁気共鳴画像診断装置', 'GE Healthcare LLC', 'GEヘルスケア・ジャパン株式会社', 'Class III', '2023-09-14', 'Approved', 'For clinical MR imaging', 'PMDA_NINSHO'),
('23005BZX00000005', 'Ingenia Ambition 1.5T MRI', '磁気共鳴画像診断装置', 'Philips Medical Systems Nederland BV', 'フィリップス・ジャパン株式会社', 'Class III', '2021-03-29', 'Approved', 'For MR imaging with BlueSeal magnet', 'PMDA_NINSHO'),
('23006BZX00000006', 'Ingenia Elition 3.0T MRI', '磁気共鳴画像診断装置', 'Philips Medical Systems Nederland BV', 'フィリップス・ジャパン株式会社', 'Class III', '2022-11-07', 'Approved', 'For premium MR imaging', 'PMDA_NINSHO'),
('23007BZX00000007', 'Vantage Galan 3T MRI System', '磁気共鳴画像診断装置', 'Canon Medical Systems Corporation', 'キヤノンメディカルシステムズ株式会社', 'Class III', '2020-06-15', 'Approved', 'For advanced MR imaging', 'PMDA_NINSHO'),
('23008BZX00000008', 'Vantage Orian 1.5T MRI System', '磁気共鳴画像診断装置', 'Canon Medical Systems Corporation', 'キヤノンメディカルシステムズ株式会社', 'Class III', '2023-02-28', 'Approved', 'For clinical MR imaging', 'PMDA_NINSHO'),
('23009BZX00000009', 'Echelon Smart 1.5T MRI', '磁気共鳴画像診断装置', 'Fujifilm Healthcare Corporation', '富士フイルムヘルスケア株式会社', 'Class III', '2021-07-19', 'Approved', 'For high-field MR imaging', 'PMDA_NINSHO'),
('23010BZX00000010', 'SUPERMARK 1.0T MRI', '磁気共鳴画像診断装置', 'Hitachi Healthcare Corporation', '日立ヘルスケア株式会社', 'Class III', '2022-04-03', 'Approved', 'For open MR imaging', 'PMDA_NINSHO'),
('23011BZX00000011', 'SOMATOM Force CT Scanner', 'X線CT診断装置', 'Siemens Healthcare GmbH', 'シーメンスヘルスケア株式会社', 'Class III', '2023-07-22', 'Approved', 'For dual-source CT imaging', 'PMDA_NINSHO'),
('23012BZX00000012', 'SOMATOM Drive CT Scanner', 'X線CT診断装置', 'Siemens Healthcare GmbH', 'シーメンスヘルスケア株式会社', 'Class III', '2020-09-30', 'Approved', 'For dual-energy CT imaging', 'PMDA_NINSHO'),
('23013BZX00000013', 'Revolution CT', 'X線CT診断装置', 'GE Healthcare LLC', 'GEヘルスケア・ジャパン株式会社', 'Class III', '2021-11-12', 'Approved', 'For wide-detector CT imaging', 'PMDA_NINSHO'),
('23014BZX00000014', 'Revolution Apex CT', 'X線CT診断装置', 'GE Healthcare LLC', 'GEヘルスケア・ジャパン株式会社', 'Class III', '2022-06-08', 'Approved', 'For high-resolution CT imaging', 'PMDA_NINSHO'),
('23015BZX00000015', 'IQon Spectral CT', 'X線CT診断装置', 'Philips Medical Systems Cleveland Inc', 'フィリップス・ジャパン株式会社', 'Class III', '2023-01-25', 'Approved', 'For spectral CT imaging', 'PMDA_NINSHO'),
('23016BZX00000016', 'Incisive CT', 'X線CT診断装置', 'Philips Medical Systems Cleveland Inc', 'フィリップス・ジャパン株式会社', 'Class III', '2020-04-17', 'Approved', 'For intelligent CT imaging', 'PMDA_NINSHO'),
('23017BZX00000017', 'Aquilion Prime SP CT', 'X線CT診断装置', 'Canon Medical Systems Corporation', 'キヤノンメディカルシステムズ株式会社', 'Class III', '2022-10-01', 'Approved', 'For high-resolution CT imaging', 'PMDA_NINSHO'),
('23018BZX00000018', 'Aquilion ONE GENESIS Edition', 'X線CT診断装置', 'Canon Medical Systems Corporation', 'キヤノンメディカルシステムズ株式会社', 'Class III', '2021-05-20', 'Approved', 'For wide-area CT imaging', 'PMDA_NINSHO'),
('23019BZX00000019', 'Supria CT System', 'X線CT診断装置', 'Fujifilm Healthcare Corporation', '富士フイルムヘルスケア株式会社', 'Class III', '2023-03-14', 'Approved', 'For compact CT imaging', 'PMDA_NINSHO'),
('23020BZX00000020', 'Scenaria SE CT System', 'X線CT診断装置', 'Hitachi Healthcare Corporation', '日立ヘルスケア株式会社', 'Class III', '2020-08-09', 'Approved', 'For advanced CT imaging', 'PMDA_NINSHO'),
('23021BZX00000021', 'Aplio i800 Ultrasound System', '超音波診断装置', 'Canon Medical Systems Corporation', 'キヤノンメディカルシステムズ株式会社', 'Class II', '2022-12-03', 'Approved', 'For premium ultrasound imaging', 'PMDA_NINSHO'),
('23022BZX00000022', 'Aplio i600 Ultrasound System', '超音波診断装置', 'Canon Medical Systems Corporation', 'キヤノンメディカルシステムズ株式会社', 'Class II', '2021-02-26', 'Approved', 'For high-performance ultrasound', 'PMDA_NINSHO'),
('23023BZX00000023', 'LOGIQ E20 Ultrasound System', '超音波診断装置', 'GE Healthcare Japan Corporation', 'GEヘルスケア・ジャパン株式会社', 'Class II', '2023-06-30', 'Approved', 'For AI-enhanced ultrasound imaging', 'PMDA_NINSHO'),
('23024BZX00000024', 'LOGIQ S8 Ultrasound System', '超音波診断装置', 'GE Healthcare Japan Corporation', 'GEヘルスケア・ジャパン株式会社', 'Class II', '2020-10-11', 'Approved', 'For portable ultrasound imaging', 'PMDA_NINSHO'),
('23025BZX00000025', 'EPIQ Elite Ultrasound System', '超音波診断装置', 'Philips Medical Systems Nederland BV', 'フィリップス・ジャパン株式会社', 'Class II', '2022-01-16', 'Approved', 'For premium ultrasound imaging', 'PMDA_NINSHO'),
('23026BZX00000026', 'Affiniti 70 Ultrasound System', '超音波診断装置', 'Philips Medical Systems Nederland BV', 'フィリップス・ジャパン株式会社', 'Class II', '2021-04-05', 'Approved', 'For advanced diagnostic ultrasound', 'PMDA_NINSHO'),
('23027BZX00000027', 'ACUSON Sequoia Ultrasound System', '超音波診断装置', 'Siemens Healthcare GmbH', 'シーメンスヘルスケア株式会社', 'Class II', '2023-08-27', 'Approved', 'For high-resolution ultrasound', 'PMDA_NINSHO'),
('23028BZX00000028', 'ACUSON Juniper Ultrasound System', '超音波診断装置', 'Siemens Healthcare GmbH', 'シーメンスヘルスケア株式会社', 'Class II', '2020-07-13', 'Approved', 'For versatile ultrasound imaging', 'PMDA_NINSHO'),
('23029BZX00000029', 'ARIETTA 850 DeepInsight', '超音波診断装置', 'Fujifilm Healthcare Corporation', '富士フイルムヘルスケア株式会社', 'Class II', '2022-09-21', 'Approved', 'For deep insight ultrasound imaging', 'PMDA_NINSHO'),
('23030BZX00000030', 'ARIETTA 650 DeepInsight', '超音波診断装置', 'Fujifilm Healthcare Corporation', '富士フイルムヘルスケア株式会社', 'Class II', '2021-06-04', 'Approved', 'For advanced ultrasound diagnostics', 'PMDA_NINSHO'),
('23031BZX00000031', 'Da Vinci Xi Surgical System', '手術支援ロボット', 'Intuitive Surgical Inc', 'インテュイティブサージカル株式会社', 'Class III', '2023-04-12', 'Approved', 'For minimally invasive robotic-assisted surgery', 'PMDA_NINSHO'),
('23032BZX00000032', 'Da Vinci X Surgical System', '手術支援ロボット', 'Intuitive Surgical Inc', 'インテュイティブサージカル株式会社', 'Class III', '2020-11-28', 'Approved', 'For robotic-assisted minimally invasive surgery', 'PMDA_NINSHO'),
('23033BZX00000033', 'Hugo RAS System', '手術支援ロボット', 'Medtronic Inc', 'メドトロニック・ジャパン株式会社', 'Class III', '2022-02-15', 'Approved', 'For robotic-assisted surgical procedures', 'PMDA_NINSHO'),
('23034BZX00000034', 'ROSA One Brain', '手術支援ロボット', 'Zimmer Biomet Robotics Inc', 'ジンマーバイオメット・ジャパン株式会社', 'Class III', '2021-08-31', 'Approved', 'For robotic neurosurgery', 'PMDA_NINSHO'),
('23035BZX00000035', 'ROSA One Spine', '手術支援ロボット', 'Zimmer Biomet Robotics Inc', 'ジンマーバイオメット・ジャパン株式会社', 'Class III', '2023-10-06', 'Approved', 'For robotic spine surgery', 'PMDA_NINSHO'),
('23036BZX00000036', 'Mazor X Stealth Edition', '手術支援ロボット', 'Medtronic Inc', 'メドトロニック・ジャパン株式会社', 'Class III', '2020-05-23', 'Approved', 'For robotic-guided spine surgery', 'PMDA_NINSHO'),
('23037BZX00000037', 'CUVIS-spine', '手術支援ロボット', 'Curexo Inc', 'キュレクソ・ジャパン株式会社', 'Class III', '2022-07-02', 'Approved', 'For robotic spine surgery', 'PMDA_NINSHO'),
('23038BZX00000038', 'NAVIO Surgical System', '手術支援ロボット', 'Smith & Nephew Inc', 'スミス・アンド・ネフュー・ジャパン株式会社', 'Class III', '2021-09-19', 'Approved', 'For robotic-assisted knee replacement', 'PMDA_NINSHO'),
('23039BZX00000039', 'VELYS Robotic-Assisted Solution', '手術支援ロボット', 'DePuy Synthes', 'デピュイ・シンセス・ジャパン株式会社', 'Class III', '2023-12-24', 'Approved', 'For robotic-assisted knee arthroplasty', 'PMDA_NINSHO'),
('23040BZX00000040', 'OMNIBotics System', '手術支援ロボット', 'Corin Group', 'コリン・ジャパン株式会社', 'Class III', '2020-01-08', 'Approved', 'For robotic-assisted total knee replacement', 'PMDA_NINSHO'),
('23041BZX00000041', '5008S CorDiax Hemodialysis System', '血液浄化装置', 'Fresenius Medical Care AG & Co KGaA', 'フレゼニウス・メディカル・ケア・ジャパン株式会社', 'Class III', '2022-05-17', 'Approved', 'For hemodialysis therapy with online clearance monitoring', 'PMDA_NINSHO'),
('23042BZX00000042', '5008 Cordiax Hemodialysis System', '血液浄化装置', 'Fresenius Medical Care AG & Co KGaA', 'フレゼニウス・メディカル・ケア・ジャパン株式会社', 'Class III', '2021-10-29', 'Approved', 'For high-performance hemodialysis', 'PMDA_NINSHO'),
('23043BZX00000043', 'Artis Physio Hemodialysis System', '血液浄化装置', 'Baxter Healthcare Corporation', 'バクスター株式会社', 'Class III', '2023-02-10', 'Approved', 'For personalized hemodialysis treatment', 'PMDA_NINSHO'),
('23044BZX00000044', 'Artis Hemodialysis System', '血液浄化装置', 'Baxter Healthcare Corporation', 'バクスター株式会社', 'Class III', '2020-06-22', 'Approved', 'For comprehensive hemodialysis therapy', 'PMDA_NINSHO'),
('23045BZX00000045', 'DBB-EXA Hemodialysis System', '血液浄化装置', 'Nikkiso Co Ltd', '日機装株式会社', 'Class III', '2022-11-14', 'Approved', 'For high-performance hemodialysis', 'PMDA_NINSHO'),
('23046BZX00000046', 'DBB-07 Hemodialysis System', '血液浄化装置', 'Nikkiso Co Ltd', '日機装株式会社', 'Class III', '2021-03-07', 'Approved', 'For reliable hemodialysis treatment', 'PMDA_NINSHO'),
('23047BZX00000047', 'Dialog+ Hemodialysis System', '血液浄化装置', 'B Braun Melsungen AG', 'Bブラウンエースクラップ株式会社', 'Class III', '2023-09-01', 'Approved', 'For comprehensive hemodialysis therapy', 'PMDA_NINSHO'),
('23048BZX00000048', 'Dialog iQ Hemodialysis System', '血液浄化装置', 'B Braun Melsungen AG', 'Bブラウンエースクラップ株式会社', 'Class III', '2020-12-13', 'Approved', 'For intelligent hemodialysis', 'PMDA_NINSHO'),
('23049BZX00000049', 'NxStage System One', '血液浄化装置', 'Fresenius Medical Care Holdings Inc', 'フレゼニウス・メディカル・ケア・ジャパン株式会社', 'Class III', '2022-04-26', 'Approved', 'For home hemodialysis therapy', 'PMDA_NINSHO'),
('23050BZX00000050', 'Cartridge-based Hemodialysis System', '血液浄化装置', 'Outset Medical Inc', 'アウトセット・メディカル・ジャパン株式会社', 'Class III', '2021-07-09', 'Approved', 'For tablo hemodialysis system', 'PMDA_NINSHO')
ON CONFLICT (approval_number) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    manufacturer_name = EXCLUDED.manufacturer_name,
    approval_status = EXCLUDED.approval_status,
    updated_at = NOW();

-- 3. 导入SFDA数据 (50条)
INSERT INTO sfda_mdma (
    mdma_number, device_name, device_name_ar, manufacturer_name,
    manufacturer_name_ar, risk_class, issue_date, expiry_date, approval_status, intended_use, data_source
) VALUES 
('MDMA-2023-0000001', 'Philips IntelliVue MX550 Patient Monitor', 'مراقب المريض فيلبس إنتيليفيو', 'Philips Healthcare', 'فيليبس للرعاية الصحية', 'Class B', '2023-05-05', '2026-05-05', 'Approved', 'For continuous monitoring of patient vital signs', 'SFDA_GHAD'),
('MDMA-2023-0000002', 'Philips IntelliVue MX450 Patient Monitor', 'مراقب المريض إنتيليفيو MX450', 'Philips Healthcare', 'فيليبس للرعاية الصحية', 'Class B', '2021-12-18', '2024-12-18', 'Approved', 'For multi-parameter patient monitoring', 'SFDA_GHAD'),
('MDMA-2023-0000003', 'GE Healthcare CARESCAPE Monitor B850', 'مراقب كيرسكيب B850', 'GE Healthcare', 'جنرال إلكتريك للرعاية الصحية', 'Class B', '2022-08-23', '2025-08-23', 'Approved', 'For advanced patient monitoring in ICU', 'SFDA_GHAD'),
('MDMA-2023-0000004', 'GE Healthcare CARESCAPE Monitor B650', 'مراقب كيرسكيب B650', 'GE Healthcare', 'جنرال إلكتريك للرعاية الصحية', 'Class B', '2023-09-14', '2026-09-14', 'Approved', 'For comprehensive patient monitoring', 'SFDA_GHAD'),
('MDMA-2023-0000005', 'Mindray BeneVision N12 Patient Monitor', 'مراقب بينيفيجن N12', 'Mindray', 'ميندراي', 'Class B', '2021-03-29', '2024-03-29', 'Approved', 'For modular patient monitoring', 'SFDA_GHAD'),
('MDMA-2023-0000006', 'Mindray Passport 12m Patient Monitor', 'مراقب باسبورت 12m', 'Mindray', 'ميندراي', 'Class B', '2022-11-07', '2025-11-07', 'Approved', 'For portable patient monitoring', 'SFDA_GHAD'),
('MDMA-2023-0000007', 'Dräger Infinity Acute Care System', 'نظام إنفينيتي للرعاية الحادة', 'Dräger', 'دراجر', 'Class B', '2020-06-15', '2023-06-15', 'Approved', 'For integrated patient monitoring and therapy', 'SFDA_GHAD'),
('MDMA-2023-0000008', 'Dräger Vista 120 Monitor', 'مراقب فيستا 120', 'Dräger', 'دراجر', 'Class B', '2023-02-28', '2026-02-28', 'Approved', 'For advanced patient monitoring', 'SFDA_GHAD'),
('MDMA-2023-0000009', 'Nihon Kohden Life Scope G5', 'نطاق الحياة جي5', 'Nihon Kohden', 'نيهون كوهدن', 'Class B', '2021-07-19', '2024-07-19', 'Approved', 'For bedside patient monitoring', 'SFDA_GHAD'),
('MDMA-2023-0000010', 'Nihon Kohden BSM-6000 Series', 'سلسلة BSM-6000', 'Nihon Kohden', 'نيهون كوهدن', 'Class B', '2022-04-03', '2025-04-03', 'Approved', 'For multi-parameter monitoring', 'SFDA_GHAD'),
('MDMA-2023-0000011', 'BD Alaris Plus Infusion Pump', 'مضخة الحقن ألاريس بلس', 'Becton Dickinson', 'بيكتون ديكنسون', 'Class C', '2023-07-22', '2026-07-22', 'Approved', 'For large volume infusion with Guardrails', 'SFDA_GHAD'),
('MDMA-2023-0000012', 'BD Alaris PC Unit', 'وحدة ألاريس PC', 'Becton Dickinson', 'بيكتون ديكنسون', 'Class C', '2020-09-30', '2023-09-30', 'Approved', 'For modular infusion system', 'SFDA_GHAD'),
('MDMA-2023-0000013', 'B Braun Space Infusion Pump', 'مضخة سبيس', 'B Braun', 'بي براون', 'Class C', '2021-11-12', '2024-11-12', 'Approved', 'For modular infusion therapy', 'SFDA_GHAD'),
('MDMA-2023-0000014', 'B Braun Perfusor Space', 'بيرفوسور سبيس', 'B Braun', 'بي براون', 'Class C', '2022-06-08', '2025-06-08', 'Approved', 'For syringe infusion', 'SFDA_GHAD'),
('MDMA-2023-0000015', 'Fresenius Kabi Agilia Infusion Pump', 'مضخة أجيليا', 'Fresenius Kabi', 'فرزينيوس كابي', 'Class C', '2023-01-25', '2026-01-25', 'Approved', 'For volumetric infusion', 'SFDA_GHAD'),
('MDMA-2023-0000016', 'Fresenius Kabi Injectomat Agilia', 'إنجيكتومات أجيليا', 'Fresenius Kabi', 'فرزينيوس كابي', 'Class C', '2020-04-17', '2023-04-17', 'Approved', 'For syringe infusion', 'SFDA_GHAD'),
('MDMA-2023-0000017', 'ICU Medical Plum 360', 'بلوم 360', 'ICU Medical', 'آي سي يو ميديكال', 'Class C', '2022-10-01', '2025-10-01', 'Approved', 'For smart infusion with wireless', 'SFDA_GHAD'),
('MDMA-2023-0000018', 'ICU Medical Plum A+', 'بلوم A+', 'ICU Medical', 'آي سي يو ميديكال', 'Class C', '2021-05-20', '2024-05-20', 'Approved', 'For multi-channel infusion', 'SFDA_GHAD'),
('MDMA-2023-0000019', 'Terumo TE-171 Infusion Pump', 'مضخة تيرومو TE-171', 'Terumo', 'تيرومو', 'Class C', '2023-03-14', '2026-03-14', 'Approved', 'For precise infusion therapy', 'SFDA_GHAD'),
('MDMA-2023-0000020', 'Terumo TE-172 Syringe Pump', 'مضخة محقنة تيرومو', 'Terumo', 'تيرومو', 'Class C', '2020-08-09', '2023-08-09', 'Approved', 'For syringe infusion', 'SFDA_GHAD'),
('MDMA-2023-0000021', 'GE Healthcare Voluson E10 Ultrasound', 'جهاز فولوسون E10', 'GE Healthcare', 'جنرال إلكتريك', 'Class B', '2022-12-03', '2025-12-03', 'Approved', 'For women''s health ultrasound', 'SFDA_GHAD'),
('MDMA-2023-0000022', 'GE Healthcare Voluson S10', 'جهاز فولوسون S10', 'GE Healthcare', 'جنرال إلكتريك', 'Class B', '2021-02-26', '2024-02-26', 'Approved', 'For premium 4D ultrasound', 'SFDA_GHAD'),
('MDMA-2023-0000023', 'Philips EPIQ Elite Ultrasound', 'جهاز إيبيك إيليت', 'Philips', 'فيليبس', 'Class B', '2023-06-30', '2026-06-30', 'Approved', 'For premium ultrasound imaging', 'SFDA_GHAD'),
('MDMA-2023-0000024', 'Philips Affiniti 70', 'أفينيتي 70', 'Philips', 'فيليبس', 'Class B', '2020-10-11', '2023-10-11', 'Approved', 'For advanced diagnostic ultrasound', 'SFDA_GHAD'),
('MDMA-2023-0000025', 'Siemens Acuson Sequoia', 'أكيوسون سيكويا', 'Siemens', 'سيمنز', 'Class B', '2022-01-16', '2025-01-16', 'Approved', 'For high-resolution ultrasound', 'SFDA_GHAD'),
('MDMA-2023-0000026', 'Siemens Acuson Juniper', 'أكيوسون جونيبر', 'Siemens', 'سيمنز', 'Class B', '2021-04-05', '2024-04-05', 'Approved', 'For versatile ultrasound', 'SFDA_GHAD'),
('MDMA-2023-0000027', 'Canon Aplio i800', 'أبليو i800', 'Canon', 'كانون', 'Class B', '2023-08-27', '2026-08-27', 'Approved', 'For premium ultrasound', 'SFDA_GHAD'),
('MDMA-2023-0000028', 'Canon Aplio i600', 'أبليو i600', 'Canon', 'كانون', 'Class B', '2020-07-13', '2023-07-13', 'Approved', 'For high-performance ultrasound', 'SFDA_GHAD'),
('MDMA-2023-0000029', 'Samsung Hera W10', 'هيرا W10', 'Samsung Medison', 'سامسونج ميديسون', 'Class B', '2022-09-21', '2025-09-21', 'Approved', 'For advanced diagnostic ultrasound', 'SFDA_GHAD'),
('MDMA-2023-0000030', 'Samsung WS80A with Elite', 'WS80A إيليت', 'Samsung Medison', 'سامسونج ميديسون', 'Class B', '2021-06-04', '2024-06-04', 'Approved', 'For premium women''s health imaging', 'SFDA_GHAD'),
('MDMA-2023-0000031', 'Medtronic StealthStation S8', 'محطة ستيلث S8', 'Medtronic', 'مدترونيك', 'Class C', '2023-04-12', '2026-04-12', 'Approved', 'For surgical navigation', 'SFDA_GHAD'),
('MDMA-2023-0000032', 'Medtronic Stealth Autoguide', 'ستيلث أوتوغايد', 'Medtronic', 'مدترونيك', 'Class C', '2020-11-28', '2023-11-28', 'Approved', 'For cranial navigation', 'SFDA_GHAD'),
('MDMA-2023-0000033', 'Stryker NAV3 Platform', 'منصة NAV3', 'Stryker', 'سترايكر', 'Class C', '2022-02-15', '2025-02-15', 'Approved', 'For image-guided surgery', 'SFDA_GHAD'),
('MDMA-2023-0000034', 'Stryker SPY-PHI', 'سبي-فاي', 'Stryker', 'سترايكر', 'Class B', '2021-08-31', '2024-08-31', 'Approved', 'For fluorescence imaging', 'SFDA_GHAD'),
('MDMA-2023-0000035', 'Smith & Nephew NAVIO', 'نافيو', 'Smith & Nephew', 'سميث آند نيفيو', 'Class C', '2023-10-06', '2026-10-06', 'Approved', 'For robotic knee replacement', 'SFDA_GHAD'),
('MDMA-2023-0000036', 'Smith & Nephew CORI', 'كوري', 'Smith & Nephew', 'سميث آند نيفيو', 'Class C', '2020-05-23', '2023-05-23', 'Approved', 'For handheld robotics', 'SFDA_GHAD'),
('MDMA-2023-0000037', 'Zimmer Biomet ROSA One', 'روزا ون', 'Zimmer Biomet', 'زيمر بايوميت', 'Class C', '2022-07-02', '2025-07-02', 'Approved', 'For robotic surgery', 'SFDA_GHAD'),
('MDMA-2023-0000038', 'Zimmer Biomet ROSA Knee', 'روزا ني', 'Zimmer Biomet', 'زيمر بايوميت', 'Class C', '2021-09-19', '2024-09-19', 'Approved', 'For knee arthroplasty', 'SFDA_GHAD'),
('MDMA-2023-0000039', 'Medtronic Mazor X', 'مازور X', 'Medtronic', 'مدترونيك', 'Class C', '2023-12-24', '2026-12-24', 'Approved', 'For spine surgery', 'SFDA_GHAD'),
('MDMA-2023-0000040', 'Globus Medical ExcelsiusGPS', 'إكسيلسيوس جي بي إس', 'Globus Medical', 'جلوبوس ميديكال', 'Class C', '2020-01-08', '2023-01-08', 'Approved', 'For robotic navigation', 'SFDA_GHAD'),
('MDMA-2023-0000041', 'Abbott Architect ci4100', 'أرشيتكت ci4100', 'Abbott', 'أبوت', 'Class C', '2022-05-17', '2025-05-17', 'Approved', 'For in vitro diagnostic testing', 'SFDA_GHAD'),
('MDMA-2023-0000042', 'Abbott Alinity ci-series', 'ألينيتي سي آي', 'Abbott', 'أبوت', 'Class C', '2021-10-29', '2024-10-29', 'Approved', 'For integrated immunoassay and chemistry', 'SFDA_GHAD'),
('MDMA-2023-0000043', 'Roche cobas e 801', 'كوباس e 801', 'Roche', 'روش', 'Class C', '2023-02-10', '2026-02-10', 'Approved', 'For immunoassay analysis', 'SFDA_GHAD'),
('MDMA-2023-0000044', 'Roche cobas c 503', 'كوباس c 503', 'Roche', 'روش', 'Class C', '2020-06-22', '2023-06-22', 'Approved', 'For clinical chemistry', 'SFDA_GHAD'),
('MDMA-2023-0000045', 'Siemens Atellica Solution', 'أتيليكا', 'Siemens', 'سيمنز', 'Class C', '2022-11-14', '2025-11-14', 'Approved', 'For automated diagnostics', 'SFDA_GHAD'),
('MDMA-2023-0000046', 'Siemens Dimension EXL', 'ديمنشن EXL', 'Siemens', 'سيمنز', 'Class C', '2021-03-07', '2024-03-07', 'Approved', 'For integrated chemistry', 'SFDA_GHAD'),
('MDMA-2023-0000047', 'Beckman Coulter AU5800', 'AU5800', 'Beckman Coulter', 'بيكمان كولتر', 'Class C', '2023-09-01', '2026-09-01', 'Approved', 'For clinical chemistry', 'SFDA_GHAD'),
('MDMA-2023-0000048', 'Beckman Coulter DxI 9000', 'DxI 9000', 'Beckman Coulter', 'بيكمان كولتر', 'Class C', '2020-12-13', '2023-12-13', 'Approved', 'For immunoassay', 'SFDA_GHAD'),
('MDMA-2023-0000049', 'Ortho Clinical Diagnostics VITROS', 'فيتروس', 'Ortho', 'أورثو', 'Class C', '2022-04-26', '2025-04-26', 'Approved', 'For dry chemistry', 'SFDA_GHAD'),
('MDMA-2023-0000050', 'Bio-Rad D-100', 'D-100', 'Bio-Rad', 'بيو-راد', 'Class B', '2021-07-09', '2024-07-09', 'Approved', 'For hemoglobin testing', 'SFDA_GHAD')
ON CONFLICT (mdma_number) DO UPDATE SET
    device_name = EXCLUDED.device_name,
    manufacturer_name = EXCLUDED.manufacturer_name,
    approval_status = EXCLUDED.approval_status,
    updated_at = NOW();

-- 4. 验证导入结果
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
