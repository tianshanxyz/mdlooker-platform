-- 添加 FDA FEI 号码字段到 companies 表
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS fda_fei_number VARCHAR(100);

-- 验证字段已添加
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'companies' AND column_name = 'fda_fei_number';
