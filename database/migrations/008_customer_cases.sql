-- Customer Cases & Statistics Database Schema
-- MDLooker Platform Phase 3

-- Customer Cases
CREATE TABLE IF NOT EXISTS customer_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    company_name_zh VARCHAR(255),
    logo_url TEXT,
    description_en TEXT NOT NULL,
    description_zh TEXT NOT NULL,
    challenge_en TEXT,
    challenge_zh TEXT,
    solution_en TEXT,
    solution_zh TEXT,
    results JSONB,
    target_countries VARCHAR(255)[],
    target_products VARCHAR(255)[],
    timeline VARCHAR(100),
    testimonial_en TEXT,
    testimonial_zh TEXT,
    testimonial_author VARCHAR(255),
    testimonial_title VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform Statistics
CREATE TABLE IF NOT EXISTS platform_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_key VARCHAR(100) NOT NULL UNIQUE,
    stat_value BIGINT DEFAULT 0,
    stat_label_en VARCHAR(255),
    stat_label_zh VARCHAR(255),
    stat_icon VARCHAR(100),
    stat_type VARCHAR(50) DEFAULT 'counter',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Reviews/Testimonials
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name VARCHAR(255) NOT NULL,
    user_company VARCHAR(255),
    user_avatar TEXT,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review_en TEXT NOT NULL,
    review_zh TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    helpful_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Suggestions/Feedback
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'normal',
    admin_response TEXT,
    responded_by VARCHAR(255),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature Requests
CREATE TABLE IF NOT EXISTS feature_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_feature VARCHAR(255),
    upvote_count INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'under_review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE customer_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read customer_cases" ON customer_cases FOR SELECT USING (is_published = true);
CREATE POLICY "Public can read platform_stats" ON platform_stats FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read reviews" ON reviews FOR SELECT USING (is_published = true);

-- Insert policies
CREATE POLICY "Users can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert suggestions" ON suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert feature_requests" ON feature_requests FOR INSERT WITH CHECK (true);

-- Insert sample customer cases
INSERT INTO customer_cases (company_name, company_name_zh, description_en, description_zh, challenge_en, challenge_zh, solution_en, solution_zh, results, target_countries, target_products, timeline, testimonial_en, testimonial_zh, testimonial_author, testimonial_title, is_featured, is_published, sort_order) VALUES
('MedTech Solutions', '医械解决方案公司', 
 'A leading medical device manufacturer seeking to expand into Asian markets',
 '一家领先的医疗器械制造商寻求拓展亚洲市场',
 'The company faced complex regulatory requirements across multiple Asian countries, with different classification systems and documentation requirements.',
 '该公司面临多个亚洲国家复杂的法规要求，不同的分类系统和文档要求。',
 'Used MDLooker to compare regulatory requirements, identify Singapore as the optimal first market, and streamline documentation process.',
 '使用 MDLooker 比较法规要求，确定新加坡作为首个最佳市场，并简化文档流程。',
 '{"registration_time": "45 days", "cost_savings": "30%", "documents_reduced": "15"}',
 ARRAY['Singapore', 'Malaysia', 'Thailand'],
 ARRAY['Surgical Masks', 'N95 Respirators'],
 '3 months',
 'MDLooker saved us significant time in researching market准入 requirements. The comparison tool helped us make informed decisions.',
 'MDLooker 大大节省了我们研究市场准入要求的时间。对比工具帮助我们做出了明智的决定。',
 'Sarah Chen',
 'Regulatory Affairs Manager',
 true, true, 1),

('HealthCare Asia', '亚洲医疗健康',
 'A Singapore-based healthcare distributor expanding their product portfolio',
 '一家新加坡医疗保健经销商扩展产品组合',
 'Needed to quickly identify compliant medical device suppliers across different regulatory frameworks.',
 '需要快速识别不同监管框架下的合规医疗器械供应商。',
 'Leveraged MDLooker database to verify supplier certifications and compare product classifications across FDA, CE, and Asian regulatory bodies.',
 '利用 MDLooker 数据库验证供应商认证，比较 FDA、CE 和亚洲监管机构的产品分类。',
 '{"suppliers_found": "50+", "verification_time": "2 weeks", "compliance_rate": "95%"}',
 ARRAY['Singapore', 'Vietnam', 'Philippines'],
 ARRAY['Patient Monitors', 'Infusion Pumps'],
 '2 months',
 'The platform helped us verify supplier credentials efficiently. Highly recommended for anyone doing business in Asian healthcare markets.',
 '该平台帮助我们高效验证供应商资质。强烈推荐给在亚洲医疗市场开展业务的人。',
 'Michael Wong',
 'Procurement Director',
 true, true, 2),

('BioInnovation Labs', '生物创新实验室',
 'A biotech startup developing innovative diagnostic devices',
 '一家开发创新诊断设备的生物技术初创公司',
 'Limited experience with regulatory submissions and unclear pathway for novel device classification.',
 '监管提交经验有限，不清楚新型设备分类的路径。',
 'Consulted MDLooker guides and used the Market Access Wizard to understand classification requirements for their innovative diagnostic device.',
 '咨询 MDLooker 指南，使用市场准入向导了解其创新诊断设备的分类要求。',
 '{"classification_clarified": true, "submission_prepared": true, "time_to_submission": "4 months"}',
 ARRAY['Singapore', 'USA', 'EU'],
 ARRAY['In Vitro Diagnostic'],
 '6 months',
 'MDLooker provided clarity when we were confused about regulatory pathways. The expert consultation feature was particularly valuable.',
 '当我们对监管路径感到困惑时，MDLooker 提供了清晰的指导。专家咨询功能特别有价值。',
 'Dr. Emily Tan',
 'CEO & Founder',
 true, true, 3)
ON CONFLICT DO NOTHING;

-- Insert platform statistics
INSERT INTO platform_stats (stat_key, stat_value, stat_label_en, stat_label_zh, stat_icon, stat_type, display_order) VALUES
('registered_companies', 2500, 'Registered Companies', '注册企业', 'building', 'counter', 1),
('products_tracked', 15000, 'Products Tracked', '产品数据', 'package', 'counter', 2),
('registrations_completed', 8500, 'Registrations Completed', '完成注册', 'check-circle', 'counter', 3),
('countries_covered', 25, 'Countries Covered', '覆盖国家', 'globe', 'counter', 4),
('regulatory_updates', 1200, 'Regulatory Updates', '法规更新', 'file-text', 'counter', 5),
('active_users', 5000, 'Active Users', '活跃用户', 'users', 'counter', 6),
('success_rate', 95, 'Success Rate', '成功率', 'trending-up', 'percentage', 7),
('avg_review_time', 45, 'Avg. Review Days', '平均审核天数', 'clock', 'days', 8)
ON CONFLICT DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (user_name, user_company, rating, review_en, review_zh, is_featured, is_verified, is_published) VALUES
('David Lee', 'MedDevice Inc.', 5, 
 'Excellent platform for medical device regulatory research. The data is comprehensive and always up-to-date.',
 '医疗器械法规研究的出色平台。数据全面且始终最新。',
 true, true, true),
('Jennifer Wu', 'Pharma Asia Ltd', 5,
 'The market comparison feature saved us weeks of research time. Highly recommended for any company expanding in Asia.',
 '市场对比功能节省了我们数周的研究时间。强烈推荐给任何在亚洲拓展的公司。',
 true, true, true),
('Robert Chen', 'TechMed Solutions', 4,
 'Great tool for understanding different regulatory requirements. Would love to see more detailed cost analysis features.',
 '了解不同监管要求的好工具。希望能看到更详细的成本分析功能。',
 true, true, true),
('Amanda Tan', 'BioHealth Corp', 5,
 'The support team is very responsive and helpful. They helped us navigate complex FDA submission requirements.',
 '支持团队非常响应迅速且乐于助人。他们帮助我们应对复杂的 FDA 提交要求。',
 false, true, true),
('James Wong', 'Diagnostic Tech', 4,
 'Good database with comprehensive coverage. The search functionality could be improved with more filters.',
 '数据库覆盖全面。搜索功能可以添加更多筛选器来改进。',
 false, false, true)
ON CONFLICT DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_cases_featured ON customer_cases(is_featured) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_reviews_featured ON reviews(is_featured) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
