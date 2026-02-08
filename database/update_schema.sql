-- 更新 companies 表结构，添加缺失的字段

-- 添加新字段
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS founded_year INTEGER,
ADD COLUMN IF NOT EXISTS specialties JSONB,
ADD COLUMN IF NOT EXISTS certifications JSONB,
ADD COLUMN IF NOT EXISTS fda_registration_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_fda_sync TIMESTAMP WITH TIME ZONE;

-- 如果 established_year 有数据，同步到 founded_year
UPDATE companies 
SET founded_year = established_year 
WHERE founded_year IS NULL AND established_year IS NOT NULL;

-- 验证更新
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'companies' 
ORDER BY 
    ordinal_position;
