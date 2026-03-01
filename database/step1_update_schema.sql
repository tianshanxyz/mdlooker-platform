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
ADD COLUMN IF NOT EXISTS certifications JSONB,
ADD COLUMN IF NOT EXISTS specifications JSONB,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- 步骤3: 同步 established_year 到 founded_year
UPDATE companies 
SET founded_year = established_year 
WHERE founded_year IS NULL AND established_year IS NOT NULL;

-- 验证表结构
SELECT 
    table_name,
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name IN ('companies', 'products')
ORDER BY 
    table_name, ordinal_position;
