-- 压缩raw_data，只保留关键字段
UPDATE nmpa_registrations 
SET raw_data = jsonb_build_object(
    'registration_number', registration_number,
    'product_name', product_name,
    'manufacturer', manufacturer,
    'device_classification', device_classification,
    'approval_date', approval_date,
    'source', 'NMPA'
)
WHERE raw_data IS NOT NULL;