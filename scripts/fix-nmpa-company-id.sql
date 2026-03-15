-- MDLooker NMPA 数据修复 SQL 脚本
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 步骤 1: 创建临时表存储唯一制造商
DROP TABLE IF EXISTS temp_nmpa_manufacturers;

CREATE TEMP TABLE temp_nmpa_manufacturers AS
SELECT DISTINCT 
  manufacturer_zh,
  manufacturer
FROM nmpa_registrations
WHERE company_id IS NULL
  AND manufacturer_zh IS NOT NULL;

-- 步骤 2: 为每个制造商创建公司（如果不存在）
-- 使用 INSERT ... ON CONFLICT DO NOTHING
INSERT INTO companies (name, name_zh, country, business_type, description, description_zh)
SELECT 
  COALESCE(m.manufacturer, m.manufacturer_zh) AS name,
  COALESCE(m.manufacturer_zh, m.manufacturer) AS name_zh,
  'China' AS country,
  'Manufacturer' AS business_type,
  CONCAT('NMPA 注册企业 - ', m.manufacturer_zh) AS description,
  CONCAT('NMPA 注册企业 - ', m.manufacturer_zh) AS description_zh
FROM temp_nmpa_manufacturers m
WHERE NOT EXISTS (
  SELECT 1 FROM companies c 
  WHERE c.name_zh = m.manufacturer_zh 
     OR c.name = m.manufacturer
);

-- 步骤 3: 创建临时表存储公司映射
DROP TABLE IF EXISTS temp_company_mapping;

CREATE TEMP TABLE temp_company_mapping AS
SELECT 
  m.manufacturer_zh,
  m.manufacturer,
  c.id AS company_id
FROM temp_nmpa_manufacturers m
JOIN companies c ON (c.name_zh = m.manufacturer_zh OR c.name = m.manufacturer);

-- 步骤 4: 更新 NMPA 记录的 company_id
UPDATE nmpa_registrations n
SET company_id = cm.company_id
FROM temp_company_mapping cm
WHERE n.company_id IS NULL
  AND n.manufacturer_zh = cm.manufacturer_zh;

-- 步骤 5: 验证结果
SELECT 
  '修复前 NULL 数量' AS metric,
  (SELECT COUNT(*) FROM nmpa_registrations WHERE company_id IS NULL) AS value
UNION ALL
SELECT 
  '修复后 NULL 数量' AS metric,
  (SELECT COUNT(*) FROM nmpa_registrations WHERE company_id IS NULL) AS value
UNION ALL
SELECT 
  '总记录数' AS metric,
  (SELECT COUNT(*) FROM nmpa_registrations) AS value
UNION ALL
SELECT 
  '新创建的公司数' AS metric,
  (SELECT COUNT(*) FROM companies 
   WHERE country = 'China' 
   AND business_type = 'Manufacturer'
   AND description LIKE 'NMPA 注册企业%') AS value;

-- 步骤 6: 显示修复统计
SELECT 
  (SELECT COUNT(*) FROM nmpa_registrations) AS total_records,
  (SELECT COUNT(*) FROM nmpa_registrations WHERE company_id IS NOT NULL) AS fixed_records,
  ROUND(
    (SELECT COUNT(*) FROM nmpa_registrations WHERE company_id IS NOT NULL)::numeric /
    NULLIF((SELECT COUNT(*) FROM nmpa_registrations), 0) * 100,
    2
  ) AS fix_percentage;

-- 清理临时表
DROP TABLE IF EXISTS temp_nmpa_manufacturers;
DROP TABLE IF EXISTS temp_company_mapping;
