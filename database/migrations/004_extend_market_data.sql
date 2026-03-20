-- 扩展数据：添加更多国家和产品的市场准入数据
-- 在 Supabase Dashboard → SQL Editor 中执行

-- ============================================
-- 1. 添加更多产品分类
-- ============================================

INSERT INTO product_categories (name, name_zh, code, level, description) VALUES
('Infusion Pump', '输液泵', 'PUMP-INF', 2, 'Infusion pumps for medical use'),
('Syringe Pump', '注射泵', 'PUMP-SYR', 2, 'Syringe pumps for medical use'),
('Patient Monitor', '病人监护仪', 'MONITOR', 2, 'Patient monitoring systems'),
('ECG Machine', '心电图机', 'ECG', 2, 'Electrocardiograph machines'),
('Ultrasound System', '超声系统', 'ULTRA', 2, 'Ultrasound imaging systems'),
('X-Ray System', 'X 射线系统', 'XRAY', 2, 'X-ray imaging systems'),
('Surgical Glove', '医用手套', 'GLOVE', 2, 'Surgical and examination gloves'),
('Face Mask N95', 'N95 口罩', 'MASK-N95-KN95', 2, 'N95/KN95 respirator masks'),
('Thermometer', '体温计', 'THERM', 2, 'Digital and infrared thermometers'),
('Blood Glucose Meter', '血糖仪', 'GLUCOSE', 2, 'Blood glucose monitoring systems');

-- ============================================
-- 2. 美国市场准入数据
-- ============================================

INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification,
  classification_description, required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask', 'medical mask', 'face mask'],
  'US', '美国',
  'Class II - Moderate Risk',
  '中风险医疗器械，需要 510(k) 上市前通知',
  '[
    {"name": "510(k) Application", "name_zh": "510(k) 申请", "required": true, "description": "Premarket notification with substantial equivalence"},
    {"name": "Product Information", "name_zh": "产品信息", "required": true, "description": "Detailed product description and specifications"},
    {"name": "FDA Facility Registration", "name_zh": "FDA 设施注册", "required": true, "description": "Establishment registration and device listing"},
    {"name": "Quality System (QSR)", "name_zh": "质量体系", "required": true, "description": "21 CFR Part 820 compliance"},
    {"name": "Product Testing", "name_zh": "产品检测", "required": true, "description": "ASTM F2100, BFE, PFE, differential pressure"},
    {"name": "Labeling", "name_zh": "标签", "required": true, "description": "21 CFR Part 801 compliant labeling"}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Prepare 510(k)", "title_zh": "准备 510(k)", "estimated_days": 60},
    {"step": 2, "title": "Submit to FDA", "title_zh": "提交 FDA", "estimated_days": 1},
    {"step": 3, "title": "FDA Review", "title_zh": "FDA 审评", "estimated_days": 90},
    {"step": 4, "title": "Clearance", "title_zh": "获批", "estimated_days": 30}
  ]'::JSONB,
  12000.00, 12000.00, 'USD',
  120, 180, 150,
  12, true, false, false,
  '1. 需要 510(k) 上市前通知\n2. 需要 FDA 设施注册\n3. 必须符合 21 CFR Part 820 质量体系\n4. 建议聘请美国代理人',
  70,
  'U.S. Food and Drug Administration (FDA)',
  CURRENT_DATE
),
(
  ARRAY['infusion pump', '输液泵', 'pump'],
  'US', '美国',
  'Class II - Moderate Risk',
  '中风险医疗器械，需要 510(k)',
  '[
    {"name": "510(k) Application", "name_zh": "510(k) 申请", "required": true},
    {"name": "Product Information", "name_zh": "产品信息", "required": true},
    {"name": "FDA Facility Registration", "name_zh": "FDA 设施注册", "required": true},
    {"name": "Quality System (QSR)", "name_zh": "质量体系", "required": true},
    {"name": "Electrical Safety Testing", "name_zh": "电气安全测试", "required": true},
    {"name": "Software Validation", "name_zh": "软件验证", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Prepare Documentation", "title_zh": "准备文件", "estimated_days": 90},
    {"step": 2, "title": "Submit to FDA", "title_zh": "提交 FDA", "estimated_days": 1},
    {"step": 3, "title": "FDA Review", "title_zh": "FDA 审评", "estimated_days": 90},
    {"step": 4, "title": "Clearance", "title_zh": "获批", "estimated_days": 30}
  ]'::JSONB,
  12000.00, 12000.00, 'USD',
  150, 210, 180,
  12, true, false, true,
  '1. 需要 510(k) 审评\n2. 需要软件验证\n3. 可能需要临床数据',
  75,
  'FDA',
  CURRENT_DATE
);

-- ============================================
-- 3. 欧盟市场准入数据 (CE 认证)
-- ============================================

INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification,
  required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask', 'medical device'],
  'DE', '德国',
  'Class I - Low Risk',
  '[
    {"name": "Technical Documentation", "name_zh": "技术文件", "required": true, "description": "MDR Annex II and III documentation"},
    {"name": "Declaration of Conformity", "name_zh": "符合性声明", "required": true},
    {"name": "CE Certificate", "name_zh": "CE 证书", "required": true, "description": "From Notified Body if applicable"},
    {"name": "Quality Management System", "name_zh": "质量管理体系", "required": true, "description": "ISO 13485 certificate"},
    {"name": "Clinical Evaluation", "name_zh": "临床评估", "required": true},
    {"name": "Post-Market Surveillance", "name_zh": "上市后监管", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Prepare Technical File", "title_zh": "准备技术文件", "estimated_days": 60},
    {"step": 2, "title": "Notified Body Review", "title_zh": "公告机构审评", "estimated_days": 90},
    {"step": 3, "title": "CE Certification", "title_zh": "CE 认证", "estimated_days": 30},
    {"step": 4, "title": "Registration", "title_zh": "注册", "estimated_days": 30}
  ]'::JSONB,
  5000.00, 5400.00, 'EUR',
  120, 210, 165,
  60, true, false, false,
  '1. 必须符合欧盟 MDR 法规\n2. 需要欧盟授权代表\n3. 需要在 EUDAMED 注册',
  65,
  'European Commission - MDR',
  CURRENT_DATE
),
(
  ARRAY['infusion pump', '输液泵'],
  'DE', '德国',
  'Class IIa - Medium Risk',
  '[
    {"name": "Technical Documentation", "name_zh": "技术文件", "required": true},
    {"name": "Declaration of Conformity", "name_zh": "符合性声明", "required": true},
    {"name": "CE Certificate", "name_zh": "CE 证书", "required": true},
    {"name": "Quality Management System", "name_zh": "质量管理体系", "required": true},
    {"name": "Clinical Evaluation", "name_zh": "临床评估", "required": true},
    {"name": "Notified Body Audit", "name_zh": "公告机构审核", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Prepare Documentation", "title_zh": "准备文件", "estimated_days": 90},
    {"step": 2, "title": "Notified Body Audit", "title_zh": "公告机构审核", "estimated_days": 120},
    {"step": 3, "title": "CE Certification", "title_zh": "CE 认证", "estimated_days": 60},
    {"step": 4, "title": "Registration", "title_zh": "注册", "estimated_days": 30}
  ]'::JSONB,
  15000.00, 16200.00, 'EUR',
  180, 300, 240,
  60, true, false, true,
  '1. Class IIa 需要公告机构参与\n2. 需要临床评估\n3. 审评周期较长',
  75,
  'EU MDR',
  CURRENT_DATE
);

-- ============================================
-- 4. 澳大利亚市场准入数据
-- ============================================

INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification,
  required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask'],
  'AU', '澳大利亚',
  'Class I - Low Risk',
  '[
    {"name": "Application for Inclusion", "name_zh": "列入申请", "required": true},
    {"name": "Product Information", "name_zh": "产品信息", "required": true},
    {"name": "CE or FDA Certificate", "name_zh": "CE 或 FDA 证书", "required": true},
    {"name": "ISO 13485 Certificate", "name_zh": "ISO 13485 证书", "required": true},
    {"name": "Declaration of Conformity", "name_zh": "符合性声明", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Prepare Application", "title_zh": "准备申请", "estimated_days": 30},
    {"step": 2, "title": "Submit to TGA", "title_zh": "提交 TGA", "estimated_days": 1},
    {"step": 3, "title": "TGA Review", "title_zh": "TGA 审评", "estimated_days": 60},
    {"step": 4, "title": "Inclusion in ARTG", "title_zh": "列入 ARTG", "estimated_days": 30}
  ]'::JSONB,
  380.00, 250.00, 'AUD',
  60, 120, 90,
  60, true, true, false,
  '1. 需要澳大利亚赞助商\n2. 接受 CE 或 FDA 认证\n3. 审评周期中等',
  45,
  'Therapeutic Goods Administration (TGA)',
  CURRENT_DATE
);

-- ============================================
-- 5. 日本市场准入数据
-- ============================================

INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification,
  required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask'],
  'JP', '日本',
  'Class I - Low Risk',
  '[
    {"name": "Notification", "name_zh": "申报", "required": true, "description": "Pre-market notification to MHLW"},
    {"name": "Product Information", "name_zh": "产品信息", "required": true},
    {"name": "Quality Management System", "name_zh": "质量管理体系", "required": true, "description": "QMS ordinance compliance"},
    {"name": "Marketing Plan", "name_zh": "销售计划", "required": true},
    {"name": "Foreign Manufacturer Registration", "name_zh": "外国制造商注册", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Appoint MAH", "title_zh": "指定上市许可持有人", "estimated_days": 30},
    {"step": 2, "title": "Prepare Documents", "title_zh": "准备文件", "estimated_days": 60},
    {"step": 3, "title": "Submit Notification", "title_zh": "提交申报", "estimated_days": 1},
    {"step": 4, "title": "Approval", "title_zh": "获批", "estimated_days": 60}
  ]'::JSONB,
  0.00, 0.00, 'JPY',
  90, 150, 120,
  60, true, true, false,
  '1. 需要日本上市许可持有人 (MAH)\n2. 需要外国制造商注册\n3. 申报制（无需审评）',
  50,
  'Ministry of Health, Labour and Welfare (MHLW)',
  CURRENT_DATE
);

-- ============================================
-- 6. 韩国市场准入数据
-- ============================================

INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification,
  required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask'],
  'KR', '韩国',
  'Class I - Low Risk',
  '[
    {"name": "Manufacturing License", "name_zh": "生产许可证", "required": true},
    {"name": "Product Information", "name_zh": "产品信息", "required": true},
    {"name": "Quality Management System", "name_zh": "质量管理体系", "required": true, "description": "ISO 13485 or KGMP"},
    {"name": "Test Report", "name_zh": "检测报告", "required": true},
    {"name": "Authorization Letter", "name_zh": "授权书", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Prepare Documents", "title_zh": "准备文件", "estimated_days": 60},
    {"step": 2, "title": "Submit to MFDS", "title_zh": "提交 MFDS", "estimated_days": 1},
    {"step": 3, "title": "Review", "title_zh": "审评", "estimated_days": 60},
    {"step": 4, "title": "Approval", "title_zh": "获批", "estimated_days": 30}
  ]'::JSONB,
  0.00, 0.00, 'KRW',
  90, 150, 120,
  60, true, true, false,
  '1. 需要韩国进口商\n2. 需要 KGMP 或 ISO 13485\n3. 审评周期中等',
  55,
  'Ministry of Food and Drug Safety (MFDS)',
  CURRENT_DATE
);

-- ============================================
-- 7. 印度市场准入数据
-- ============================================

INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification,
  required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask', 'medical device'],
  'IN', '印度',
  'Class A - Low Risk',
  '[
    {"name": "Import License", "name_zh": "进口许可证", "required": true, "description": "Form MD-14"},
    {"name": "Manufacturing License", "name_zh": "生产许可证", "required": true},
    {"name": "Product Information", "name_zh": "产品信息", "required": true},
    {"name": "Quality Management System", "name_zh": "质量管理体系", "required": true, "description": "ISO 13485"},
    {"name": "Free Sale Certificate", "name_zh": "自由销售证明", "required": true},
    {"name": "Power of Attorney", "name_zh": "授权书", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Appoint Authorized Agent", "title_zh": "指定授权代理", "estimated_days": 30},
    {"step": 2, "title": "Prepare Documents", "title_zh": "准备文件", "estimated_days": 60},
    {"step": 3, "title": "Submit to CDSCO", "title_zh": "提交 CDSCO", "estimated_days": 1},
    {"step": 4, "title": "Review and Approval", "title_zh": "审评和获批", "estimated_days": 120}
  ]'::JSONB,
  1000.00, 12.00, 'USD',
  120, 240, 180,
  60, true, true, false,
  '1. 需要印度授权代理\n2. 需要进口许可证\n3. 审评周期较长',
  65,
  'Central Drugs Standard Control Organisation (CDSCO)',
  CURRENT_DATE
);

-- ============================================
-- 更新验证
-- ============================================

-- 验证新增数据
SELECT 
  country_name,
  classification,
  official_fees_usd,
  estimated_days_avg
FROM market_access_guides
ORDER BY country_name, classification;

-- 统计国家数量
SELECT 
  COUNT(DISTINCT country) as country_count,
  COUNT(*) as total_records
FROM market_access_guides;
