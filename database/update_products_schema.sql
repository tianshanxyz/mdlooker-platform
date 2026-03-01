-- 更新 products 表结构，添加缺失的字段

-- 添加新字段
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS fda_product_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS specifications JSONB,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- 验证更新
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'products' 
ORDER BY 
    ordinal_position;
