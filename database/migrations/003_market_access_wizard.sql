-- 市场准入向导功能数据库表
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 1. 产品分类表
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES product_categories(id),
  name TEXT NOT NULL,
  name_zh TEXT,
  code TEXT UNIQUE,
  level INT DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX idx_product_categories_code ON product_categories(code);

-- 2. 市场准入指南表
CREATE TABLE IF NOT EXISTS market_access_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_category_id UUID REFERENCES product_categories(id),
  product_keywords TEXT[], -- 产品关键词搜索
  country TEXT NOT NULL, -- 目标国家
  country_name TEXT, -- 国家中文名
  classification TEXT, -- 产品分类（如 Class A）
  classification_description TEXT, -- 分类说明
  required_documents JSONB, -- 必需文件清单
  process_steps JSONB, -- 流程步骤
  official_fees DECIMAL(10,2), -- 官方费用（本币）
  official_fees_usd DECIMAL(10,2), -- 官方费用（美元）
  currency TEXT, -- 币种
  estimated_days_min INT, -- 最短周期（天）
  estimated_days_max INT, -- 最长周期（天）
  estimated_days_avg INT, -- 平均周期（天）
  validity_period INT, -- 证书有效期（月）
  gmp_required BOOLEAN DEFAULT FALSE, -- GMP 要求
  local_agent_required BOOLEAN DEFAULT TRUE, -- 本地代理要求
  clinical_data_required BOOLEAN DEFAULT FALSE, -- 临床数据要求
  notes TEXT, -- 注意事项
  difficulty_index INT DEFAULT 50, -- 准入难度指数（0-100）
  is_active BOOLEAN DEFAULT TRUE,
  data_source TEXT, -- 数据来源
  last_updated DATE, -- 数据更新日期
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_market_access_country ON market_access_guides(country);
CREATE INDEX idx_market_access_product ON market_access_guides(product_category_id);
CREATE INDEX idx_market_access_keywords ON market_access_guides USING GIN(product_keywords);

-- 3. 文档模板表
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_zh TEXT,
  category TEXT NOT NULL, -- technical/management/declaration/commercial
  subcategory TEXT,
  country TEXT, -- 适用国家（NULL 表示通用）
  file_url TEXT NOT NULL, -- 文件 URL
  file_type TEXT, -- docx/pdf/xlsx
  file_size INT, -- 文件大小（KB）
  description TEXT,
  description_zh TEXT,
  download_count INT DEFAULT 0,
  is_free BOOLEAN DEFAULT TRUE, -- 是否免费
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_document_templates_category ON document_templates(category);
CREATE INDEX idx_document_templates_country ON document_templates(country);

-- 4. 模板下载记录表
CREATE TABLE IF NOT EXISTS template_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES document_templates(id),
  user_id UUID, -- 用户 ID（可选）
  user_email TEXT, -- 用户邮箱
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT
);

CREATE INDEX idx_template_downloads_template ON template_downloads(template_id);
CREATE INDEX idx_template_downloads_email ON template_downloads(user_email);

-- 5. 法规更新表
CREATE TABLE IF NOT EXISTS regulation_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  title TEXT NOT NULL,
  title_zh TEXT,
  summary TEXT, -- 摘要
  content TEXT, -- 完整内容
  content_html TEXT, -- HTML 格式
  product_categories TEXT[], -- 涉及产品类别
  regulation_type TEXT, -- 法规类型
  importance TEXT DEFAULT 'medium', -- high/medium/low
  effective_date DATE, -- 生效日期
  published_date DATE, -- 发布日期
  old_version_id UUID REFERENCES regulation_updates(id), -- 旧版本 ID
  changes_summary TEXT, -- 变化摘要
  impact_assessment TEXT, -- 影响评估
  source_url TEXT, -- 来源链接
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_regulation_updates_country ON regulation_updates(country);
CREATE INDEX idx_regulation_updates_date ON regulation_updates(published_date);
CREATE INDEX idx_regulation_updates_categories ON regulation_updates USING GIN(product_categories);

-- 6. 用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  countries TEXT[], -- 订阅的国家
  product_categories TEXT[], -- 订阅的产品类别
  notification_types TEXT[] DEFAULT ARRAY['email'], -- 通知方式
  frequency TEXT DEFAULT 'immediate', -- immediate/daily/weekly
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_subscriptions_email ON user_subscriptions(user_email);

-- 7. 插入示例数据

-- 产品分类示例
INSERT INTO product_categories (name, name_zh, code, level, description) VALUES
('Medical Device', '医疗器械', 'MD', 1, 'All medical devices'),
('PPE', '个人防护用品', 'PPE', 1, 'Personal Protective Equipment'),
('Surgical Mask', '医用口罩', 'MASK-SURG', 2, 'Surgical masks for medical use'),
('N95 Respirator', 'N95 呼吸器', 'MASK-N95', 2, 'N95 respirator masks'),
('Protective Clothing', '防护服', 'PPE-CLOTH', 2, 'Protective clothing'),
('Diagnostic Device', '诊断器械', 'DIAG', 2, 'Diagnostic devices'),
('Implant', '植入器械', 'IMPL', 2, 'Implantable devices');

-- 新加坡口罩市场准入数据
INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification, 
  classification_description, required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask', 'medical mask', 'face mask'],
  'SG', '新加坡',
  'Class A - Low Risk',
  '低风险医疗器械，包括非无菌外科口罩',
  '[
    {
      "name": "Product Information",
      "name_zh": "产品信息",
      "required": true,
      "description": "Detailed product description, intended use, specifications"
    },
    {
      "name": "Manufacturer License",
      "name_zh": "生产商资质",
      "required": true,
      "description": "ISO 13485 certificate or equivalent"
    },
    {
      "name": "Product Test Report",
      "name_zh": "产品检测报告",
      "required": true,
      "description": "ASTM F2100, EN 14683, or equivalent standards"
    },
    {
      "name": "Declaration of Conformity",
      "name_zh": "符合性声明",
      "required": true,
      "description": "CE marking or equivalent certification"
    },
    {
      "name": "Labeling",
      "name_zh": "标签",
      "required": true,
      "description": "Product labels in English"
    }
  ]'::JSONB,
  '[
    {
      "step": 1,
      "title": "Prepare Documentation",
      "title_zh": "准备文件",
      "description": "Gather all required documents",
      "estimated_days": 7
    },
    {
      "step": 2,
      "title": "Submit Application",
      "title_zh": "提交申请",
      "description": "Submit through HSA online portal",
      "estimated_days": 1
    },
    {
      "step": 3,
      "title": "Review Process",
      "title_zh": "审评",
      "description": "HSA reviews application",
      "estimated_days": 14
    },
    {
      "step": 4,
      "title": "Approval",
      "title_zh": "获批",
      "description": "Receive approval letter",
      "estimated_days": 7
    }
  ]'::JSONB,
  500.00, 370.00, 'SGD',
  14, 30, 21,
  60, false, true, false,
  '1. 必须通过新加坡 HSA 在线系统提交申请\n2. 所有文件必须为英文\n3. 需要新加坡本地代理商\n4. 产品必须符合 ASTM F2100 或 EN 14683 标准',
  30,
  'Health Sciences Authority (HSA) Singapore',
  CURRENT_DATE
);

-- 马来西亚口罩市场准入数据
INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification,
  required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask', 'medical mask'],
  'MY', '马来西亚',
  'Class I - Low Risk',
  '[
    {"name": "Product Information", "name_zh": "产品信息", "required": true},
    {"name": "ISO 13485 Certificate", "name_zh": "ISO 13485 证书", "required": true},
    {"name": "Test Report", "name_zh": "检测报告", "required": true},
    {"name": "CE Certificate", "name_zh": "CE 证书", "required": true},
    {"name": "Free Sale Certificate", "name_zh": "自由销售证明", "required": true},
    {"name": "GMP Certificate", "name_zh": "GMP 证书", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Prepare Documents", "title_zh": "准备文件", "estimated_days": 14},
    {"step": 2, "title": "Submit to MDA", "title_zh": "提交 MDA", "estimated_days": 1},
    {"step": 3, "title": "Evaluation", "title_zh": "技术审评", "estimated_days": 60},
    {"step": 4, "title": "Approval", "title_zh": "获批", "estimated_days": 15}
  ]'::JSONB,
  1000.00, 230.00, 'MYR',
  60, 120, 90,
  60, true, true, false,
  '1. 需要 GMP 证书\n2. 必须有马来西亚本地代理\n3. 审评周期较长',
  50,
  'Medical Device Authority (MDA) Malaysia',
  CURRENT_DATE
);

-- 泰国口罩市场准入数据
INSERT INTO market_access_guides (
  product_keywords, country, country_name, classification,
  required_documents, process_steps,
  official_fees, official_fees_usd, currency,
  estimated_days_min, estimated_days_max, estimated_days_avg,
  validity_period, gmp_required, local_agent_required, clinical_data_required,
  notes, difficulty_index, data_source, last_updated
) VALUES (
  ARRAY['mask', '口罩', 'surgical mask'],
  'TH', '泰国',
  'Class 1 - Low Risk',
  '[
    {"name": "Product Information", "name_zh": "产品信息", "required": true},
    {"name": "ISO 13485 Certificate", "name_zh": "ISO 13485 证书", "required": true},
    {"name": "Test Report", "name_zh": "检测报告", "required": true},
    {"name": "CE/FDA Certificate", "name_zh": "CE/FDA 证书", "required": true},
    {"name": "Free Sale Certificate", "name_zh": "自由销售证明", "required": true},
    {"name": "Power of Attorney", "name_zh": "授权书", "required": true},
    {"name": "Company Registration", "name_zh": "公司注册证明", "required": true}
  ]'::JSONB,
  '[
    {"step": 1, "title": "Prepare Documents", "title_zh": "准备文件", "estimated_days": 21},
    {"step": 2, "title": "Submit to Thai FDA", "title_zh": "提交泰国 FDA", "estimated_days": 1},
    {"step": 3, "title": "Document Review", "title_zh": "文件审评", "estimated_days": 90},
    {"step": 4, "title": "License Issuance", "title_zh": "颁发许可证", "estimated_days": 30}
  ]'::JSONB,
  5000.00, 150.00, 'THB',
  90, 180, 135,
  60, true, true, false,
  '1. 所有文件需泰文翻译\n2. 需要泰国本地代理\n3. 审评周期最长',
  60,
  'Thai Food and Drug Administration',
  CURRENT_DATE
);

-- 文档模板示例
INSERT INTO document_templates (title, title_zh, category, subcategory, country, file_url, file_type, description, description_zh, is_free) VALUES
('Declaration of Conformity Template', '符合性声明模板', 'declaration', 'general', NULL, '/templates/declaration-of-conformity.docx', 'docx', 'General template for medical device conformity declaration', '医疗器械符合性声明通用模板', true),
('Free Sale Certificate Template', '自由销售证明模板', 'declaration', 'general', NULL, '/templates/free-sale-certificate.docx', 'docx', 'Template for certificate of free sale', '自由销售证明通用模板', true),
('Product Information Template', '产品信息模板', 'technical', 'general', NULL, '/templates/product-information.docx', 'docx', 'Template for product technical information', '产品技术要求模板', true),
('Commercial Invoice Template', '商业发票模板', 'commercial', 'general', NULL, '/templates/commercial-invoice.docx', 'docx', 'Standard commercial invoice template', '标准商业发票模板', true),
('Packing List Template', '装箱单模板', 'commercial', 'general', NULL, '/templates/packing-list.docx', 'docx', 'Standard packing list template', '标准装箱单模板', true),
('Power of Attorney Template', '授权书模板', 'legal', 'general', NULL, '/templates/power-of-attorney.docx', 'docx', 'Template for authorization letter', '授权书通用模板', true),
('ISO 13485 Certificate Sample', 'ISO13485 证书样例', 'management', 'quality', NULL, '/templates/iso13485-sample.pdf', 'pdf', 'Sample ISO 13485 certificate', 'ISO13485 证书样例', true),
('GMP Certificate Sample', 'GMP 证书样例', 'management', 'quality', NULL, '/templates/gmp-sample.pdf', 'pdf', 'Sample GMP certificate', 'GMP 证书样例', true);

-- 创建视图：市场准入指南概览
CREATE OR REPLACE VIEW market_access_summary AS
SELECT 
  id,
  country,
  country_name,
  classification,
  official_fees_usd,
  estimated_days_avg,
  difficulty_index,
  gmp_required,
  local_agent_required,
  clinical_data_required,
  data_source,
  last_updated
FROM market_access_guides
WHERE is_active = true;

-- 注释
COMMENT ON TABLE market_access_guides IS '市场准入指南 - 各国医疗器械注册要求';
COMMENT ON TABLE document_templates IS '文档模板库 - 可下载的模板文件';
COMMENT ON TABLE regulation_updates IS '法规更新 - 各国法规变化';
