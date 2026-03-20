-- Help Center Database Schema
-- MDLooker Platform

-- FAQ Categories
CREATE TABLE IF NOT EXISTS faq_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(255) NOT NULL,
    name_zh VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_zh TEXT,
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQs
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES faq_categories(id) ON DELETE CASCADE,
    question_en TEXT NOT NULL,
    question_zh TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    answer_zh TEXT NOT NULL,
    tags VARCHAR(255)[],
    view_count INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Documentation
CREATE TABLE IF NOT EXISTS docs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title_en VARCHAR(255) NOT NULL,
    title_zh VARCHAR(255) NOT NULL,
    description_en TEXT,
    description_zh TEXT,
    content_en TEXT NOT NULL,
    content_zh TEXT NOT NULL,
    category VARCHAR(100),
    tags VARCHAR(255)[],
    view_count INT DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    author VARCHAR(255),
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'normal',
    admin_response TEXT,
    responded_by VARCHAR(255),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Feedback
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255),
    page_url VARCHAR(500),
    feedback_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT false,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read faq_categories" ON faq_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read faqs" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read docs" ON docs FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read contact_messages" ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Public can read feedback" ON feedback FOR SELECT USING (true);

-- Insert write policies
CREATE POLICY "Users can insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert feedback" ON feedback FOR INSERT WITH CHECK (true);

-- Insert sample FAQ categories
INSERT INTO faq_categories (name_en, name_zh, description_en, description_zh, icon, sort_order) VALUES
('Getting Started', '快速入门', 'Learn the basics of MDLooker', '了解 MDLooker 的基础知识', 'rocket', 1),
('Account & Billing', '账户与计费', 'Manage your account and subscription', '管理您的账户和订阅', 'credit-card', 2),
('Data & Sources', '数据与来源', 'Understanding our data sources', '了解我们的数据来源', 'database', 3),
('Features & Tools', '功能与工具', 'Learn about our features', '了解我们的功能', 'tool', 4),
('Troubleshooting', '问题排查', 'Common issues and solutions', '常见问题与解决方案', 'help-circle', 5),
('Compliance & Regulations', '合规与法规', 'Regulatory information and compliance', '法规信息和合规性', 'shield', 6)
ON CONFLICT DO NOTHING;

-- Insert sample FAQs
INSERT INTO faq_categories (id, name_en, name_zh, icon, sort_order) VALUES
('11111111-1111-1111-1111-111111111111', 'General', '常见问题', 'help-circle', 0)
ON CONFLICT DO NOTHING;

INSERT INTO faqs (category_id, question_en, question_zh, answer_en, answer_zh, tags, is_featured, sort_order) VALUES
-- Getting Started
((SELECT id FROM faq_categories WHERE name_en = 'Getting Started' LIMIT 1),
 'What is MDLooker?',
 '什么是 MDLooker？',
 'MDLooker is a global medical device regulatory intelligence platform. We provide comprehensive regulatory data, market access information, and compliance tools for medical device companies seeking to enter international markets.',
 'MDLooker 是一个全球医疗器械法规智能平台。我们为寻求进入国际市场的医疗器械公司提供全面的法规数据、市场准入信息和合规工具。',
 ARRAY['introduction', 'overview'], true, 1),

((SELECT id FROM faq_categories WHERE name_en = 'Getting Started' LIMIT 1),
 'How do I search for regulatory information?',
 '如何搜索法规信息？',
 'Use the search bar at the top of the page to search for companies, products, or regulatory agencies. You can also browse by country or product category using the navigation menu.',
 '使用页面顶部的搜索栏搜索公司、产品或监管机构。您也可以使用导航菜单按国家或产品类别浏览。',
 ARRAY['search', 'browse'], true, 2),

((SELECT id FROM faq_categories WHERE name_en = 'Getting Started' LIMIT 1),
 'What data sources do you use?',
 '你们使用哪些数据来源？',
 'We aggregate data from official regulatory agencies including FDA (USA), NMPA (China), CE/EUDAMED (EU), PMDA (Japan), TGA (Australia), HSA (Singapore), and more. Our data is regularly updated from official sources.',
 '我们汇总来自官方监管机构的数据，包括 FDA（美国）、NMPA（中国）、CE/EUDAMED（欧盟）、PMDA（日本）、TGA（澳大利亚）、HSA（新加坡）等。我们的数据定期从官方来源更新。',
 ARRAY['data', 'sources', 'FDA', 'NMPA'], true, 3),

-- Account & Billing
((SELECT id FROM faq_categories WHERE name_en = 'Account & Billing' LIMIT 1),
 'How do I create an account?',
 '如何创建账户？',
 'Click the "Sign Up" button in the top right corner and follow the registration process. You can sign up using your email or via Google/Apple social login.',
 '点击右上角的"注册"按钮，按照注册流程操作。您可以使用邮箱注册或通过 Google/Apple 社交账号登录。',
 ARRAY['account', 'signup', 'registration'], true, 4),

((SELECT id FROM faq_categories WHERE name_en = 'Account & Billing' LIMIT 1),
 'What subscription plans do you offer?',
 '你们提供哪些订阅计划？',
 'We offer Free, Professional, and Enterprise plans. The Free plan provides basic access. Professional includes advanced search and export features. Enterprise offers custom solutions and API access.',
 '我们提供免费版、专业版和企业版。免费版提供基本访问权限。专业版包括高级搜索和导出功能。企业版提供定制解决方案和 API 访问。',
 ARRAY['subscription', 'pricing', 'plans'], true, 5),

-- Data & Sources
((SELECT id FROM faq_categories WHERE name_en = 'Data & Sources' LIMIT 1),
 'How often is the data updated?',
 '数据多久更新一次？',
 'Our data is updated daily from official regulatory databases. Major updates from agencies like FDA and NMPA are reflected within 24-48 hours.',
 '我们的数据每日从官方监管数据库更新。来自 FDA 和 NMPA 等机构的主要更新会在 24-48 小时内反映。',
 ARRAY['update', 'refresh', 'daily'], true, 6),

((SELECT id FROM faq_categories WHERE name_en = 'Data & Sources' LIMIT 1),
 'Can I export the data?',
 '我可以导出数据吗？',
 'Yes, Professional and Enterprise users can export data in CSV or JSON format. Use the export button on any search results page or comparison tool.',
 '是的，专业版和企业版用户可以导出 CSV 或 JSON 格式的数据。请使用任意搜索结果页面或对比工具上的导出按钮。',
 ARRAY['export', 'download', 'CSV', 'JSON'], true, 7),

-- Features & Tools
((SELECT id FROM faq_categories WHERE name_en = 'Features & Tools' LIMIT 1),
 'What is the Market Access Wizard?',
 '什么是市场准入向导？',
 'The Market Access Wizard helps you understand regulatory requirements for bringing your medical device to market in different countries. It provides step-by-step guidance based on your product type and target markets.',
 '市场准入向导帮助您了解在不同国家/地区将医疗器械推向市场所需的法规要求。它根据您的产品类型和目标市场提供逐步指导。',
 ARRAY['wizard', 'market access', 'guide'], true, 8),

((SELECT id FROM faq_categories WHERE name_en = 'Features & Tools' LIMIT 1),
 'How does the Compare Markets tool work?',
 '市场对比工具是如何工作的？',
 'Select up to 4 countries to compare their regulatory requirements, timelines, costs, and other key metrics side by side. This helps you make informed market entry decisions.',
 '选择最多 4 个国家/地区，并排比较它们的法规要求、时间线、成本和其他关键指标。这帮助您做出明智的市场进入决策。',
 ARRAY['compare', 'comparison', 'markets'], true, 9),

-- Troubleshooting
((SELECT id FROM faq_categories WHERE name_en = 'Troubleshooting' LIMIT 1),
 'Why am I not seeing search results?',
 '为什么我没有看到搜索结果？',
 'Try checking your search term spelling or using more general keywords. You can also try the fuzzy search option or browse by category. If the issue persists, please contact support.',
 '请检查您的拼写或使用更通用的关键词。您也可以尝试模糊搜索选项或按类别浏览。如果问题仍然存在，请联系支持。',
 ARRAY['search', 'results', 'troubleshooting'], false, 10),

((SELECT id FROM faq_categories WHERE name_en = 'Troubleshooting' LIMIT 1),
 'How do I report a data error?',
 '如何报告数据错误？',
 'Use the "Report Error" button on any data page or contact our support team. We appreciate your help in maintaining data accuracy.',
 '使用任意数据页面上的"报告错误"按钮或联系我们的支持团队。感谢您帮助我们保持数据准确性。',
 ARRAY['error', 'report', 'feedback'], false, 11),

-- Compliance
((SELECT id FROM faq_categories WHERE name_en = 'Compliance & Regulations' LIMIT 1),
 'Is the regulatory information legally binding?',
 '法规信息是否具有法律约束力？',
 'Our platform provides regulatory intelligence for informational purposes only. Always consult with local regulatory authorities or legal experts for official guidance on compliance requirements.',
 '我们的平台仅提供信息目的的法规智能服务。关于合规要求的官方指导，请始终咨询当地监管机构或法律专家。',
 ARRAY['legal', 'compliance', 'disclaimer'], true, 12),

((SELECT id FROM faq_categories WHERE name_en = 'Compliance & Regulations' LIMIT 1),
 'Do you provide consulting services?',
 '你们提供咨询服务吗？',
 'Yes, Enterprise customers have access to regulatory consulting services. Contact our sales team for more information on customized consulting solutions.',
 '是的，企业客户可以使用法规咨询服务。联系我们的销售团队了解定制咨询解决方案的更多信息。',
 ARRAY['consulting', 'enterprise', 'services'], false, 13)
ON CONFLICT DO NOTHING;

-- Insert sample docs
INSERT INTO docs (slug, title_en, title_zh, description_en, description_zh, content_en, content_zh, category, tags, is_published, is_featured) VALUES
('quick-start', 
 'Quick Start Guide', 
 '快速入门指南',
 'Get started with MDLooker in minutes',
 '几分钟内开始使用 MDLooker',
 '# Welcome to MDLooker

## Getting Started

1. Create an account
2. Explore the dashboard
3. Search for regulatory information

## Key Features

- **Search**: Find companies, products, and regulations
- **Compare**: Compare market requirements
- **Templates**: Download regulatory templates
- **Alerts**: Stay updated with regulatory changes

## Need Help?

Contact our support team or browse the FAQ section.',
 '# 欢迎使用 MDLooker

## 入门指南

1. 创建账户
2. 探索仪表板
3. 搜索法规信息

## 主要功能

- **搜索**: 查找公司、产品和法规
- **对比**: 比较市场要求
- **模板**: 下载法规模板
- **提醒**: 及时了解法规变化

## 需要帮助？

联系我们的支持团队或浏览常见问题部分。',
'getting-started',
ARRAY['guide', 'tutorial', 'beginner'],
true, true),

('api-documentation',
 'API Documentation',
 'API 文档',
 'Technical documentation for developers',
 '开发者的技术文档',
 '# MDLooker API

## Overview

Our API allows programmatic access to our regulatory database.

## Authentication

All API requests require an API key in the header:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Search Companies
GET /api/search?q=companyname

### Get Company Details
GET /api/companies/:id

### Market Data
GET /api/market-access?country=US&product=medical-device',
 '# MDLooker API

## 概述

我们的 API 允许编程访问我们的法规数据库。

## 认证

所有 API 请求都需要在请求头中包含 API 密钥：

```
Authorization: Bearer YOUR_API_KEY
```

## 端点

### 搜索公司
GET /api/search?q=公司名称

### 获取公司详情
GET /api/companies/:id

### 市场数据
GET /api/market-access?country=US&product=medical-device',
'developer',
ARRAY['api', 'technical', 'developer'],
true, true)
ON CONFLICT DO NOTHING;

-- Insert sample contact messages template
INSERT INTO contact_messages (user_email, user_name, subject, message, category, status) VALUES
('demo@example.com', 'Demo User', 'Demo Inquiry', 'This is a demo message for testing purposes.', 'general', 'pending')
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category_id);
CREATE INDEX IF NOT EXISTS idx_faqs_featured ON faqs(is_featured);
CREATE INDEX IF NOT EXISTS idx_docs_slug ON docs(slug);
CREATE INDEX IF NOT EXISTS idx_docs_published ON docs(is_published);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(feedback_type);
