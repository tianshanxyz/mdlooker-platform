/**
 * Supabase 数据导入脚本
 * 
 * 使用方法:
 * 1. 确保已安装依赖: npm install @supabase/supabase-js
 * 2. 设置环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 3. 运行: npx ts-node scripts/import-seed-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('错误: 请设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY 环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 基础数据（原始12家公司）
const baseCompanies = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Medtronic plc',
    name_zh: '美敦力',
    country: 'Ireland',
    address: '20 On Hatch, Lower Hatch Street, Dublin 2, Ireland',
    website: 'https://www.medtronic.com',
    business_type: 'Manufacturer',
    description: 'Global leader in medical technology, services, and solutions.',
    description_zh: '全球医疗技术、服务和解决方案的领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Johnson & Johnson',
    name_zh: '强生',
    country: 'USA',
    address: 'One Johnson & Johnson Plaza, New Brunswick, NJ 08933',
    website: 'https://www.jnj.com',
    business_type: 'Manufacturer',
    description: 'World\'s largest and most broadly based healthcare company.',
    description_zh: '全球最大、业务最广泛的医疗健康企业'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Siemens Healthineers',
    name_zh: '西门子医疗',
    country: 'Germany',
    address: 'Henkestraße 127, 91052 Erlangen, Germany',
    website: 'https://www.siemens-healthineers.com',
    business_type: 'Manufacturer',
    description: 'MedTech company with core business in imaging and diagnostics.',
    description_zh: '医疗技术公司，核心业务为影像和诊断'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Mindray Medical',
    name_zh: '迈瑞医疗',
    country: 'China',
    address: 'Mindray Building, Keji 12th Road South, High-tech Industrial Park, Nanshan, Shenzhen 518057',
    website: 'https://www.mindray.com',
    business_type: 'Manufacturer',
    description: 'Leading developer of medical devices and solutions.',
    description_zh: '领先的医疗设备和解决方案开发商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Roche Diagnostics',
    name_zh: '罗氏诊断',
    country: 'Switzerland',
    address: 'Roche Diagnostics International Ltd, Rötkreuz, Switzerland',
    website: 'https://diagnostics.roche.com',
    business_type: 'Manufacturer',
    description: 'World leader in in vitro diagnostics and tissue-based cancer diagnostics.',
    description_zh: '体外诊断和组织癌症诊断领域的世界领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Terumo Corporation',
    name_zh: '泰尔茂',
    country: 'Japan',
    address: '2-44-1 Hatagaya, Shibuya-ku, Tokyo 151-0072, Japan',
    website: 'https://www.terumo.com',
    business_type: 'Manufacturer',
    description: 'Leading Japanese medical device manufacturer specializing in cardiac and vascular devices.',
    description_zh: '日本领先的医疗器械制造商，专注于心血管器械'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Olympus Corporation',
    name_zh: '奥林巴斯',
    country: 'Japan',
    address: '2951 Ishikawa-machi, Hachioji-shi, Tokyo 192-8507, Japan',
    website: 'https://www.olympus-global.com',
    business_type: 'Manufacturer',
    description: 'Japanese multinational corporation specializing in optics and medical devices.',
    description_zh: '日本跨国企业，专注于光学和医疗器械'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Stryker Corporation',
    name_zh: '史赛克',
    country: 'USA',
    address: '2825 Airview Boulevard, Kalamazoo, MI 49002, USA',
    website: 'https://www.stryker.com',
    business_type: 'Manufacturer',
    description: 'Fortune 500 medical technologies company specializing in orthopedic and medical devices.',
    description_zh: '财富500强医疗技术公司，专注于骨科和医疗器械'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Abbott Laboratories',
    name_zh: '雅培',
    country: 'USA',
    address: '100 Abbott Park Road, Abbott Park, IL 60064, USA',
    website: 'https://www.abbott.com',
    business_type: 'Manufacturer',
    description: 'American multinational medical devices and health care company.',
    description_zh: '美国跨国医疗器械和医疗保健公司'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Boston Scientific',
    name_zh: '波士顿科学',
    country: 'USA',
    address: '300 Boston Scientific Way, Marlborough, MA 01752, USA',
    website: 'https://www.bostonscientific.com',
    business_type: 'Manufacturer',
    description: 'Developer and manufacturer of medical devices used in interventional medical specialties.',
    description_zh: '介入医学专业医疗器械开发商和制造商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Fisher & Paykel Healthcare',
    name_zh: '费雪派克医疗保健',
    country: 'New Zealand',
    address: '15 Maurice Paykel Place, East Tamaki, Auckland 2013, New Zealand',
    website: 'https://www.fphcare.com',
    business_type: 'Manufacturer',
    description: 'New Zealand-based medical device company specializing in respiratory and acute care.',
    description_zh: '新西兰医疗器械公司，专注于呼吸和重症监护'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Getinge AB',
    name_zh: '洁定',
    country: 'Sweden',
    address: 'Lindholmspiren 7A, SE-417 56 Gothenburg, Sweden',
    website: 'https://www.getinge.com',
    business_type: 'Manufacturer',
    description: 'Swedish medical technology company specializing in infection control and surgical systems.',
    description_zh: '瑞典医疗技术公司，专注于感染控制和外科系统'
  }
];

// 扩展公司数据（50家）
const extendedCompanies = [
  { id: '550e8400-e29b-41d4-a716-446655440012', name: '3M Healthcare', name_zh: '3M医疗', country: 'USA', address: '3M Center, St. Paul, MN 55144', website: 'https://www.3m.com/healthcare', business_type: 'Manufacturer', description: 'Diversified technology company with healthcare products including medical tapes, masks, and sterilization products.', description_zh: '多元化科技公司，医疗产品包括医用胶带、口罩和消毒产品' },
  { id: '550e8400-e29b-41d4-a716-446655440013', name: 'Becton Dickinson', name_zh: '碧迪医疗', country: 'USA', address: '1 Becton Drive, Franklin Lakes, NJ 07417', website: 'https://www.bd.com', business_type: 'Manufacturer', description: 'Global medical technology company specializing in medical devices and laboratory equipment.', description_zh: '全球医疗技术公司，专注于医疗设备和实验室设备' },
  { id: '550e8400-e29b-41d4-a716-446655440014', name: 'Cardinal Health', name_zh: '嘉德诺健康', country: 'USA', address: '7000 Cardinal Place, Dublin, OH 43017', website: 'https://www.cardinalhealth.com', business_type: 'Distributor', description: 'Global healthcare services and products company, major distributor of medical supplies.', description_zh: '全球医疗保健服务和产品公司，医疗用品主要分销商' },
  { id: '550e8400-e29b-41d4-a716-446655440015', name: 'GE Healthcare', name_zh: 'GE医疗', country: 'USA', address: '500 W. Monroe St., Chicago, IL 60661', website: 'https://www.gehealthcare.com', business_type: 'Manufacturer', description: 'Leading provider of medical imaging, monitoring, and diagnostics technology.', description_zh: '领先的医学影像、监测和诊断技术提供商' },
  { id: '550e8400-e29b-41d4-a716-446655440016', name: 'Philips Healthcare', name_zh: '飞利浦医疗', country: 'Netherlands', address: 'Amstelplein 2, 1096 BC Amsterdam', website: 'https://www.philips.com/healthcare', business_type: 'Manufacturer', description: 'Health technology company focused on improving people\'s health and well-being.', description_zh: '专注于改善人们健康和福祉的健康科技公司' },
  { id: '550e8400-e29b-41d4-a716-446655440017', name: 'Baxter International', name_zh: '百特国际', country: 'USA', address: '1 Baxter Parkway, Deerfield, IL 60015', website: 'https://www.baxter.com', business_type: 'Manufacturer', description: 'Global leader in medical products for hospitals and kidney care.', description_zh: '医院和肾脏护理医疗产品的全球领导者' },
  { id: '550e8400-e29b-41d4-a716-446655440018', name: 'Fresenius Medical Care', name_zh: '费森尤斯医疗', country: 'Germany', address: 'Else-Kröner-Straße 1, 61352 Bad Homburg', website: 'https://www.freseniusmedicalcare.com', business_type: 'Manufacturer', description: 'World\'s leading provider of dialysis products and services.', description_zh: '全球领先的透析产品和服务提供商' },
  { id: '550e8400-e29b-41d4-a716-446655440019', name: 'Zimmer Biomet', name_zh: '捷迈邦美', country: 'USA', address: '345 E. Main St., Warsaw, IN 46580', website: 'https://www.zimmerbiomet.com', business_type: 'Manufacturer', description: 'Global leader in musculoskeletal healthcare solutions.', description_zh: '肌肉骨骼医疗保健解决方案的全球领导者' },
  { id: '550e8400-e29b-41d4-a716-446655440020', name: 'Smith & Nephew', name_zh: '施乐辉', country: 'UK', address: 'Building 5, Croxley Park, Watford, WD18 8WW', website: 'https://www.smith-nephew.com', business_type: 'Manufacturer', description: 'Global medical technology company specializing in orthopaedics and wound management.', description_zh: '专注于骨科和伤口管理的全球医疗技术公司' },
  { id: '550e8400-e29b-41d4-a716-446655440021', name: 'Drägerwerk AG', name_zh: '德尔格', country: 'Germany', address: 'Moislinger Allee 53-55, 23558 Lübeck', website: 'https://www.draeger.com', business_type: 'Manufacturer', description: 'German medical and safety technology company.', description_zh: '德国医疗和安全技术公司' },
  { id: '550e8400-e29b-41d4-a716-446655440022', name: 'Edwards Lifesciences', name_zh: '爱德华生命科学', country: 'USA', address: 'One Edwards Way, Irvine, CA 92614', website: 'https://www.edwards.com', business_type: 'Manufacturer', description: 'Global leader in patient-focused medical innovations for structural heart disease.', description_zh: '结构性心脏病患者医疗创新的全球领导者' },
  { id: '550e8400-e29b-41d4-a716-446655440023', name: 'Intuitive Surgical', name_zh: '直觉外科', country: 'USA', address: '1020 Kifer Road, Sunnyvale, CA 94086', website: 'https://www.intuitive.com', business_type: 'Manufacturer', description: 'Pioneer and global leader in robotic-assisted minimally invasive surgery.', description_zh: '机器人辅助微创手术的先驱和全球领导者' },
  { id: '550e8400-e29b-41d4-a716-446655440024', name: 'B. Braun Melsungen', name_zh: '贝朗医疗', country: 'Germany', address: 'Carl-Braun-Straße 1, 34212 Melsungen', website: 'https://www.bbraun.com', business_type: 'Manufacturer', description: 'German medical and pharmaceutical device company.', description_zh: '德国医疗和制药设备公司' },
  { id: '550e8400-e29b-41d4-a716-446655440025', name: 'Fujifilm Healthcare', name_zh: '富士胶片医疗', country: 'Japan', address: '19-30 Nishiazabu 2-chome, Minato-ku, Tokyo', website: 'https://www.fujifilm.com/healthcare', business_type: 'Manufacturer', description: 'Medical imaging and diagnostic equipment manufacturer.', description_zh: '医学影像和诊断设备制造商' },
  { id: '550e8400-e29b-41d4-a716-446655440026', name: 'Canon Medical Systems', name_zh: '佳能医疗系统', country: 'Japan', address: '1385 Shimoishigami, Otawara, Tochigi 324-8550', website: 'https://global.medical.canon', business_type: 'Manufacturer', description: 'Diagnostic imaging systems including CT, MRI, and ultrasound.', description_zh: '诊断影像系统，包括CT、MRI和超声' },
  { id: '550e8400-e29b-41d4-a716-446655440027', name: 'Hitachi Healthcare', name_zh: '日立医疗', country: 'Japan', address: '2-1 Shintoyofuta, Kashiwa, Chiba 277-0804', website: 'https://www.hitachi.com/healthcare', business_type: 'Manufacturer', description: 'Medical imaging equipment and diagnostics systems.', description_zh: '医学影像设备和诊断系统' },
  { id: '550e8400-e29b-41d4-a716-446655440028', name: 'Shimadzu Corporation', name_zh: '岛津制作所', country: 'Japan', address: '1 Nishinokyo-Kuwabara-cho, Nakagyo-ku, Kyoto', website: 'https://www.shimadzu.com/medical', business_type: 'Manufacturer', description: 'Medical imaging and diagnostic equipment manufacturer.', description_zh: '医学影像和诊断设备制造商' },
  { id: '550e8400-e29b-41d4-a716-446655440029', name: 'Hologic', name_zh: '豪洛捷', country: 'USA', address: '250 Campus Drive, Marlborough, MA 01752', website: 'https://www.hologic.com', business_type: 'Manufacturer', description: 'Women\'s health and diagnostics company specializing in breast and skeletal health.', description_zh: '专注于乳腺和骨骼健康的女性健康诊断公司' },
  { id: '550e8400-e29b-41d4-a716-446655440030', name: 'ResMed', name_zh: '瑞思迈', country: 'Australia', address: '9001 Spectrum Center Blvd, San Diego, CA 92123', website: 'https://www.resmed.com', business_type: 'Manufacturer', description: 'Global leader in sleep apnea and respiratory care solutions.', description_zh: '睡眠呼吸暂停和呼吸护理解决方案的全球领导者' },
  { id: '550e8400-e29b-41d4-a716-446655440031', name: 'Varian Medical Systems', name_zh: '瓦里安医疗系统', country: 'USA', address: '3100 Hansen Way, Palo Alto, CA 94304', website: 'https://www.varian.com', business_type: 'Manufacturer', description: 'Cancer care technologies and solutions provider.', description_zh: '癌症护理技术和解决方案提供商' },
  { id: '550e8400-e29b-41d4-a716-446655440032', name: 'Masimo', name_zh: '麦斯莫', country: 'USA', address: '52 Discovery, Irvine, CA 92618', website: 'https://www.masimo.com', business_type: 'Manufacturer', description: 'Noninvasive patient monitoring technologies.', description_zh: '无创患者监测技术' },
  { id: '550e8400-e29b-41d4-a716-446655440033', name: 'Welch Allyn', name_zh: '伟伦', country: 'USA', address: '4341 State Street Road, Skaneateles Falls, NY 13153', website: 'https://www.welchallyn.com', business_type: 'Manufacturer', description: 'Medical diagnostic device manufacturer.', description_zh: '医疗诊断设备制造商' },
  { id: '550e8400-e29b-41d4-a716-446655440034', name: 'Hillrom', name_zh: '希尔罗姆', country: 'USA', address: '130 E. Randolph St., Suite 1000, Chicago, IL 60601', website: 'https://www.hillrom.com', business_type: 'Manufacturer', description: 'Medical technologies and connected care solutions.', description_zh: '医疗技术和互联护理解决方案' },
  { id: '550e8400-e29b-41d4-a716-446655440035', name: 'Invacare Corporation', name_zh: '英维康', country: 'USA', address: '3 Invacare Way, Elyria, OH 44035', website: 'https://www.invacare.com', business_type: 'Manufacturer', description: 'Home and long-term care medical products.', description_zh: '家庭和长期护理医疗产品' },
  { id: '550e8400-e29b-41d4-a716-446655440036', name: 'Ottobock', name_zh: '奥托博克', country: 'Germany', address: 'Max-Näder-Straße 15, 37115 Duderstadt', website: 'https://www.ottobock.com', business_type: 'Manufacturer', description: 'Prosthetics and orthotics manufacturer.', description_zh: '假肢和矫形器制造商' },
  { id: '550e8400-e29b-41d4-a716-446655440037', name: 'Sonova', name_zh: '索诺瓦', country: 'Switzerland', address: 'Laubisrütistrasse 28, 8712 Stäfa', website: 'https://www.sonova.com', business_type: 'Manufacturer', description: 'Hearing care solutions provider.', description_zh: '听力护理解决方案提供商' },
  { id: '550e8400-e29b-41d4-a716-446655440038', name: 'Demant', name_zh: '戴蒙特', country: 'Denmark', address: 'Kongebakken 9, 2765 Smørum', website: 'https://www.demant.com', business_type: 'Manufacturer', description: 'Hearing healthcare and diagnostic equipment.', description_zh: '听力保健和诊断设备' },
  { id: '550e8400-e29b-41d4-a716-446655440039', name: 'Cochlear', name_zh: '科利耳', country: 'Australia', address: '1 University Avenue, Macquarie University, NSW 2109', website: 'https://www.cochlear.com', business_type: 'Manufacturer', description: 'Implantable hearing solutions.', description_zh: '植入式听力解决方案' },
  { id: '550e8400-e29b-41d4-a716-446655440040', name: 'BioMerieux', name_zh: '生物梅里埃', country: 'France', address: '69280 Marcy-l\'Étoile', website: 'https://www.biomerieux.com', business_type: 'Manufacturer', description: 'In vitro diagnostics for infectious diseases.', description_zh: '传染病体外诊断' },
  { id: '550e8400-e29b-41d4-a716-446655440041', name: 'Sysmex Corporation', name_zh: '希森美康', country: 'Japan', address: '1-5-1 Wakinohama-Kaigandori, Chuo-ku, Kobe', website: 'https://www.sysmex.co.jp', business_type: 'Manufacturer', description: 'Hematology and urinalysis diagnostics.', description_zh: '血液学和尿液分析诊断' },
  { id: '550e8400-e29b-41d4-a716-446655440042', name: 'Danaher Corporation', name_zh: '丹纳赫', country: 'USA', address: '2200 Pennsylvania Avenue NW, Suite 800W, Washington, DC 20037', website: 'https://www.danaher.com', business_type: 'Manufacturer', description: 'Science and technology innovator with life sciences and diagnostics focus.', description_zh: '专注于生命科学和诊断的科技创新者' },
  { id: '550e8400-e29b-41d4-a716-446655440043', name: 'Thermo Fisher Scientific', name_zh: '赛默飞世尔科技', country: 'USA', address: '168 Third Avenue, Waltham, MA 02451', website: 'https://www.thermofisher.com', business_type: 'Manufacturer', description: 'Scientific research and clinical diagnostics products.', description_zh: '科学研究和临床诊断产品' },
  { id: '550e8400-e29b-41d4-a716-446655440044', name: 'PerkinElmer', name_zh: '珀金埃尔默', country: 'USA', address: '940 Winter Street, Waltham, MA 02451', website: 'https://www.perkinelmer.com', business_type: 'Manufacturer', description: 'Diagnostics and life science research solutions.', description_zh: '诊断和生命科学研究解决方案' },
  { id: '550e8400-e29b-41d4-a716-446655440045', name: 'Waters Corporation', name_zh: '沃特世', country: 'USA', address: '34 Maple Street, Milford, MA 01757', website: 'https://www.waters.com', business_type: 'Manufacturer', description: 'Analytical laboratory instruments and software.', description_zh: '分析实验室仪器和软件' },
  { id: '550e8400-e29b-41d4-a716-446655440046', name: 'Agilent Technologies', name_zh: '安捷伦科技', country: 'USA', address: '5301 Stevens Creek Blvd, Santa Clara, CA 95051', website: 'https://www.agilent.com', business_type: 'Manufacturer', description: 'Life sciences, diagnostics and applied chemical markets.', description_zh: '生命科学、诊断和应用化学市场' },
  { id: '550e8400-e29b-41d4-a716-446655440047', name: 'Illumina', name_zh: '因美纳', country: 'USA', address: '5200 Illumina Way, San Diego, CA 92122', website: 'https://www.illumina.com', business_type: 'Manufacturer', description: 'DNA sequencing and array-based technologies.', description_zh: 'DNA测序和基于阵列的技术' },
  { id: '550e8400-e29b-41d4-a716-446655440048', name: 'Qiagen', name_zh: '凯杰', country: 'Netherlands', address: 'Hulsterweg 82, 5912 PL Venlo', website: 'https://www.qiagen.com', business_type: 'Manufacturer', description: 'Sample and assay technologies for molecular diagnostics.', description_zh: '分子诊断的样品和检测技术' },
  { id: '550e8400-e29b-41d4-a716-446655440049', name: 'Bio-Rad Laboratories', name_zh: '伯乐生命医学', country: 'USA', address: '1000 Alfred Nobel Drive, Hercules, CA 94547', website: 'https://www.bio-rad.com', business_type: 'Manufacturer', description: 'Clinical diagnostics and life science research products.', description_zh: '临床诊断和生命科学研究产品' },
  { id: '550e8400-e29b-41d4-a716-446655440050', name: 'Werfen', name_zh: '沃芬', country: 'Spain', address: 'Can Sant Joan, s/n, 08173 Sant Cugat del Vallès', website: 'https://www.werfen.com', business_type: 'Manufacturer', description: 'In vitro diagnostics and hemostasis products.', description_zh: '体外诊断和止血产品' },
  { id: '550e8400-e29b-41d4-a716-446655440051', name: 'Nihon Kohden', name_zh: '日本光电', country: 'Japan', address: '1-31-4 Nishiochiai, Shinjuku-ku, Tokyo', website: 'https://www.nihonkohden.com', business_type: 'Manufacturer', description: 'Medical electronic equipment manufacturer.', description_zh: '医疗电子设备制造商' },
  { id: '550e8400-e29b-41d4-a716-446655440052', name: 'Fukuda Denshi', name_zh: '福田电子', country: 'Japan', address: '39-4, Hongo 3-chome, Bunkyo-ku, Tokyo', website: 'https://www.fukuda.co.jp', business_type: 'Manufacturer', description: 'Medical electronic equipment and systems.', description_zh: '医疗电子设备和系统' },
  { id: '550e8400-e29b-41d4-a716-446655440053', name: 'Arjo', name_zh: '安究', country: 'Sweden', address: 'Hans Michelsensgatan 10, 211 20 Malmö', website: 'https://www.arjo.com', business_type: 'Manufacturer', description: 'Medical devices and solutions for patient handling and hygiene.', description_zh: '患者处理和卫生医疗设备和解决方案' },
  { id: '550e8400-e29b-41d4-a716-446655440054', name: 'Linet', name_zh: '林奈特', country: 'Czech Republic', address: 'Železná 1065/10, 771 00 Olomouc', website: 'https://www.linet.com', business_type: 'Manufacturer', description: 'Hospital beds and patient care equipment.', description_zh: '医院病床和患者护理设备' },
  { id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline Industries', name_zh: '麦朗医疗', country: 'USA', address: '3 Lakes Drive, Northfield, IL 60093', website: 'https://www.medline.com', business_type: 'Manufacturer', description: 'Medical supplies and clinical solutions manufacturer.', description_zh: '医疗用品和临床解决方案制造商' },
  { id: '550e8400-e29b-41d4-a716-446655440056', name: 'Owens & Minor', name_zh: '欧文斯&迈纳', country: 'USA', address: '9120 Lockwood Boulevard, Mechanicsville, VA 23116', website: 'https://www.owens-minor.com', business_type: 'Distributor', description: 'Global healthcare logistics and supply chain services.', description_zh: '全球医疗保健物流和供应链服务' },
  { id: '550e8400-e29b-41d4-a716-446655440057', name: 'McKesson Corporation', name_zh: '麦克森', country: 'USA', address: '6555 State Highway 161, Irving, TX 75039', website: 'https://www.mckesson.com', business_type: 'Distributor', description: 'Pharmaceuticals and medical supplies distribution.', description_zh: '药品和医疗用品分销' },
  { id: '550e8400-e29b-41d4-a716-446655440058', name: 'Henry Schein', name_zh: '汉瑞祥', country: 'USA', address: '135 Duryea Road, Melville, NY 11747', website: 'https://www.henryschein.com', business_type: 'Distributor', description: 'Healthcare products and services to office-based practitioners.', description_zh: '为诊所从业者提供医疗产品和服务' },
  { id: '550e8400-e29b-41d4-a716-446655440059', name: 'Convatec', name_zh: '康维德', country: 'UK', address: '3 Forbury Place, 23 Forbury Road, Reading RG1 3JH', website: 'https://www.convatec.com', business_type: 'Manufacturer', description: 'Medical products for chronic conditions and wound care.', description_zh: '慢性病和伤口护理医疗产品' },
  { id: '550e8400-e29b-41d4-a716-446655440060', name: 'Coloplast', name_zh: '康乐保', country: 'Denmark', address: 'Holtedam 1, 3050 Humlebæk', website: 'https://www.coloplast.com', business_type: 'Manufacturer', description: 'Intimate healthcare products and medical devices.', description_zh: '私密保健产品和医疗设备' },
  { id: '550e8400-e29b-41d4-a716-446655440061', name: 'Ambu', name_zh: '安保', country: 'Denmark', address: 'Baltorpbakken 13, 2750 Ballerup', website: 'https://www.ambu.com', business_type: 'Manufacturer', description: 'Single-use endoscopy and anesthesia products.', description_zh: '一次性内窥镜和麻醉产品' }
];

// 基础产品数据
const baseProducts = [
  { company_id: '550e8400-e29b-41d4-a716-446655440000', name: 'Azure™ MRI Pacemaker', name_zh: 'Azure™ MRI起搏器', description: 'MRI conditional pacemaker with automaticity', description_zh: 'MRI兼容起搏器，具有自动调节功能', category: 'Cardiac Rhythm Management', intended_use: 'For patients with bradycardia who require MRI scans', model_number: 'W1DR01', brand_name: 'Medtronic' },
  { company_id: '550e8400-e29b-41d4-a716-446655440000', name: 'Micra™ AV Transcatheter Pacing System', name_zh: 'Micra™ AV经导管起搏系统', description: 'World\'s smallest pacemaker with atrioventricular synchrony', description_zh: '世界上最小的起搏器，具有房室同步功能', category: 'Cardiac Rhythm Management', intended_use: 'For patients with AV block', model_number: 'MC1AVR1', brand_name: 'Medtronic' },
  { company_id: '550e8400-e29b-41d4-a716-446655440001', name: 'ETHICON™ Sutures', name_zh: '爱惜康™缝线', description: 'Comprehensive range of surgical sutures', description_zh: '全面的外科缝线产品系列', category: 'Surgical Supplies', intended_use: 'For wound closure in various surgical procedures', model_number: 'Various', brand_name: 'ETHICON' },
  { company_id: '550e8400-e29b-41d4-a716-446655440002', name: 'MAGNETOM Free.Max', name_zh: 'MAGNETOM Free.Max', description: 'World\'s first 80 cm bore MRI', description_zh: '世界首台80厘米孔径MRI', category: 'Medical Imaging', intended_use: 'For diagnostic imaging with improved patient comfort', model_number: 'MAGNETOM Free.Max', brand_name: 'Siemens Healthineers' },
  { company_id: '550e8400-e29b-41d4-a716-446655440003', name: 'BeneVision N1', name_zh: 'BeneVision N1', description: 'Patient monitor with transport capability', description_zh: '具有转运功能的病人监护仪', category: 'Patient Monitoring', intended_use: 'For continuous patient monitoring across care areas', model_number: 'N1', brand_name: 'Mindray' },
  { company_id: '550e8400-e29b-41d4-a716-446655440004', name: 'cobas e 801', name_zh: 'cobas e 801', description: 'High-throughput immunoassay analyzer', description_zh: '高通量免疫分析仪', category: 'In Vitro Diagnostics', intended_use: 'For high-volume clinical laboratory testing', model_number: 'cobas e 801', brand_name: 'Roche' },
  { company_id: '550e8400-e29b-41d4-a716-446655440005', name: 'Ultimaster™ Tansei', name_zh: 'Ultimaster™ 淡青', description: 'Drug-eluting coronary stent system', description_zh: '药物洗脱冠状动脉支架系统', category: 'Interventional Cardiology', intended_use: 'For coronary artery disease treatment', model_number: 'DCB-HE', brand_name: 'Terumo' },
  { company_id: '550e8400-e29b-41d4-a716-446655440006', name: 'EVIS X1 Endoscopy System', name_zh: 'EVIS X1内窥镜系统', description: 'Advanced endoscopy platform with AI integration', description_zh: '集成人工智能的先进内窥镜平台', category: 'Endoscopy', intended_use: 'For gastrointestinal diagnostic and therapeutic procedures', model_number: 'CV-1500', brand_name: 'Olympus' },
  { company_id: '550e8400-e29b-41d4-a716-446655440007', name: 'Mako SmartRobotics™', name_zh: 'Mako智能机器人', description: 'Robotic-arm assisted surgery system', description_zh: '机械臂辅助手术系统', category: 'Robotic Surgery', intended_use: 'For knee and hip replacement surgery', model_number: 'Mako System', brand_name: 'Stryker' },
  { company_id: '550e8400-e29b-41d4-a716-446655440008', name: 'FreeStyle Libre', name_zh: '瞬感', description: 'Continuous glucose monitoring system', description_zh: '持续血糖监测系统', category: 'Diabetes Care', intended_use: 'For glucose monitoring without finger pricks', model_number: 'FreeStyle Libre 3', brand_name: 'Abbott' },
  { company_id: '550e8400-e29b-41d4-a716-446655440009', name: 'WATCHMAN FLX', name_zh: 'WATCHMAN FLX左心耳封堵器', description: 'Left atrial appendage closure device', description_zh: '左心耳封堵装置', category: 'Structural Heart', intended_use: 'For stroke prevention in atrial fibrillation patients', model_number: 'WATCHMAN FLX', brand_name: 'Boston Scientific' },
  { company_id: '550e8400-e29b-41d4-a716-446655440010', name: 'F&P Humidified High Flow Therapy', name_zh: '费雪派克高流量湿化氧疗', description: 'Heated and humidified high flow nasal cannula system', description_zh: '加热湿化高流量鼻导管系统', category: 'Respiratory Care', intended_use: 'For respiratory support and oxygen therapy', model_number: 'AIRVO 2', brand_name: 'Fisher & Paykel' },
  { company_id: '550e8400-e29b-41d4-a716-446655440011', name: 'Getinge Maquet Servo-air', name_zh: '洁定迈柯唯Servo-air', description: 'Mechanical ventilator for intensive care', description_zh: '重症监护机械呼吸机', category: 'Critical Care', intended_use: 'For invasive and non-invasive ventilation', model_number: 'Servo-air', brand_name: 'Getinge' }
];

// 扩展产品数据
const extendedProducts = [
  // 口罩类产品
  { company_id: '550e8400-e29b-41d4-a716-446655440012', name: '3M N95 Respirator 8210', name_zh: '3M N95呼吸防护口罩8210', description: 'N95 particulate respirator for solid and liquid aerosols', description_zh: 'N95颗粒物防护口罩，用于固体和液体气溶胶', category: 'Personal Protective Equipment', intended_use: 'For protection against certain airborne particles', model_number: '8210', brand_name: '3M' },
  { company_id: '550e8400-e29b-41d4-a716-446655440012', name: '3M Surgical Mask 1826', name_zh: '3M外科口罩1826', description: 'Fluid-resistant surgical mask with ear loops', description_zh: '防液体外科口罩，带耳挂', category: 'Personal Protective Equipment', intended_use: 'For protection during surgical procedures', model_number: '1826', brand_name: '3M' },
  { company_id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline Procedure Mask', name_zh: '麦朗手术口罩', description: 'Standard procedure mask with ear loops', description_zh: '标准手术口罩，带耳挂', category: 'Personal Protective Equipment', intended_use: 'For general medical and surgical use', model_number: 'NON27376', brand_name: 'Medline' },
  { company_id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline N95 Flat-Fold Respirator', name_zh: '麦朗N95折叠式呼吸器', description: 'N95 flat-fold respirator with adjustable nose piece', description_zh: 'N95折叠式呼吸器，带可调节鼻夹', category: 'Personal Protective Equipment', intended_use: 'For respiratory protection in healthcare settings', model_number: 'NON24506A', brand_name: 'Medline' },
  { company_id: '550e8400-e29b-41d4-a716-446655440024', name: 'B. Braun Surgical Face Mask', name_zh: '贝朗外科口罩', description: 'Type IIR surgical face mask with splash resistance', description_zh: 'IIR型外科口罩，防飞溅', category: 'Personal Protective Equipment', intended_use: 'For surgical and medical use', model_number: '4238111', brand_name: 'B. Braun' },
  
  // 注射器类产品
  { company_id: '550e8400-e29b-41d4-a716-446655440013', name: 'BD Syringe 10mL', name_zh: '碧迪10毫升注射器', description: 'Luer-Lok tip syringe for general purpose use', description_zh: '鲁尔锁接口注射器，通用型', category: 'Injection & Infusion', intended_use: 'For general injection and aspiration', model_number: '309604', brand_name: 'BD' },
  { company_id: '550e8400-e29b-41d4-a716-446655440013', name: 'BD Insulin Syringe 1mL', name_zh: '碧迪1毫升胰岛素注射器', description: 'Ultra-fine needle insulin syringe', description_zh: '超细针头胰岛素注射器', category: 'Injection & Infusion', intended_use: 'For insulin administration', model_number: '328438', brand_name: 'BD' },
  { company_id: '550e8400-e29b-41d4-a716-446655440013', name: 'BD Safety-Lok Syringe', name_zh: '碧迪安全锁注射器', description: 'Safety syringe with retractable needle', description_zh: '带可伸缩针头的安全注射器', category: 'Injection & Infusion', intended_use: 'For safe injection practices', model_number: '309595', brand_name: 'BD' },
  { company_id: '550e8400-e29b-41d4-a716-446655440024', name: 'B. Braun Omnifix Syringe', name_zh: '贝朗Omnifix注射器', description: 'Luer Lock Solo syringe for various applications', description_zh: 'Luer Lock Solo注射器，多种用途', category: 'Injection & Infusion', intended_use: 'For general medical injections', model_number: '9161406V', brand_name: 'B. Braun' },
  { company_id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline Syringe 5mL', name_zh: '麦朗5毫升注射器', description: 'Luer lock syringe with clear barrel', description_zh: '鲁尔锁注射器，透明筒身', category: 'Injection & Infusion', intended_use: 'For general medical use', model_number: 'DYND70625', brand_name: 'Medline' },
  
  // 手套类产品
  { company_id: '550e8400-e29b-41d4-a716-446655440013', name: 'BD Latex Exam Gloves', name_zh: '碧迪乳胶检查手套', description: 'Powder-free latex examination gloves', description_zh: '无粉乳胶检查手套', category: 'Personal Protective Equipment', intended_use: 'For medical examination and procedures', model_number: '401002', brand_name: 'BD' },
  { company_id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline Nitrile Exam Gloves', name_zh: '麦朗丁腈检查手套', description: 'Powder-free nitrile examination gloves', description_zh: '无粉丁腈检查手套', category: 'Personal Protective Equipment', intended_use: 'For medical examination and procedures', model_number: 'MDS192076', brand_name: 'Medline' },
  { company_id: '550e8400-e29b-41d4-a716-446655440012', name: '3M Nitrile Gloves', name_zh: '3M丁腈手套', description: 'Chemical-resistant nitrile gloves', description_zh: '耐化学丁腈手套', category: 'Personal Protective Equipment', intended_use: 'For chemical and biological protection', model_number: 'Gloves-Nitrile', brand_name: '3M' },
  { company_id: '550e8400-e29b-41d4-a716-446655440024', name: 'B. Braun Surgical Gloves', name_zh: '贝朗外科手套', description: 'Sterile powdered latex surgical gloves', description_zh: '无菌有粉乳胶外科手套', category: 'Personal Protective Equipment', intended_use: 'For surgical procedures', model_number: '4095122', brand_name: 'B. Braun' },
  { company_id: '550e8400-e29b-41d4-a716-446655440058', name: 'Henry Schein Latex Gloves', name_zh: '汉瑞祥乳胶手套', description: 'Powder-free latex exam gloves', description_zh: '无粉乳胶检查手套', category: 'Personal Protective Equipment', intended_use: 'For medical examination', model_number: '1130885', brand_name: 'Henry Schein' },
  
  // 绷带和伤口护理
  { company_id: '550e8400-e29b-41d4-a716-446655440012', name: '3M Tegaderm Dressing', name_zh: '3M透明敷料', description: 'Transparent film dressing for wound care', description_zh: '透明薄膜敷料，用于伤口护理', category: 'Wound Care', intended_use: 'For covering and protecting wounds', model_number: '1626W', brand_name: '3M' },
  { company_id: '550e8400-e29b-41d4-a716-446655440012', name: '3M Micropore Tape', name_zh: '3M微孔胶带', description: 'Surgical paper tape for sensitive skin', description_zh: '外科纸质胶带，适合敏感肌肤', category: 'Wound Care', intended_use: 'For securing dressings and devices', model_number: '1530-1', brand_name: '3M' },
  { company_id: '550e8400-e29b-41d4-a716-446655440020', name: 'Smith & Nephew ALLEVYN Dressing', name_zh: '施乐辉ALLEVYN敷料', description: 'Foam dressing for exuding wounds', description_zh: '泡沫敷料，用于渗出性伤口', category: 'Wound Care', intended_use: 'For wound management and healing', model_number: '66800270', brand_name: 'Smith & Nephew' },
  { company_id: '550e8400-e29b-41d4-a716-446655440020', name: 'Smith & Nephew OPSITE Dressing', name_zh: '施乐辉OPSITE敷料', description: 'Transparent adhesive film dressing', description_zh: '透明粘性薄膜敷料', category: 'Wound Care', intended_use: 'For post-operative wound care', model_number: '66000041', brand_name: 'Smith & Nephew' },
  { company_id: '550e8400-e29b-41d4-a716-446655440059', name: 'Convatec DuoDERM Dressing', name_zh: '康维德DuoDERM敷料', description: 'Hydrocolloid dressing for wounds', description_zh: '水胶体敷料，用于伤口', category: 'Wound Care', intended_use: 'For pressure ulcers and wounds', model_number: '187660', brand_name: 'Convatec' },
  { company_id: '550e8400-e29b-41d4-a716-446655440059', name: 'Convatec AQUACEL Dressing', name_zh: '康维德AQUACEL敷料', description: 'Hydrofiber dressing for wound care', description_zh: '水纤维敷料，用于伤口护理', category: 'Wound Care', intended_use: 'For moderate to heavily exuding wounds', model_number: '420672', brand_name: 'Convatec' },
  { company_id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline Gauze Sponges', name_zh: '麦朗纱布海绵', description: 'Woven gauze sponges for wound care', description_zh: '机织纱布海绵，用于伤口护理', category: 'Wound Care', intended_use: 'For wound cleaning and dressing', model_number: 'NON21424', brand_name: 'Medline' },
  { company_id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline Elastic Bandage', name_zh: '麦朗弹性绷带', description: 'Self-closure elastic bandage', description_zh: '自粘弹性绷带', category: 'Wound Care', intended_use: 'For compression and support', model_number: 'MDS046002', brand_name: 'Medline' },
  
  // 导管类产品
  { company_id: '550e8400-e29b-41d4-a716-446655440013', name: 'BD Foley Catheter', name_zh: '碧迪导尿管', description: '2-way latex Foley catheter', description_zh: '双腔乳胶导尿管', category: 'Urology', intended_use: 'For urinary drainage', model_number: '8887601012', brand_name: 'BD' },
  { company_id: '550e8400-e29b-41d4-a716-446655440013', name: 'BD IV Catheter', name_zh: '碧迪静脉导管', description: 'Peripheral IV catheter with injection port', description_zh: '外周静脉导管，带注射口', category: 'Infusion Therapy', intended_use: 'For intravenous access', model_number: '381444', brand_name: 'BD' },
  { company_id: '550e8400-e29b-41d4-a716-446655440024', name: 'B. Braun Introcan Catheter', name_zh: '贝朗Introcan导管', description: 'Safety IV catheter with passive needle shield', description_zh: '安全静脉导管，带被动针头保护', category: 'Infusion Therapy', intended_use: 'For safe intravenous access', model_number: '4251600-02', brand_name: 'B. Braun' },
  { company_id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline Foley Catheter', name_zh: '麦朗导尿管', description: 'Silicone-coated latex catheter', description_zh: '硅胶涂层乳胶导管', category: 'Urology', intended_use: 'For urinary catheterization', model_number: 'DYND11756', brand_name: 'Medline' },
  { company_id: '550e8400-e29b-41d4-a716-446655440017', name: 'Baxter Clearlink Catheter', name_zh: '百特Clearlink导管', description: 'Needle-free IV catheter connection system', description_zh: '无针静脉导管连接系统', category: 'Infusion Therapy', intended_use: 'For IV line connections', model_number: '2N1191', brand_name: 'Baxter' },
  
  // 手术器械
  { company_id: '550e8400-e29b-41d4-a716-446655440023', name: 'Intuitive Surgical da Vinci Instrument', name_zh: '直觉外科达芬奇手术器械', description: 'Robotic surgical instrument for minimally invasive surgery', description_zh: '机器人手术器械，用于微创手术', category: 'Surgical Instruments', intended_use: 'For robotic-assisted surgery', model_number: '420184', brand_name: 'Intuitive Surgical' },
  { company_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Ethicon Harmonic Scalpel', name_zh: '爱惜康超声刀', description: 'Ultrasonic surgical scalpel for cutting and coagulation', description_zh: '超声手术刀，用于切割和凝血', category: 'Surgical Instruments', intended_use: 'For surgical cutting and coagulation', model_number: 'HAR36', brand_name: 'Ethicon' },
  { company_id: '550e8400-e29b-41d4-a716-446655440001', name: 'Ethicon Ligaclip', name_zh: '爱惜康结扎夹', description: 'Hemostatic clip applier for vessel ligation', description_zh: '止血夹施夹器，用于血管结扎', category: 'Surgical Instruments', intended_use: 'For vessel ligation during surgery', model_number: 'ML10', brand_name: 'Ethicon' },
  { company_id: '550e8400-e29b-41d4-a716-446655440024', name: 'B. Braun Aesculap Scalpel', name_zh: '贝朗蛇牌手术刀', description: 'Disposable surgical scalpel with stainless steel blade', description_zh: '一次性手术刀，不锈钢刀片', category: 'Surgical Instruments', intended_use: 'For surgical incisions', model_number: 'BB514', brand_name: 'B. Braun' },
  { company_id: '550e8400-e29b-41d4-a716-446655440055', name: 'Medline Surgical Scissors', name_zh: '麦朗手术剪', description: 'Stainless steel surgical scissors', description_zh: '不锈钢手术剪', category: 'Surgical Instruments', intended_use: 'For surgical procedures', model_number: 'MDS10420', brand_name: 'Medline' },
  
  // 监护和诊断设备
  { company_id: '550e8400-e29b-41d4-a716-446655440016', name: 'Philips IntelliVue Monitor', name_zh: '飞利浦IntelliVue监护仪', description: 'Patient monitoring system with multi-parameter capabilities', description_zh: '病人监护系统，多参数功能', category: 'Patient Monitoring', intended_use: 'For continuous patient monitoring', model_number: 'MX450', brand_name: 'Philips' },
  { company_id: '550e8400-e29b-41d4-a716-446655440015', name: 'GE Healthcare CARESCAPE Monitor', name_zh: 'GE医疗CARESCAPE监护仪', description: 'Modular patient monitor for critical care', description_zh: '模块化病人监护仪，用于重症监护', category: 'Patient Monitoring', intended_use: 'For ICU and critical care monitoring', model_number: 'B650', brand_name: 'GE Healthcare' },
  { company_id: '550e8400-e29b-41d4-a716-446655440051', name: 'Nihon Kohden Bedside Monitor', name_zh: '日本光电床旁监护仪', description: 'Compact bedside patient monitor', description_zh: '紧凑型床旁病人监护仪', category: 'Patient Monitoring', intended_use: 'For bedside patient monitoring', model_number: 'BSM-2301K', brand_name: 'Nihon Kohden' },
  { company_id: '550e8400-e29b-41d4-a716-446655440033', name: 'Welch Allyn Spot Vital Signs', name_zh: '伟伦Spot生命体征监测仪', description: 'Vital signs monitor for blood pressure, pulse, and temperature', description_zh: '生命体征监测仪，测量血压、脉搏和体温', category: 'Patient Monitoring', intended_use: 'For routine vital signs measurement', model_number: '42NTB-E1', brand_name: 'Welch Allyn' },
  { company_id: '550e8400-e29b-41d4-a716-446655440032', name: 'Masimo Radical-7 Pulse Oximeter', name_zh: '麦斯莫Radical-7脉搏血氧仪', description: 'Noninvasive pulse oximetry and hemoglobin monitoring', description_zh: '无创脉搏血氧和血红蛋白监测', category: 'Patient Monitoring', intended_use: 'For continuous SpO2 and hemoglobin monitoring', model_number: 'Radical-7', brand_name: 'Masimo' },
  
  // 血糖监测
  { company_id: '550e8400-e29b-41d4-a716-446655440008', name: 'Abbott FreeStyle Lite', name_zh: '雅培瞬感Lite', description: 'Blood glucose monitoring system', description_zh: '血糖监测系统', category: 'Diabetes Care', intended_use: 'For blood glucose monitoring', model_number: '70804', brand_name: 'Abbott' },
  { company_id: '550e8400-e29b-41d4-a716-446655440008', name: 'Abbott FreeStyle Precision Neo', name_zh: '雅培瞬感Precision Neo', description: 'Blood glucose and ketone monitoring system', description_zh: '血糖和酮体监测系统', category: 'Diabetes Care', intended_use: 'For glucose and ketone monitoring', model_number: '71536', brand_name: 'Abbott' },
  { company_id: '550e8400-e29b-41d4-a716-446655440013', name: 'BD Blood Glucose Monitor', name_zh: '碧迪血糖仪', description: 'Blood glucose monitoring system with test strips', description_zh: '血糖监测系统，带试纸', category: 'Diabetes Care', intended_use: 'For blood glucose testing', model_number: '2837300', brand_name: 'BD' },
  
  // 轮椅和康复设备
  { company_id: '550e8400-e29b-41d4-a716-446655440035', name: 'Invacare Manual Wheelchair', name_zh: '英维康手动轮椅', description: 'Lightweight manual wheelchair with adjustable features', description_zh: '轻量手动轮椅，可调节功能', category: 'Rehabilitation', intended_use: 'For patient mobility', model_number: '9000XT', brand_name: 'Invacare' },
  { company_id: '550e8400-e29b-41d4-a716-446655440035', name: 'Invacare Power Wheelchair', name_zh: '英维康电动轮椅', description: 'Electric power wheelchair with joystick control', description_zh: '电动轮椅，操纵杆控制', category: 'Rehabilitation', intended_use: 'For enhanced patient mobility', model_number: 'TDX SP2', brand_name: 'Invacare' },
  { company_id: '550e8400-e29b-41d4-a716-446655440036', name: 'Ottobock Prosthetic Leg', name_zh: '奥托博克假肢腿', description: 'Microprocessor-controlled prosthetic knee', description_zh: '微处理器控制假肢膝关节', category: 'Rehabilitation', intended_use: 'For lower limb amputees', model_number: 'C-Leg 4', brand_name: 'Ottobock' },
  { company_id: '550e8400-e29b-41d4-a716-446655440053', name: 'Arjo Patient Lift', name_zh: '安究病人移位机', description: 'Electric patient lift for safe patient handling', description_zh: '电动病人移位机，安全搬运病人', category: 'Rehabilitation', intended_use: 'For safe patient transfers', model_number: 'Maxi Move', brand_name: 'Arjo' },
  { company_id: '550e8400-e29b-41d4-a716-446655440054', name: 'Linet Hospital Bed', name_zh: '林奈特医院病床', description: 'Electric hospital bed with integrated scales', description_zh: '电动医院病床，带集成秤', category: 'Hospital Furniture', intended_use: 'For patient care and comfort', model_number: 'Multicare', brand_name: 'Linet' },
  
  // 听力设备
  { company_id: '550e8400-e29b-41d4-a716-446655440037', name: 'Sonova Phonak Hearing Aid', name_zh: '索诺瓦峰力助听器', description: 'Digital hearing aid with Bluetooth connectivity', description_zh: '数字助听器，蓝牙连接', category: 'Hearing Care', intended_use: 'For hearing loss treatment', model_number: 'Audeo Lumity', brand_name: 'Phonak' },
  { company_id: '550e8400-e29b-41d4-a716-446655440038', name: 'Demant Oticon Hearing Aid', name_zh: '戴蒙特奥迪康助听器', description: 'AI-powered hearing aid with deep neural network', description_zh: 'AI助听器，深度神经网络', category: 'Hearing Care', intended_use: 'For hearing loss treatment', model_number: 'Oticon Real', brand_name: 'Oticon' },
  { company_id: '550e8400-e29b-41d4-a716-446655440039', name: 'Cochlear Nucleus Implant', name_zh: '科利耳Nucleus植入体', description: 'Cochlear implant system for severe hearing loss', description_zh: '人工耳蜗系统，用于重度听力损失', category: 'Hearing Care', intended_use: 'For severe to profound hearing loss', model_number: 'Nucleus 8', brand_name: 'Cochlear' },
  
  // 实验室设备
  { company_id: '550e8400-e29b-41d4-a716-446655440040', name: 'BioMerieux VITEK System', name_zh: '生物梅里埃VITEK系统', description: 'Automated microbial identification system', description_zh: '自动微生物鉴定系统', category: 'Laboratory Equipment', intended_use: 'For bacterial identification', model_number: 'VITEK 2', brand_name: 'BioMerieux' },
  { company_id: '550e8400-e29b-41d4-a716-446655440041', name: 'Sysmex Hematology Analyzer', name_zh: '希森美康血液分析仪', description: 'Automated hematology analyzer for blood cell counting', description_zh: '自动血液分析仪，用于血细胞计数', category: 'Laboratory Equipment', intended_use: 'For complete blood count analysis', model_number: 'XN-1000', brand_name: 'Sysmex' },
  { company_id: '550e8400-e29b-41d4-a716-446655440043', name: 'Thermo Fisher Centrifuge', name_zh: '赛默飞离心机', description: 'High-speed centrifuge for laboratory use', description_zh: '高速离心机，实验室用', category: 'Laboratory Equipment', intended_use: 'For sample preparation', model_number: 'Sorvall ST 16', brand_name: 'Thermo Fisher' },
  { company_id: '550e8400-e29b-41d4-a716-446655440047', name: 'Illumina Sequencing System', name_zh: '因美纳测序系统', description: 'Next-generation DNA sequencing platform', description_zh: '下一代DNA测序平台', category: 'Laboratory Equipment', intended_use: 'For genomic analysis', model_number: 'NovaSeq 6000', brand_name: 'Illumina' },
  { company_id: '550e8400-e29b-41d4-a716-446655440042', name: 'Danaher Beckman Coulter Analyzer', name_zh: '丹纳赫贝克曼库尔特分析仪', description: 'Clinical chemistry and immunoassay analyzer', description_zh: '临床化学和免疫分析分析仪', category: 'Laboratory Equipment', intended_use: 'For clinical laboratory testing', model_number: 'AU5800', brand_name: 'Beckman Coulter' }
];

async function importData() {
  console.log('开始导入数据到 Supabase...\n');

  const results = {
    companies: { success: 0, failed: 0, errors: [] as string[] },
    products: { success: 0, failed: 0, errors: [] as string[] }
  };

  // 1. 导入基础公司数据
  console.log('导入基础公司数据 (12家)...');
  for (const company of baseCompanies) {
    const { error } = await supabase
      .from('companies')
      .upsert(company, { onConflict: 'id' });
    
    if (error) {
      results.companies.failed++;
      results.companies.errors.push(`公司 ${company.name}: ${error.message}`);
      console.error(`  ✗ ${company.name}: ${error.message}`);
    } else {
      results.companies.success++;
      console.log(`  ✓ ${company.name}`);
    }
  }

  // 2. 导入扩展公司数据
  console.log('\n导入扩展公司数据 (50家)...');
  for (const company of extendedCompanies) {
    const { error } = await supabase
      .from('companies')
      .upsert(company, { onConflict: 'id' });
    
    if (error) {
      results.companies.failed++;
      results.companies.errors.push(`公司 ${company.name}: ${error.message}`);
      console.error(`  ✗ ${company.name}: ${error.message}`);
    } else {
      results.companies.success++;
      console.log(`  ✓ ${company.name}`);
    }
  }

  // 3. 导入基础产品数据
  console.log('\n导入基础产品数据 (12个)...');
  for (const product of baseProducts) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'id' });
    
    if (error) {
      results.products.failed++;
      results.products.errors.push(`产品 ${product.name}: ${error.message}`);
      console.error(`  ✗ ${product.name}: ${error.message}`);
    } else {
      results.products.success++;
      console.log(`  ✓ ${product.name}`);
    }
  }

  // 4. 导入扩展产品数据
  console.log('\n导入扩展产品数据 (80个)...');
  for (const product of extendedProducts) {
    const { error } = await supabase
      .from('products')
      .upsert(product, { onConflict: 'id' });
    
    if (error) {
      results.products.failed++;
      results.products.errors.push(`产品 ${product.name}: ${error.message}`);
      console.error(`  ✗ ${product.name}: ${error.message}`);
    } else {
      results.products.success++;
      console.log(`  ✓ ${product.name}`);
    }
  }

  // 输出结果汇总
  console.log('\n========================================');
  console.log('数据导入完成！');
  console.log('========================================');
  console.log(`公司数据: ${results.companies.success} 成功, ${results.companies.failed} 失败`);
  console.log(`产品数据: ${results.products.success} 成功, ${results.products.failed} 失败`);
  console.log(`总计: ${results.companies.success + results.products.success} 成功, ${results.companies.failed + results.products.failed} 失败`);

  if (results.companies.errors.length > 0 || results.products.errors.length > 0) {
    console.log('\n错误详情:');
    [...results.companies.errors, ...results.products.errors].slice(0, 10).forEach(err => {
      console.log(`  - ${err}`);
    });
    if (results.companies.errors.length + results.products.errors.length > 10) {
      console.log(`  ... 还有 ${results.companies.errors.length + results.products.errors.length - 10} 个错误`);
    }
  }
}

// 运行导入
importData().catch(console.error);
