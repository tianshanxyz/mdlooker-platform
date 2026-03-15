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

-- 步骤 2: 为每个制造商创建或查找公司
-- 创建临时表存储公司映射
DROP TABLE IF EXISTS temp_company_mapping;

CREATE TEMP TABLE temp_company_mapping AS
SELECT 
  m.manufacturer_zh,
  m.manufacturer,
  COALESCE(
    -- 尝试查找现有公司
    (SELECT id FROM companies 
     WHERE name_zh = m.manufacturer_zh 
        OR name = m.manufacturer 
     LIMIT 1),
    -- 如果不存在，创建新公司
    (INSERT INTO companies (name, name_zh, country, business_type, description, description_zh)
     VALUES (
       COALESCE(m.manufacturer, m.manufacturer_zh),
       COALESCE(m.manufacturer_zh, m.manufacturer),
       'China',
       'Manufacturer',
       CONCAT('NMPA 注册企业 - ', m.manufacturer_zh),
       CONCAT('NMPA 注册企业 - ', m.manufacturer_zh)
     )
     RETURNING id)
  ) AS company_id
FROM temp_nmpa_manufacturers m;

-- 步骤 3: 更新 NMPA 记录的 company_id
UPDATE nmpa_registrations n
SET company_id = cm.company_id
FROM temp_company_mapping cm
WHERE n.company_id IS NULL
  AND n.manufacturer_zh = cm.manufacturer_zh;

-- 步骤 4: 验证结果
SELECT 
  '修复前 NULL 数量' AS metric,
  COUNT(*) AS value
FROM nmpa_registrations
WHERE company_id IS NULL

UNION ALL

SELECT 
  '修复后 NULL 数量' AS metric,
  COUNT(*) AS value
FROM nmpa_registrations
WHERE company_id IS NULL

UNION ALL

SELECT 
  '总记录数' AS metric,
  COUNT(*) AS value
FROM nmpa_registrations

UNION ALL

SELECT 
  '创建的公司数' AS metric,
  COUNT(*) AS value
FROM companies c
WHERE c.country = 'China'
  AND c.business_type = 'Manufacturer'
  AND c.description LIKE 'NMPA 注册企业%';

-- 显示修复统计
SELECT 
  '修复统计' AS report,
  (SELECT COUNT(*) FROM nmpa_registrations) AS total_records,
  (SELECT COUNT(*) FROM nmpa_registrations WHERE company_id IS NOT NULL) AS fixed_records,
  ROUND(
    (SELECT COUNT(*) FROM nmpa_registrations WHERE company_id IS NOT NULL)::numeric /
    NULLIF((SELECT COUNT(*) FROM nmpa_registrations), 0) * 100,
    2
  ) AS fix_percentage;
