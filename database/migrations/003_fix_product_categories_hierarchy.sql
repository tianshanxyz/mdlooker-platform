-- 修复产品分类的层级关系
-- 在 Supabase Dashboard → SQL Editor 中执行

-- 获取 Medical Device 的 ID
DO $$
DECLARE
  medical_device_id UUID;
  ppe_id UUID;
BEGIN
  -- 设置父类别
  SELECT id INTO medical_device_id FROM product_categories WHERE code = 'MD' LIMIT 1;
  SELECT id INTO ppe_id FROM product_categories WHERE code = 'PPE' LIMIT 1;
  
  -- 更新子类别的 parent_id
  UPDATE product_categories 
  SET parent_id = medical_device_id 
  WHERE code IN ('MASK-SURG', 'DIAG', 'IMPL');
  
  UPDATE product_categories 
  SET parent_id = ppe_id 
  WHERE code IN ('MASK-N95', 'PPE-CLOTH');
  
  -- 更新 market_access_guides 中的 product_category_id
  -- 将新加坡指南关联到 Surgical Mask
  UPDATE market_access_guides 
  SET product_category_id = (SELECT id FROM product_categories WHERE code = 'MASK-SURG' LIMIT 1)
  WHERE country = 'SG';
  
  -- 将马来西亚指南关联到 Surgical Mask
  UPDATE market_access_guides 
  SET product_category_id = (SELECT id FROM product_categories WHERE code = 'MASK-SURG' LIMIT 1)
  WHERE country = 'MY';
  
  -- 将泰国指南关联到 Surgical Mask
  UPDATE market_access_guides 
  SET product_category_id = (SELECT id FROM product_categories WHERE code = 'MASK-SURG' LIMIT 1)
  WHERE country = 'TH';
  
END $$;

-- 验证修复结果
SELECT 
  pc.name,
  pc.name_zh,
  pc.code,
  pc.level,
  parent.name as parent_name,
  parent.name_zh as parent_name_zh
FROM product_categories pc
LEFT JOIN product_categories parent ON pc.parent_id = parent.id
ORDER BY pc.level, pc.name;
