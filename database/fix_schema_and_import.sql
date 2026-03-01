-- 步骤1: 更新 companies 表结构
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS specialties JSONB,
ADD COLUMN IF NOT EXISTS certifications JSONB,
ADD COLUMN IF NOT EXISTS fda_registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_fda_sync TIMESTAMP WITH TIME ZONE;

-- 步骤2: 更新 products 表结构
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS fda_product_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS specifications JSONB,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- 步骤3: 同步 established_year 到 founded_year
UPDATE companies 
SET founded_year = established_year 
WHERE founded_year IS NULL AND established_year IS NOT NULL;

-- 步骤4: 插入公司数据
INSERT INTO companies (id, name, description, country, website, founded_year, employee_count, specialties, certifications, fda_registration_number, last_fda_sync) VALUES
('550e8400-e29b-41d4-a716-446655440001', '3M Healthcare', '3M Health Care is a global leader in medical products and solutions, offering a wide range of innovative products for healthcare professionals.', 'United States', 'https://www.3m.com/healthcare', 1902, '95000', '["infection prevention", "wound care", "oral care", "medical supplies"]', '["FDA", "CE", "ISO 13485"]', '3001234567', NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Medtronic', 'Medtronic is the world''s largest medical device company, providing innovative healthcare technology solutions for a wide range of medical conditions.', 'Ireland', 'https://www.medtronic.com', 1949, '90000', '["cardiac devices", "diabetes", "spine", "neuromodulation"]', '["FDA", "CE", "ISO 13485"]', '3002345678', NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Johnson & Johnson MedTech', 'Johnson & Johnson MedTech is a global leader in medical devices, offering innovative solutions across surgery, orthopaedics, and interventional solutions.', 'United States', 'https://www.jnj.com/medtech', 1886, '130000', '["surgery", "orthopaedics", "interventional", "vision"]', '["FDA", "CE", "ISO 13485"]', '3003456789', NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'Siemens Healthineers', 'Siemens Healthineers is a leading medical technology company providing imaging, laboratory diagnostics, and healthcare IT solutions.', 'Germany', 'https://www.siemens-healthineers.com', 1847, '66000', '["imaging", "diagnostics", "laboratory", "healthcare IT"]', '["FDA", "CE", "ISO 13485"]', '3004567890', NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'GE HealthCare', 'GE HealthCare is a leading global medical technology and digital solutions innovator, enabling clinicians to make faster, more informed decisions.', 'United States', 'https://www.gehealthcare.com', 1994, '51000', '["imaging", "ultrasound", "life care solutions", "pharmaceutical diagnostics"]', '["FDA", "CE", "ISO 13485"]', '3005678901', NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'Philips Healthcare', 'Philips Healthcare focuses on improving people''s lives through meaningful innovation in health technology across diagnosis, treatment, and home care.', 'Netherlands', 'https://www.philips.com/healthcare', 1891, '82000', '["imaging", "patient monitoring", "sleep", "respiratory"]', '["FDA", "CE", "ISO 13485"]', '3006789012', NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'Abbott', 'Abbott is a global healthcare leader that helps people live more fully at all stages of life with a diverse portfolio of health technologies.', 'United States', 'https://www.abbott.com', 1888, '113000', '["diagnostics", "medical devices", "nutrition", "pharmaceuticals"]', '["FDA", "CE", "ISO 13485"]', '3007890123', NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'Stryker', 'Stryker is one of the world''s leading medical technology companies, offering innovative products and services in orthopaedics and medical/surgical equipment.', 'United States', 'https://www.stryker.com', 1941, '43000', '["orthopaedics", "medical", "surgical", "neurotechnology"]', '["FDA", "CE", "ISO 13485"]', '3008901234', NOW()),
('550e8400-e29b-41d4-a716-446655440009', 'Becton Dickinson', 'BD is one of the largest global medical technology companies, advancing the world of health by improving medical discovery, diagnostics, and care delivery.', 'United States', 'https://www.bd.com', 1897, '75000', '["medication management", "diabetes care", "pharmaceutical systems", "biosciences"]', '["FDA", "CE", "ISO 13485"]', '3009012345', NOW()),
('550e8400-e29b-41d4-a716-446655440010', 'Cardinal Health', 'Cardinal Health is a global, integrated healthcare services and products company, providing customized solutions for hospitals and healthcare systems.', 'United States', 'https://www.cardinalhealth.com', 1971, '46000', '["medical products", "pharmaceutical distribution", "at-home solutions", "specialty pharmacy"]', '["FDA", "CE", "ISO 13485"]', '3010123456', NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'Boston Scientific', 'Boston Scientific transforms lives through innovative medical solutions that improve the health of patients around the world.', 'United States', 'https://www.bostonscientific.com', 1979, '41000', '["interventional cardiology", "peripheral interventions", "cardiac rhythm", "endoscopy"]', '["FDA", "CE", "ISO 13485"]', '3011234567', NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'Baxter', 'Baxter provides a broad portfolio of essential healthcare products, including acute and chronic dialysis therapies and sterile IV solutions.', 'United States', 'https://www.baxter.com', 1931, '60000', '["renal care", "hospital products", "clinical nutrition", "biopharma"]', '["FDA", "CE", "ISO 13485"]', '3012345678', NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  country = EXCLUDED.country,
  website = EXCLUDED.website,
  founded_year = EXCLUDED.founded_year,
  employee_count = EXCLUDED.employee_count,
  specialties = EXCLUDED.specialties,
  certifications = EXCLUDED.certifications,
  fda_registration_number = EXCLUDED.fda_registration_number,
  last_fda_sync = EXCLUDED.last_fda_sync,
  updated_at = NOW();

-- 步骤5: 插入产品数据
INSERT INTO products (id, name, description, category, company_id, fda_product_code, certifications, specifications, status) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'N95 Respirator Mask', 'NIOSH-approved N95 respirator mask with 95% filtration efficiency against airborne particles.', 'Protective Equipment', '550e8400-e29b-41d4-a716-446655440001', 'LYZ', '["FDA", "NIOSH", "CE"]', '{"filtration": "95%", "material": "Polypropylene", "pack_size": "20/box"}', 'active'),
('660e8400-e29b-41d4-a716-446655440002', 'Surgical Mask Level 3', 'ASTM Level 3 surgical mask providing maximum barrier protection for heavy fluid exposure.', 'Protective Equipment', '550e8400-e29b-41d4-a716-446655440001', 'FXX', '["FDA", "ASTM Level 3"]', '{"filtration": "98%", "fluid_resistance": "160 mmHg", "pack_size": "50/box"}', 'active'),
('660e8400-e29b-41d4-a716-446655440003', 'Pacemaker', 'Advanced cardiac pacemaker with wireless monitoring capabilities and adaptive rate response.', 'Cardiac Devices', '550e8400-e29b-41d4-a716-446655440002', 'DSY', '["FDA", "CE"]', '{"battery_life": "10 years", "weight": "25g", "dimensions": "45x45x6mm"}', 'active'),
('660e8400-e29b-41d4-a716-446655440004', 'Insulin Pump', 'Smart insulin delivery system with continuous glucose monitoring integration and mobile app control.', 'Diabetes Care', '550e8400-e29b-41d4-a716-446655440002', 'LZG', '["FDA", "CE"]', '{"reservoir": "300 units", "battery": "Rechargeable", "connectivity": "Bluetooth"}', 'active'),
('660e8400-e29b-41d4-a716-446655440005', 'Surgical Stapler', 'Powered surgical stapler with smart tissue sensing technology for precise staple formation.', 'Surgical Equipment', '550e8400-e29b-41d4-a716-446655440003', 'GDW', '["FDA", "CE"]', '{"staple_lines": "6 rows", "tissue_thickness": "0.75-2.0mm", "sterilization": "EO"}', 'active'),
('660e8400-e29b-41d4-a716-446655440006', 'Hip Replacement System', 'Advanced hip arthroplasty system with ceramic-on-ceramic bearing surfaces for longevity.', 'Orthopaedic Implants', '550e8400-e29b-41d4-a716-446655440003', 'JDI', '["FDA", "CE"]', '{"bearing": "Ceramic-on-Ceramic", "stem_material": "Titanium", "cup_material": "Alumina"}', 'active'),
('660e8400-e29b-41d4-a716-446655440007', 'MRI Scanner 3T', 'High-field 3 Tesla MRI system with advanced imaging capabilities and patient comfort features.', 'Medical Imaging', '550e8400-e29b-41d4-a716-446655440004', 'LNH', '["FDA", "CE"]', '{"field_strength": "3 Tesla", "bore_size": "70cm", "gradient_amplitude": "80 mT/m"}', 'active'),
('660e8400-e29b-41d4-a716-446655440008', 'CT Scanner', 'Advanced computed tomography system with low-dose imaging and AI-powered reconstruction.', 'Medical Imaging', '550e8400-e29b-41d4-a716-446655440004', 'JAK', '["FDA", "CE"]', '{"slices": "256", "rotation_time": "0.28s", "spatial_resolution": "0.23mm"}', 'active'),
('660e8400-e29b-41d4-a716-446655440009', 'Ultrasound System', 'Premium ultrasound system with advanced imaging modes for cardiology and radiology applications.', 'Medical Imaging', '550e8400-e29b-41d4-a716-446655440005', 'ITX', '["FDA", "CE"]', '{"transducers": "15+", "display": "23\" OLED", "connectivity": "DICOM 3.0"}', 'active'),
('660e8400-e29b-41d4-a716-446655440010', 'Patient Monitor', 'Multi-parameter patient monitor with touchscreen interface and centralized monitoring capability.', 'Patient Monitoring', '550e8400-e29b-41d4-a716-446655440005', 'BZS', '["FDA", "CE"]', '{"parameters": "ECG, SpO2, NIBP, Temp, Resp", "display": "15\" touchscreen", "battery": "4 hours"}', 'active'),
('660e8400-e29b-41d4-a716-446655440011', 'CPAP Machine', 'Auto-adjusting CPAP device with humidification and wireless data transmission for sleep apnea.', 'Respiratory Care', '550e8400-e29b-41d4-a716-446655440006', 'BZD', '["FDA", "CE"]', '{"pressure_range": "4-20 cmH2O", "humidifier": "Heated", "noise_level": "<30 dBA"}', 'active'),
('660e8400-e29b-41d4-a716-446655440012', 'Ventilator', 'Critical care ventilator with advanced modes and lung protective ventilation strategies.', 'Respiratory Care', '550e8400-e29b-41d4-a716-446655440006', 'BTZ', '["FDA", "CE"]', '{"modes": "Volume/Pressure", "monitoring": "Comprehensive", "battery_backup": "4 hours"}', 'active'),
('660e8400-e29b-41d4-a716-446655440013', 'Blood Glucose Monitor', 'Continuous glucose monitoring system with real-time alerts and smartphone integration.', 'Diabetes Care', '550e8400-e29b-41d4-a716-446655440007', 'CFR', '["FDA", "CE"]', '{"sensor_life": "14 days", "readings": "Every minute", "calibration": "Factory calibrated"}', 'active'),
('660e8400-e29b-41d4-a716-446655440014', 'Coagulation Analyzer', 'Automated coagulation testing system for rapid and accurate hemostasis diagnostics.', 'Diagnostics', '550e8400-e29b-41d4-a716-446655440007', 'GKZ', '["FDA", "CE"]', '{"tests": "PT, aPTT, Fibrinogen", "throughput": "120 tests/hour", "sample_volume": "2 μL"}', 'active'),
('660e8400-e29b-41d4-a716-446655440015', 'Knee Replacement System', 'Total knee arthroplasty system with patient-specific instrumentation for optimal alignment.', 'Orthopaedic Implants', '550e8400-e29b-41d4-a716-446655440008', 'JWH', '["FDA", "CE"]', '{"bearing": "CR or PS", "fixation": "Cemented/Uncemented", "sizes": "10 femoral, 12 tibial"}', 'active'),
('660e8400-e29b-41d4-a716-446655440016', 'Surgical Navigation System', 'Computer-assisted surgery system for precise implant placement in joint replacement.', 'Surgical Equipment', '550e8400-e29b-41d4-a716-446655440008', 'LLZ', '["FDA", "CE"]', '{"accuracy": "<1mm", "tracking": "Optical", "compatibility": "Multiple implant systems"}', 'active'),
('660e8400-e29b-41d4-a716-446655440017', 'Syringe Pump', 'Precision syringe pump for accurate medication delivery in critical care settings.', 'Infusion Therapy', '550e8400-e29b-41d4-a716-446655440009', 'FRN', '["FDA", "CE"]', '{"flow_rate": "0.1-999 mL/h", "accuracy": "±2%", "syringe_sizes": "5-60 mL"}', 'active'),
('660e8400-e29b-41d4-a716-446655440018', 'Safety IV Catheter', 'Peripheral IV catheter with safety mechanism to prevent needlestick injuries.', 'Infusion Therapy', '550e8400-e29b-41d4-a716-446655440009', 'FMI', '["FDA", "CE", "OSHA"]', '{"gauge": "14-24G", "length": "0.75-2.5\"", "safety": "Passive shield"}', 'active'),
('660e8400-e29b-41d4-a716-446655440019', 'Surgical Gloves', 'Powder-free latex surgical gloves with enhanced tactile sensitivity and grip.', 'Protective Equipment', '550e8400-e29b-41d4-a716-446655440010', 'LZS', '["FDA", "CE"]', '{"material": "Latex", "powder": "None", "sterility": "Sterile"}', 'active'),
('660e8400-e29b-41d4-a716-446655440020', 'Wound Dressing', 'Advanced wound dressing with antimicrobial silver for infected wound management.', 'Wound Care', '550e8400-e29b-41d4-a716-446655440010', 'FRO', '["FDA", "CE"]', '{"active": "Silver", "wear_time": "7 days", "conformability": "High"}', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  fda_product_code = EXCLUDED.fda_product_code,
  certifications = EXCLUDED.certifications,
  specifications = EXCLUDED.specifications,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 步骤6: 验证导入结果
SELECT 'Companies imported: ' || COUNT(*)::text as result FROM companies
UNION ALL
SELECT 'Products imported: ' || COUNT(*)::text as result FROM products;
