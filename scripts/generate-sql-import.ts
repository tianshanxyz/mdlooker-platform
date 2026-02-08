/**
 * 生成 SQL 导入文件
 * 使用方法:
 * 1. 运行: npx ts-node scripts/generate-sql-import.ts
 * 2. 打开 database/seed_data.sql
 * 3. 复制内容到 Supabase Dashboard -> SQL Editor -> New Query
 * 4. 执行 SQL
 */

import * as fs from 'fs';
import * as path from 'path';

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
    address: 'One Johnson & Johnson Plaza, New Brunswick, NJ 08933, USA',
    website: 'https://www.jnj.com',
    business_type: 'Manufacturer',
    description: 'World-renowned healthcare company focusing on medical devices, pharmaceuticals, and consumer goods.',
    description_zh: '全球知名的医疗健康公司，专注于医疗器材、制药和消费品领域'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Siemens Healthineers',
    name_zh: '西门子医疗',
    country: 'Germany',
    address: 'Henkestrasse 127, 91052 Erlangen, Germany',
    website: 'https://www.siemens-healthineers.com',
    business_type: 'Manufacturer',
    description: 'Leading medical technology company with core business in imaging, diagnostics, and advanced therapies.',
    description_zh: '领先的医疗技术公司，核心业务涵盖影像、诊断和先进治疗领域'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Mindray Medical',
    name_zh: '迈瑞医疗',
    country: 'China',
    address: 'Mindray Building, Keji 12th Road South, High-Tech Industrial Park, Nanshan, Shenzhen 518057, China',
    website: 'https://www.mindray.com',
    business_type: 'Manufacturer',
    description: 'China\'s leading medical equipment and solution provider, products cover life information and support, in vitro diagnostics, and medical imaging.',
    description_zh: '中国领先的医疗器械及解决方案供应商，产品覆盖生命信息与支持、体外诊断、医学影像三大领域'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Roche Diagnostics',
    name_zh: '罗氏诊断',
    country: 'Switzerland',
    address: 'Forrenstrasse 2, 6343 Rotkreuz, Switzerland',
    website: 'https://diagnostics.roche.com',
    business_type: 'Manufacturer',
    description: 'World-leading in vitro diagnostics company, providing innovative diagnostic solutions.',
    description_zh: '全球体外诊断领域的领导者，提供创新的诊断解决方案'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Terumo Corporation',
    name_zh: '泰尔茂',
    country: 'Japan',
    address: '44-1, 2-chome, Hatagaya, Shibuya-ku, Tokyo 151-0072, Japan',
    website: 'https://www.terumo.com',
    business_type: 'Manufacturer',
    description: 'Japanese medical device manufacturer, products include cardiovascular products, general hospital supplies, and blood transfusion systems.',
    description_zh: '日本医疗器械制造商，产品包括心血管产品、一般医疗耗材和输血系统等'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'Olympus Corporation',
    name_zh: '奥林巴斯',
    country: 'Japan',
    address: '2951 Ishikawa-machi, Hachioji-shi, Tokyo 192-8507, Japan',
    website: 'https://www.olympus-global.com',
    business_type: 'Manufacturer',
    description: 'Global leader in endoscopic medical equipment and precision optics.',
    description_zh: '全球领先的内窥镜医疗设备和精密光学仪器制造商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Stryker Corporation',
    name_zh: '史赛克',
    country: 'USA',
    address: '1941 Stryker Way, Portage, MI 49002, USA',
    website: 'https://www.stryker.com',
    business_type: 'Manufacturer',
    description: 'Leading medical technology company, products cover orthopedics, medical and surgical equipment, and neurotechnology.',
    description_zh: '领先的医疗技术公司，产品涵盖骨科、医疗及外科设备、神经技术等领域'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Abbott Laboratories',
    name_zh: '雅培',
    country: 'USA',
    address: '100 Abbott Park Road, Abbott Park, IL 60064, USA',
    website: 'https://www.abbott.com',
    business_type: 'Manufacturer',
    description: 'Global healthcare company, business covers diagnostics, medical devices, nutrition, and branded generic pharmaceuticals.',
    description_zh: '全球医疗保健公司，业务涵盖诊断、医疗器械、营养品和品牌仿制药等领域'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'Boston Scientific',
    name_zh: '波士顿科学',
    country: 'USA',
    address: '300 Boston Scientific Way, Marlborough, MA 01752, USA',
    website: 'https://www.bostonscientific.com',
    business_type: 'Manufacturer',
    description: 'Global leader in medical solutions, dedicated to providing innovative solutions for patients with various diseases.',
    description_zh: '全球医疗解决方案领导者，致力于为各种疾病的患者提供创新解决方案'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'Fisher & Paykel Healthcare',
    name_zh: '费雪派克',
    country: 'New Zealand',
    address: '15 Maurice Paykel Place, East Tamaki, Auckland 2013, New Zealand',
    website: 'https://www.fphcare.com',
    business_type: 'Manufacturer',
    description: 'Designer and manufacturer of acute care respiratory humidification systems, masks, and respiratory care products.',
    description_zh: '急性呼吸加湿系统、面罩和呼吸护理产品的设计制造商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Getinge AB',
    name_zh: '洁定',
    country: 'Sweden',
    address: 'Lindholmspiren 7A, SE-417 56 Göteborg, Sweden',
    website: 'https://www.getinge.com',
    business_type: 'Manufacturer',
    description: 'Leading medical technology company, providing solutions for surgery, intensive care, care, and sterilization.',
    description_zh: '领先的医疗技术公司，为外科、重症监护、护理和灭菌提供解决方案'
  }
];

// 扩展公司数据（50家）
const extendedCompanies = [
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    name: '3M Healthcare',
    name_zh: '3M医疗',
    country: 'USA',
    address: '3M Center, St. Paul, MN 55144, USA',
    website: 'https://www.3m.com/healthcare',
    business_type: 'Manufacturer',
    description: 'Global diversified technology company, medical products include dressings, tapes, masks, etc.',
    description_zh: '全球多元化科技企业，医疗产品包括敷料、胶带、口罩等'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'Becton Dickinson',
    name_zh: '碧迪医疗',
    country: 'USA',
    address: '1 Becton Drive, Franklin Lakes, NJ 07417, USA',
    website: 'https://www.bd.com',
    business_type: 'Manufacturer',
    description: 'Global leading medical technology company, products cover medical, interventional, and life sciences.',
    description_zh: '全球领先的医疗技术公司，产品涵盖医疗、介入和生命科学领域'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    name: 'Cardinal Health',
    name_zh: '康德乐',
    country: 'USA',
    address: '7000 Cardinal Place, Dublin, OH 43017, USA',
    website: 'https://www.cardinalhealth.com',
    business_type: 'Distributor',
    description: 'Global integrated healthcare services and products company.',
    description_zh: '全球综合医疗保健服务和产品公司'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    name: 'GE Healthcare',
    name_zh: 'GE医疗',
    country: 'USA',
    address: '500 W. Monroe Street, Chicago, IL 60661, USA',
    website: 'https://www.gehealthcare.com',
    business_type: 'Manufacturer',
    description: 'Leading medical imaging, monitoring, and digital health technology company.',
    description_zh: '领先的医学影像、监测和数字健康技术公司'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    name: 'Philips Healthcare',
    name_zh: '飞利浦医疗',
    country: 'Netherlands',
    address: 'Amstelplein 2, 1096 BC Amsterdam, Netherlands',
    website: 'https://www.philips.com/healthcare',
    business_type: 'Manufacturer',
    description: 'Global health technology company, focusing on diagnostic imaging and patient monitoring.',
    description_zh: '全球健康科技公司，专注于诊断影像和患者监护'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    name: 'Baxter International',
    name_zh: '百特医疗',
    country: 'USA',
    address: 'One Baxter Parkway, Deerfield, IL 60015, USA',
    website: 'https://www.baxter.com',
    business_type: 'Manufacturer',
    description: 'Global diversified healthcare company, focusing on hospital products and renal care.',
    description_zh: '全球多元化医疗保健公司，专注于医院产品和肾脏护理'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440018',
    name: 'Fresenius Medical Care',
    name_zh: '费森尤斯医疗',
    country: 'Germany',
    address: 'Else-Kröner-Straße 1, 61352 Bad Homburg, Germany',
    website: 'https://www.freseniusmedicalcare.com',
    business_type: 'Manufacturer',
    description: 'World\'s largest integrated dialysis products and services provider.',
    description_zh: '全球最大的综合性透析产品和服务提供商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440019',
    name: 'Zimmer Biomet',
    name_zh: '捷迈邦美',
    country: 'USA',
    address: '345 E. Main Street, Warsaw, IN 46580, USA',
    website: 'https://www.zimmerbiomet.com',
    business_type: 'Manufacturer',
    description: 'Global leader in musculoskeletal healthcare, focusing on joint replacement and dental reconstruction.',
    description_zh: '全球肌肉骨骼保健领导者，专注于关节置换和牙科重建'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    name: 'Smith & Nephew',
    name_zh: '施乐辉',
    country: 'UK',
    address: 'Building 5, Croxley Park, Hatters Lane, Watford WD18 8YE, UK',
    website: 'https://www.smith-nephew.com',
    business_type: 'Manufacturer',
    description: 'Global medical technology company, focusing on orthopedics, sports medicine, and wound care.',
    description_zh: '全球医疗技术公司，专注于骨科、运动医学和伤口护理'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    name: 'Drägerwerk AG',
    name_zh: '德尔格',
    country: 'Germany',
    address: 'Moislinger Allee 53-55, 23558 Lübeck, Germany',
    website: 'https://www.draeger.com',
    business_type: 'Manufacturer',
    description: 'German medical and safety technology company, products include anesthesia equipment, ventilators, etc.',
    description_zh: '德国医疗和安全技术公司，产品包括麻醉设备、呼吸机等'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022',
    name: 'Edwards Lifesciences',
    name_zh: '爱德华生命科学',
    country: 'USA',
    address: 'One Edwards Way, Irvine, CA 92614, USA',
    website: 'https://www.edwards.com',
    business_type: 'Manufacturer',
    description: 'Global leader in patient-focused medical innovations for structural heart disease and critical care monitoring.',
    description_zh: '专注于结构性心脏病和重症监护监测的患者导向医疗创新全球领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440023',
    name: 'Intuitive Surgical',
    name_zh: '直觉外科',
    country: 'USA',
    address: '1020 Kifer Road, Sunnyvale, CA 94086, USA',
    website: 'https://www.intuitive.com',
    business_type: 'Manufacturer',
    description: 'Global leader in minimally invasive care and robotic-assisted surgery.',
    description_zh: '微创护理和机器人辅助手术领域的全球领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440024',
    name: 'B. Braun Melsungen',
    name_zh: '贝朗医疗',
    country: 'Germany',
    address: 'Carl-Braun-Straße 1, 34212 Melsungen, Germany',
    website: 'https://www.bbraun.com',
    business_type: 'Manufacturer',
    description: 'German family-owned medical device company, one of the world\'s leading medical device manufacturers.',
    description_zh: '德国家族拥有的医疗器械公司，世界领先的医疗器械制造商之一'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440025',
    name: 'Fujifilm Healthcare',
    name_zh: '富士医疗',
    country: 'Japan',
    address: '19-10, Nishi-Azabu 2-chome, Minato-ku, Tokyo 106-8620, Japan',
    website: 'https://healthcare.fujifilm.com',
    business_type: 'Manufacturer',
    description: 'Japanese medical imaging and informatics solutions provider.',
    description_zh: '日本医学影像和信息化解决方案提供商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440026',
    name: 'Canon Medical Systems',
    name_zh: '佳能医疗',
    country: 'Japan',
    address: '1385 Shimoishigami, Otawara, Tochigi 324-8550, Japan',
    website: 'https://global.medical.canon',
    business_type: 'Manufacturer',
    description: 'Japanese medical imaging equipment manufacturer, formerly Toshiba Medical.',
    description_zh: '日本医学影像设备制造商，前身为东芝医疗'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440027',
    name: 'Hitachi Healthcare',
    name_zh: '日立医疗',
    country: 'Japan',
    address: '2-1, Shintoyofuta, Kashiwa, Chiba 277-0804, Japan',
    website: 'https://www.hitachi.com/healthcare',
    business_type: 'Manufacturer',
    description: 'Japanese medical imaging and analysis systems manufacturer.',
    description_zh: '日本医学影像和分析系统制造商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440028',
    name: 'Shimadzu Corporation',
    name_zh: '岛津制作所',
    country: 'Japan',
    address: '1, Nishinokyo-Kuwabara-cho, Nakagyo-ku, Kyoto 604-8511, Japan',
    website: 'https://www.shimadzu.com',
    business_type: 'Manufacturer',
    description: 'Japanese precision instruments manufacturer, medical products include X-ray, CT, ultrasound, etc.',
    description_zh: '日本精密仪器制造商，医疗产品包括X光、CT、超声等'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440029',
    name: 'Hologic',
    name_zh: '豪洛捷',
    country: 'USA',
    address: '250 Campus Drive, Marlborough, MA 01752, USA',
    website: 'https://www.hologic.com',
    business_type: 'Manufacturer',
    description: 'Global leader in women\'s health, focusing on breast health, cervical health, and skeletal health.',
    description_zh: '全球女性健康领导者，专注于乳腺健康、宫颈健康和骨骼健康'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    name: 'ResMed',
    name_zh: '瑞思迈',
    country: 'Australia',
    address: '1 Elizabeth Macarthur Drive, Bella Vista, NSW 2153, Australia',
    website: 'https://www.resmed.com',
    business_type: 'Manufacturer',
    description: 'Global leader in sleep apnea and respiratory care medical devices.',
    description_zh: '全球睡眠呼吸暂停和呼吸护理医疗设备领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    name: 'Varian Medical Systems',
    name_zh: '瓦里安医疗',
    country: 'USA',
    address: '3100 Hansen Way, Palo Alto, CA 94304, USA',
    website: 'https://www.varian.com',
    business_type: 'Manufacturer',
    description: 'Global leader in cancer care, focusing on radiotherapy and proton therapy.',
    description_zh: '全球癌症护理领导者，专注于放射治疗和质子治疗'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    name: 'Masimo',
    name_zh: '迈心诺',
    country: 'USA',
    address: '52 Discovery, Irvine, CA 92618, USA',
    website: 'https://www.masimo.com',
    business_type: 'Manufacturer',
    description: 'Global leader in non-invasive monitoring technology.',
    description_zh: '全球无创监测技术领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033',
    name: 'Welch Allyn',
    name_zh: '伟伦',
    country: 'USA',
    address: '4341 State Street Road, Skaneateles Falls, NY 13153, USA',
    website: 'https://www.welchallyn.com',
    business_type: 'Manufacturer',
    description: 'Leading medical diagnostic equipment manufacturer, focusing on primary care and specialty diagnostic equipment.',
    description_zh: '领先的医疗诊断设备制造商，专注于初级保健和专科诊断设备'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440034',
    name: 'Hillrom',
    name_zh: '希尔罗姆',
    country: 'USA',
    address: '130 E. Randolph Street, Suite 1000, Chicago, IL 60601, USA',
    website: 'https://www.hillrom.com',
    business_type: 'Manufacturer',
    description: 'Global medical technology company, focusing on hospital beds, patient monitoring, and surgical solutions.',
    description_zh: '全球医疗技术公司，专注于医院病床、患者监护和外科解决方案'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440035',
    name: 'Invacare Corporation',
    name_zh: '英维康',
    country: 'USA',
    address: '1 Invacare Way, Elyria, OH 44035, USA',
    website: 'https://www.invacare.com',
    business_type: 'Manufacturer',
    description: 'Global leader in home and long-term care medical products.',
    description_zh: '全球家庭和长期护理医疗产品领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440036',
    name: 'Ottobock',
    name_zh: '奥托博克',
    country: 'Germany',
    address: 'Max-Näder-Straße 15, 37115 Duderstadt, Germany',
    website: 'https://www.ottobock.com',
    business_type: 'Manufacturer',
    description: 'World leader in prosthetics and orthotics.',
    description_zh: '全球假肢和矫形器领域的世界领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440037',
    name: 'Sonova',
    name_zh: '索诺瓦',
    country: 'Switzerland',
    address: 'Laubisrütistrasse 28, 8712 Stäfa, Switzerland',
    website: 'https://www.sonova.com',
    business_type: 'Manufacturer',
    description: 'Global leading hearing care solution provider, brands include Phonak, Unitron, etc.',
    description_zh: '全球领先的听力保健解决方案提供商，品牌包括峰力、优利康等'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440038',
    name: 'Demant',
    name_zh: '戴蒙特',
    country: 'Denmark',
    address: 'Kongebakken 9, 2765 Smørum, Denmark',
    website: 'https://www.demant.com',
    business_type: 'Manufacturer',
    description: 'World-leading hearing healthcare group, brands include Oticon, Bernafon, etc.',
    description_zh: '世界领先的听力保健集团，品牌包括奥迪康、博瑞峰等'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440039',
    name: 'Cochlear',
    name_zh: '科利耳',
    country: 'Australia',
    address: '1 University Avenue, Macquarie University, NSW 2109, Australia',
    website: 'https://www.cochlear.com',
    business_type: 'Manufacturer',
    description: 'Global leader in implantable hearing solutions.',
    description_zh: '全球植入式听力解决方案领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440040',
    name: 'BioMerieux',
    name_zh: '生物梅里埃',
    country: 'France',
    address: 'Chemin de l\'Orme, 69280 Marcy-l\'Étoile, France',
    website: 'https://www.biomerieux.com',
    business_type: 'Manufacturer',
    description: 'Global leader in in vitro diagnostics, focusing on infectious diseases.',
    description_zh: '全球体外诊断领域领导者，专注于传染病诊断'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440041',
    name: 'Sysmex Corporation',
    name_zh: '希森美康',
    country: 'Japan',
    address: '1-5-1 Wakinohama-Kaigandori, Chuo-ku, Kobe 651-0073, Japan',
    website: 'https://www.sysmex.com',
    business_type: 'Manufacturer',
    description: 'Japanese in vitro diagnostics manufacturer, global leader in hematology analyzers.',
    description_zh: '日本体外诊断制造商，血液分析仪全球领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440042',
    name: 'Danaher Corporation',
    name_zh: '丹纳赫',
    country: 'USA',
    address: '2200 Pennsylvania Avenue NW, Suite 800W, Washington, DC 20037, USA',
    website: 'https://www.danaher.com',
    business_type: 'Manufacturer',
    description: 'Global science and technology innovator, life sciences and diagnostics business includes Beckman Coulter, Cepheid, etc.',
    description_zh: '全球科技创新者，生命科学和诊断业务包括贝克曼库尔特、赛沛等'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440043',
    name: 'Thermo Fisher Scientific',
    name_zh: '赛默飞世尔',
    country: 'USA',
    address: '168 Third Avenue, Waltham, MA 02451, USA',
    website: 'https://www.thermofisher.com',
    business_type: 'Manufacturer',
    description: 'World-leading science service company, providing analytical instruments and laboratory equipment.',
    description_zh: '世界领先的科学服务公司，提供分析仪器和实验室设备'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440044',
    name: 'PerkinElmer',
    name_zh: '珀金埃尔默',
    country: 'USA',
    address: '940 Winter Street, Waltham, MA 02451, USA',
    website: 'https://www.perkinelmer.com',
    business_type: 'Manufacturer',
    description: 'Global leader in analytical instruments and life science research.',
    description_zh: '全球分析仪器和生命科学研究领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440045',
    name: 'Waters Corporation',
    name_zh: '沃特世',
    country: 'USA',
    address: '34 Maple Street, Milford, MA 01757, USA',
    website: 'https://www.waters.com',
    business_type: 'Manufacturer',
    description: 'Global leader in analytical laboratory technologies, focusing on chromatography and mass spectrometry.',
    description_zh: '全球分析实验室技术领导者，专注于色谱和质谱'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440046',
    name: 'Agilent Technologies',
    name_zh: '安捷伦科技',
    country: 'USA',
    address: '5301 Stevens Creek Boulevard, Santa Clara, CA 95051, USA',
    website: 'https://www.agilent.com',
    business_type: 'Manufacturer',
    description: 'Global leader in life sciences, diagnostics, and applied chemical markets.',
    description_zh: '全球生命科学、诊断和应用化学市场领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440047',
    name: 'Illumina',
    name_zh: '因美纳',
    country: 'USA',
    address: '5200 Illumina Way, San Diego, CA 92122, USA',
    website: 'https://www.illumina.com',
    business_type: 'Manufacturer',
    description: 'Global leader in DNA sequencing and array-based technologies.',
    description_zh: '全球DNA测序和芯片技术领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440048',
    name: 'Qiagen',
    name_zh: '凯杰',
    country: 'Netherlands',
    address: 'Hulsterweg 82, 5912 PL Venlo, Netherlands',
    website: 'https://www.qiagen.com',
    business_type: 'Manufacturer',
    description: 'Global leader in sample and assay technologies for molecular diagnostics.',
    description_zh: '全球分子诊断样本和检测技术领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440049',
    name: 'Bio-Rad Laboratories',
    name_zh: '伯乐生命医学',
    country: 'USA',
    address: '1000 Alfred Nobel Drive, Hercules, CA 94547, USA',
    website: 'https://www.bio-rad.com',
    business_type: 'Manufacturer',
    description: 'Global leader in life science research and clinical diagnostic products.',
    description_zh: '全球生命科学研究和临床诊断产品领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440050',
    name: 'Werfen',
    name_zh: '沃芬',
    country: 'Spain',
    address: 'Can Sant Joan, s/n, 08174 Sant Cugat del Vallès, Barcelona, Spain',
    website: 'https://www.werfen.com',
    business_type: 'Manufacturer',
    description: 'Global leader in in vitro diagnostics, focusing hemostasis, acute care, and autoimmunity.',
    description_zh: '全球体外诊断领导者，专注于止血、急症护理和自身免疫'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440051',
    name: 'Nihon Kohden',
    name_zh: '日本光电',
    country: 'Japan',
    address: '1-31-4 Nishiochiai, Shinjuku-ku, Tokyo 161-8560, Japan',
    website: 'https://www.nihonkohden.com',
    business_type: 'Manufacturer',
    description: 'Japanese medical electronic equipment manufacturer, products include patient monitors, EEG, etc.',
    description_zh: '日本医疗电子设备制造商，产品包括病人监护仪、脑电图等'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440052',
    name: 'Fukuda Denshi',
    name_zh: '福田电子',
    country: 'Japan',
    address: '39-4, Hongo 3-chome, Bunkyo-ku, Tokyo 113-0033, Japan',
    website: 'https://www.fukuda.co.jp',
    business_type: 'Manufacturer',
    description: 'Japanese medical electronic equipment manufacturer, focusing on cardiovascular and patient monitoring equipment.',
    description_zh: '日本医疗电子设备制造商，专注于心血管和病人监护设备'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440053',
    name: 'Arjo',
    name_zh: '安究',
    country: 'Sweden',
    address: 'Hans Michelsensgatan 10, 211 20 Malmö, Sweden',
    website: 'https://www.arjo.com',
    business_type: 'Manufacturer',
    description: 'Global provider of medical devices and solutions, focusing on patient handling and wound care.',
    description_zh: '全球医疗设备和解决方案提供商，专注于病人搬运和伤口护理'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440054',
    name: 'Linet',
    name_zh: '林奈特',
    country: 'Czech Republic',
    address: 'Želechovice 1, 277 11 Želechovice, Czech Republic',
    website: 'https://www.linet.com',
    business_type: 'Manufacturer',
    description: 'European leader in hospital beds and patient care equipment.',
    description_zh: '欧洲医院病床和病人护理设备领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline Industries',
    name_zh: ' Medline',
    country: 'USA',
    address: 'Three Lakes Drive, Northfield, IL 60093, USA',
    website: 'https://www.medline.com',
    business_type: 'Manufacturer',
    description: 'America\'s largest privately-held medical supply manufacturer and distributor.',
    description_zh: '美国最大的私营医疗用品制造商和分销商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440056',
    name: 'Owens & Minor',
    name_zh: '欧文斯&迈纳',
    country: 'USA',
    address: '9120 Lockwood Boulevard, Mechanicsville, VA 23116, USA',
    website: 'https://www.owens-minor.com',
    business_type: 'Distributor',
    description: 'Global healthcare logistics and supply chain solutions company.',
    description_zh: '全球医疗保健物流和供应链解决方案公司'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440057',
    name: 'McKesson Corporation',
    name_zh: '麦克森',
    country: 'USA',
    address: '6555 State Highway 161, Irving, TX 75039, USA',
    website: 'https://www.mckesson.com',
    business_type: 'Distributor',
    description: 'Global leader in healthcare supply chain management and healthcare technology.',
    description_zh: '全球医疗保健供应链管理和医疗保健技术领导者'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440058',
    name: 'Henry Schein',
    name_zh: '汉瑞祥',
    country: 'USA',
    address: '135 Duryea Road, Melville, NY 11747, USA',
    website: 'https://www.henryschein.com',
    business_type: 'Distributor',
    description: 'World\'s largest provider of healthcare products and services to office-based practitioners.',
    description_zh: '全球最大的面向诊所医生的医疗保健产品和服务提供商'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440059',
    name: 'Convatec',
    name_zh: '康维德',
    country: 'UK',
    address: '3 Forbury Place, 23 Forbury Road, Reading RG1 3JH, UK',
    website: 'https://www.convatec.com',
    business_type: 'Manufacturer',
    description: 'Global medical products and technologies company, focusing on advanced wound care and ostomy care.',
    description_zh: '全球医疗产品和技术公司，专注于先进伤口护理和造口护理'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440060',
    name: 'Coloplast',
    name_zh: '康乐保',
    country: 'Denmark',
    address: 'Holtedam 1, 3050 Humlebæk, Denmark',
    website: 'https://www.coloplast.com',
    business_type: 'Manufacturer',
    description: 'Danish medical device company, focusing on intimate healthcare products.',
    description_zh: '丹麦医疗器械公司，专注于私密医疗保健产品'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440061',
    name: 'Ambu',
    name_zh: '安保',
    country: 'Denmark',
    address: 'Baltorpbakken 13, 2750 Ballerup, Denmark',
    website: 'https://www.ambu.com',
    business_type: 'Manufacturer',
    description: 'Danish medical device company, global leader in single-use endoscopes and anesthesia products.',
    description_zh: '丹麦医疗器械公司，一次性内窥镜和麻醉产品全球领导者'
  }
];

// 基础产品数据（原始12个产品）
const baseProducts = [
  {
    id: '660e8400-e29b-41d4-a716-446655440000',
    company_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Azure™ MRI Pacemaker',
    name_zh: 'Azure™ MRI起搏器',
    category: 'Cardiac Rhythm Management',
    category_zh: '心脏节律管理',
    description: 'MRI compatible pacemaker with automaticity and wireless monitoring capabilities.',
    description_zh: '兼容MRI的起搏器，具有自动调节和无线监测功能',
    model_number: 'Azure S DR/VR',
    fda_number: 'P170045',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223120001',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440001',
    company_id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Micra™ AV Transcatheter Pacing System',
    name_zh: 'Micra™ AV经导管起搏系统',
    category: 'Cardiac Rhythm Management',
    category_zh: '心脏节律管理',
    description: 'World\'s smallest pacemaker, delivered via catheter without chest incision.',
    description_zh: '世界最小的起搏器，通过导管输送，无需胸部切口',
    model_number: 'MC1AVR1',
    fda_number: 'P190033',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223120002',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440002',
    company_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'ETHICON™ Sutures',
    name_zh: 'ETHICON™缝合线',
    category: 'Surgical Supplies',
    category_zh: '外科耗材',
    description: 'High-quality surgical sutures including absorbable and non-absorbable types.',
    description_zh: '高品质外科缝合线，包括可吸收和不可吸收类型',
    model_number: 'Various',
    fda_number: 'K123456',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223020003',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440003',
    company_id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'MAGNETOM Free.Max',
    name_zh: 'MAGNETOM Free.Max磁共振',
    category: 'Medical Imaging',
    category_zh: '医学影像',
    description: 'World\'s first 80cm bore MRI with DryCool technology, reducing helium consumption.',
    description_zh: '世界首款80厘米孔径MRI，采用DryCool技术，减少氦气消耗',
    model_number: 'MAGNETOM Free.Max',
    fda_number: 'K203028',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223060004',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440004',
    company_id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'BeneVision N1',
    name_zh: 'BeneVision N1病人监护仪',
    category: 'Patient Monitoring',
    category_zh: '病人监护',
    description: 'Portable patient monitor for continuous monitoring during transport.',
    description_zh: '便携式病人监护仪，用于转运期间的持续监护',
    model_number: 'BeneVision N1',
    fda_number: 'K181234',
    ce_number: 'CE 0123',
    nmpa_number: '粤械注准20182070005',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440005',
    company_id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'cobas e 801',
    name_zh: 'cobas e 801免疫分析模块',
    category: 'In Vitro Diagnostics',
    category_zh: '体外诊断',
    description: 'High-throughput immunoassay module for clinical chemistry analysis.',
    description_zh: '高通量免疫分析模块，用于临床化学分析',
    model_number: 'cobas e 801',
    fda_number: 'K191234',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223400006',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440006',
    company_id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Ultimaster™ Tansei',
    name_zh: 'Ultimaster™ Tansei药物洗脱支架',
    category: 'Interventional Cardiology',
    category_zh: '介入心脏病学',
    description: 'Drug-eluting stent with bioresorbable polymer coating.',
    description_zh: '带有生物可吸收聚合物涂层的药物洗脱支架',
    model_number: 'ULT-XXX',
    fda_number: 'P170012',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223130007',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440007',
    company_id: '550e8400-e29b-41d4-a716-446655440006',
    name: 'EVIS X1 Endoscopy System',
    name_zh: 'EVIS X1内窥镜系统',
    category: 'Endoscopy',
    category_zh: '内窥镜',
    description: 'Advanced endoscopy system with extended depth of field and red dichromatic imaging.',
    description_zh: '先进的内窥镜系统，具有扩展景深和红光双色成像功能',
    model_number: 'CV-1500',
    fda_number: 'K201234',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222060008',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440008',
    company_id: '550e8400-e29b-41d4-a716-446655440007',
    name: 'Mako SmartRobotics™',
    name_zh: 'Mako智能机器人手术系统',
    category: 'Surgical Robotics',
    category_zh: '手术机器人',
    description: 'Robotic-arm assisted surgery system for knee and hip replacement.',
    description_zh: '机械臂辅助手术系统，用于膝关节和髋关节置换',
    model_number: 'Mako System',
    fda_number: 'K161234',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223010009',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440009',
    company_id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'FreeStyle Libre',
    name_zh: 'FreeStyle Libre瞬感动态血糖监测系统',
    category: 'Diabetes Care',
    category_zh: '糖尿病护理',
    description: 'Continuous glucose monitoring system without finger prick calibration.',
    description_zh: '无需指尖采血校准的连续血糖监测系统',
    model_number: 'FreeStyle Libre 2',
    fda_number: 'K163444',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222070010',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440010',
    company_id: '550e8400-e29b-41d4-a716-446655440009',
    name: 'WATCHMAN FLX',
    name_zh: 'WATCHMAN FLX左心耳封堵器',
    category: 'Structural Heart',
    category_zh: '结构性心脏病',
    description: 'Left atrial appendage closure device to reduce stroke risk in AF patients.',
    description_zh: '左心耳封堵器，用于降低房颤患者的中风风险',
    model_number: 'WATCHMAN FLX',
    fda_number: 'P200013',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223130011',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440011',
    company_id: '550e8400-e29b-41d4-a716-446655440010',
    name: 'F&P Humidified High Flow Therapy',
    name_zh: 'F&P湿化高流量呼吸治疗系统',
    category: 'Respiratory Care',
    category_zh: '呼吸护理',
    description: 'Humidified high flow nasal cannula system for respiratory support.',
    description_zh: '湿化高流量鼻导管系统，用于呼吸支持',
    model_number: 'PT101AZ',
    fda_number: 'K181234',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20232080012',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440012',
    company_id: '550e8400-e29b-41d4-a716-446655440011',
    name: 'Getinge Maquet Servo-air',
    name_zh: 'Getinge Maquet Servo-air呼吸机',
    category: 'Respiratory Care',
    category_zh: '呼吸护理',
    description: 'Mechanical ventilator for adult and pediatric patients.',
    description_zh: '成人和儿童患者使用的机械呼吸机',
    model_number: 'Servo-air',
    fda_number: 'K201234',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20232080013',
    status: 'active'
  }
];

// 扩展产品数据（80个产品）
const extendedProducts = [
  // 口罩类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440013',
    company_id: '550e8400-e29b-41d4-a716-446655440012',
    name: '3M N95 Respirator 8210',
    name_zh: '3M N95防护口罩 8210',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'N95 particulate respirator for solid and liquid aerosols.',
    description_zh: '用于固体和液体气溶胶的N95颗粒物防护口罩',
    model_number: '8210',
    fda_number: 'K123456',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20202140014',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440014',
    company_id: '550e8400-e29b-41d4-a716-446655440012',
    name: '3M Surgical Mask 1826',
    name_zh: '3M医用外科口罩 1826',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'High fluid resistant surgical mask with comfortable design.',
    description_zh: '高抗流体医用外科口罩，设计舒适',
    model_number: '1826',
    fda_number: 'K654321',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20202140015',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440015',
    company_id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline Procedure Mask',
    name_zh: 'Medline医用口罩',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'Standard procedure mask for general medical use.',
    description_zh: '标准医用口罩，用于一般医疗用途',
    model_number: 'NON27122',
    fda_number: 'K987654',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20202140016',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440016',
    company_id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline N95 Flat-Fold Respirator',
    name_zh: 'Medline N95折叠式防护口罩',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'Flat-fold N95 respirator for easy storage and portability.',
    description_zh: '折叠式N95防护口罩，便于储存和携带',
    model_number: 'NON27501',
    fda_number: 'K135792',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20202140017',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440017',
    company_id: '550e8400-e29b-41d4-a716-446655440024',
    name: 'B. Braun Surgical Face Mask',
    name_zh: '贝朗医用外科口罩',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'Type IIR surgical mask with high bacterial filtration efficiency.',
    description_zh: 'IIR型外科口罩，具有高细菌过滤效率',
    model_number: 'SB-001',
    fda_number: 'K246813',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20202140018',
    status: 'active'
  },
  
  // 注射器类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440018',
    company_id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'BD Syringe 10mL',
    name_zh: 'BD注射器 10毫升',
    category: 'Injection Devices',
    category_zh: '注射器械',
    description: 'Sterile disposable syringe for general medical use.',
    description_zh: '无菌一次性注射器，用于一般医疗用途',
    model_number: '302995',
    fda_number: 'K123789',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223140019',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440019',
    company_id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'BD Insulin Syringe 1mL',
    name_zh: 'BD胰岛素注射器 1毫升',
    category: 'Injection Devices',
    category_zh: '注射器械',
    description: 'Ultra-fine needle insulin syringe for diabetes management.',
    description_zh: '超细针头胰岛素注射器，用于糖尿病管理',
    model_number: '328438',
    fda_number: 'K456123',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223140020',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440020',
    company_id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'BD Safety-Lok Syringe',
    name_zh: 'BD安全锁定注射器',
    category: 'Injection Devices',
    category_zh: '注射器械',
    description: 'Safety syringe with needle shielding mechanism.',
    description_zh: '带有针头保护机制的安全注射器',
    model_number: '309595',
    fda_number: 'K789456',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223140021',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440021',
    company_id: '550e8400-e29b-41d4-a716-446655440024',
    name: 'B. Braun Omnifix Syringe',
    name_zh: '贝朗Omnifix注射器',
    category: 'Injection Devices',
    category_zh: '注射器械',
    description: 'Luer lock syringe with clear barrel for precise dosing.',
    description_zh: '带清晰筒身的鲁尔锁注射器，用于精确剂量',
    model_number: '9161406V',
    fda_number: 'K321654',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223140022',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440022',
    company_id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline Syringe 5mL',
    name_zh: 'Medline注射器 5毫升',
    category: 'Injection Devices',
    category_zh: '注射器械',
    description: 'General purpose syringe with smooth plunger movement.',
    description_zh: '通用注射器，柱塞滑动顺畅',
    model_number: 'DYND70625',
    fda_number: 'K654987',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20223140023',
    status: 'active'
  },
  
  // 手套类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440023',
    company_id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'BD Latex Exam Gloves',
    name_zh: 'BD乳胶检查手套',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'Powder-free latex examination gloves.',
    description_zh: '无粉乳胶检查手套',
    model_number: '4011',
    fda_number: 'K111222',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20222140024',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440024',
    company_id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline Nitrile Exam Gloves',
    name_zh: 'Medline丁腈检查手套',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'Chemical resistant nitrile examination gloves.',
    description_zh: '耐化学腐蚀的丁腈检查手套',
    model_number: 'MDS192078',
    fda_number: 'K333444',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20222140025',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440025',
    company_id: '550e8400-e29b-41d4-a716-446655440012',
    name: '3M Nitrile Gloves',
    name_zh: '3M丁腈手套',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'Industrial grade nitrile gloves for medical use.',
    description_zh: '工业级丁腈手套，可用于医疗',
    model_number: 'Gloves-3M-001',
    fda_number: 'K555666',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20222140026',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440026',
    company_id: '550e8400-e29b-41d4-a716-446655440024',
    name: 'B. Braun Surgical Gloves',
    name_zh: '贝朗外科手套',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'Sterile surgical gloves with textured surface.',
    description_zh: '带纹理表面的无菌外科手套',
    model_number: '5211531',
    fda_number: 'K777888',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222140027',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440027',
    company_id: '550e8400-e29b-41d4-a716-446655440058',
    name: 'Henry Schein Latex Gloves',
    name_zh: '汉瑞祥乳胶手套',
    category: 'Personal Protective Equipment',
    category_zh: '个人防护设备',
    description: 'High quality latex examination gloves.',
    description_zh: '高品质乳胶检查手套',
    model_number: '113-050',
    fda_number: 'K999000',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20222140028',
    status: 'active'
  },
  
  // 敷料类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440028',
    company_id: '550e8400-e29b-41d4-a716-446655440012',
    name: '3M Tegaderm Dressing',
    name_zh: '3M透明敷料',
    category: 'Wound Care',
    category_zh: '伤口护理',
    description: 'Transparent film dressing for wound protection.',
    description_zh: '用于伤口保护的透明薄膜敷料',
    model_number: '1626W',
    fda_number: 'K123321',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20222140029',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440029',
    company_id: '550e8400-e29b-41d4-a716-446655440012',
    name: '3M Micropore Tape',
    name_zh: '3M微孔透气胶带',
    category: 'Wound Care',
    category_zh: '伤口护理',
    description: 'Gentle paper tape for sensitive skin.',
    description_zh: '适用于敏感肌肤的温和纸质胶带',
    model_number: '1530-1',
    fda_number: 'K456654',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20222140030',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440030',
    company_id: '550e8400-e29b-41d4-a716-446655440020',
    name: 'Smith & Nephew ALLEVYN Dressing',
    name_zh: '施乐辉ALLEVYN泡沫敷料',
    category: 'Wound Care',
    category_zh: '伤口护理',
    description: 'Hydrocellular foam dressing for exuding wounds.',
    description_zh: '用于渗液伤口的水细胞泡沫敷料',
    model_number: '66020044',
    fda_number: 'K789987',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222140031',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440031',
    company_id: '550e8400-e29b-41d4-a716-446655440020',
    name: 'Smith & Nephew OPSITE Dressing',
    name_zh: '施乐辉OPSITE透明敷料',
    category: 'Wound Care',
    category_zh: '伤口护理',
    description: 'Moisture responsive transparent film dressing.',
    description_zh: '湿度响应透明薄膜敷料',
    model_number: '66000041',
    fda_number: 'K111999',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222140032',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440032',
    company_id: '550e8400-e29b-41d4-a716-446655440059',
    name: 'Convatec DuoDERM Dressing',
    name_zh: '康维德DuoDERM水胶体敷料',
    category: 'Wound Care',
    category_zh: '伤口护理',
    description: 'Hydrocolloid dressing for wound management.',
    description_zh: '用于伤口管理的水胶体敷料',
    model_number: '187660',
    fda_number: 'K222333',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222140033',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440033',
    company_id: '550e8400-e29b-41d4-a716-446655440059',
    name: 'Convatec AQUACEL Dressing',
    name_zh: '康维德AQUACEL银离子敷料',
    category: 'Wound Care',
    category_zh: '伤口护理',
    description: 'Antimicrobial silver dressing for infected wounds.',
    description_zh: '用于感染伤口的抗菌银离子敷料',
    model_number: '420672',
    fda_number: 'K444555',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222140034',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440034',
    company_id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline Gauze Sponges',
    name_zh: 'Medline纱布海绵',
    category: 'Wound Care',
    category_zh: '伤口护理',
    description: 'Sterile gauze sponges for wound care.',
    description_zh: '用于伤口护理的无菌纱布海绵',
    model_number: 'NON21424',
    fda_number: 'K666777',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20222140035',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440035',
    company_id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline Elastic Bandage',
    name_zh: 'Medline弹性绷带',
    category: 'Wound Care',
    category_zh: '伤口护理',
    description: 'Self-closure elastic bandage for compression therapy.',
    description_zh: '用于压力治疗的自粘弹性绷带',
    model_number: 'MDS046002',
    fda_number: 'K888999',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20222140036',
    status: 'active'
  },
  
  // 导管类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440036',
    company_id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'BD Foley Catheter',
    name_zh: 'BD导尿管',
    category: 'Urology',
    category_zh: '泌尿科',
    description: 'Silicone elastomer coated latex Foley catheter.',
    description_zh: '硅胶弹性体涂层乳胶导尿管',
    model_number: '123420A',
    fda_number: 'K135246',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223140037',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440037',
    company_id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'BD IV Catheter',
    name_zh: 'BD静脉留置针',
    category: 'Vascular Access',
    category_zh: '血管通路',
    description: 'Insyte Autoguard shielded IV catheter with blood control.',
    description_zh: '带血液控制的Insyte Autoguard保护式静脉留置针',
    model_number: '381444',
    fda_number: 'K468135',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223140038',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440038',
    company_id: '550e8400-e29b-41d4-a716-446655440024',
    name: 'B. Braun Introcan Catheter',
    name_zh: '贝朗Introcan静脉留置针',
    category: 'Vascular Access',
    category_zh: '血管通路',
    description: 'Safety IV catheter with passive needle shield.',
    description_zh: '带被动针头保护的静脉留置针',
    model_number: '4251400-02',
    fda_number: 'K791468',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223140039',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440039',
    company_id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline Foley Catheter',
    name_zh: 'Medline导尿管',
    category: 'Urology',
    category_zh: '泌尿科',
    description: '2-way silicone coated latex Foley catheter.',
    description_zh: '双腔硅胶涂层乳胶导尿管',
    model_number: 'DYND11214',
    fda_number: 'K024681',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20223140040',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440040',
    company_id: '550e8400-e29b-41d4-a716-446655440017',
    name: 'Baxter Clearlink Catheter',
    name_zh: '百特Clearlink导管',
    category: 'Vascular Access',
    category_zh: '血管通路',
    description: 'Hemodialysis catheter with clear extension tubing.',
    description_zh: '带透明延长管的血液透析导管',
    model_number: '2C2436',
    fda_number: 'K357924',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223140041',
    status: 'active'
  },
  
  // 手术器械类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440041',
    company_id: '550e8400-e29b-41d4-a716-446655440023',
    name: 'Intuitive Surgical da Vinci Instrument',
    name_zh: '直觉外科达芬奇手术器械',
    category: 'Surgical Instruments',
    category_zh: '手术器械',
    description: 'Robotic surgical instruments for da Vinci surgical system.',
    description_zh: '达芬奇手术系统的机器人手术器械',
    model_number: '470001',
    fda_number: 'K681357',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223010042',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440042',
    company_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Ethicon Harmonic Scalpel',
    name_zh: '爱惜康超声刀',
    category: 'Surgical Instruments',
    category_zh: '手术器械',
    description: 'Ultrasonic surgical scalpel for cutting and coagulation.',
    description_zh: '用于切割和凝血的超声手术刀',
    model_number: 'HAR36',
    fda_number: 'K914682',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223010043',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440043',
    company_id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Ethicon Ligaclip',
    name_zh: '爱惜康钛夹',
    category: 'Surgical Instruments',
    category_zh: '手术器械',
    description: 'Surgical clips for vessel ligation.',
    description_zh: '用于血管结扎的手术夹',
    model_number: 'LT400',
    fda_number: 'K246913',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20223010044',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440044',
    company_id: '550e8400-e29b-41d4-a716-446655440024',
    name: 'B. Braun Aesculap Scalpel',
    name_zh: '贝朗蛇牌手术刀',
    category: 'Surgical Instruments',
    category_zh: '手术器械',
    description: 'Disposable surgical scalpel with stainless steel blade.',
    description_zh: '带不锈钢刀片的一次性手术刀',
    model_number: 'BB511',
    fda_number: 'K579246',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223010045',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440045',
    company_id: '550e8400-e29b-41d4-a716-446655440055',
    name: 'Medline Surgical Scissors',
    name_zh: 'Medline手术剪刀',
    category: 'Surgical Instruments',
    category_zh: '手术器械',
    description: 'Stainless steel surgical scissors for operating room use.',
    description_zh: '手术室使用的不锈钢手术剪刀',
    model_number: 'MDS10480',
    fda_number: 'K802467',
    ce_number: 'CE 2797',
    nmpa_number: '国械注进20223010046',
    status: 'active'
  },
  
  // 监护仪类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440046',
    company_id: '550e8400-e29b-41d4-a716-446655440016',
    name: 'Philips IntelliVue Monitor',
    name_zh: '飞利浦IntelliVue监护仪',
    category: 'Patient Monitoring',
    category_zh: '病人监护',
    description: 'Advanced patient monitoring system with multi-parameter display.',
    description_zh: '带多参数显示的高级病人监护系统',
    model_number: 'MX800',
    fda_number: 'K135792',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222070047',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440047',
    company_id: '550e8400-e29b-41d4-a716-446655440015',
    name: 'GE Healthcare CARESCAPE Monitor',
    name_zh: 'GE Healthcare CARESCAPE监护仪',
    category: 'Patient Monitoring',
    category_zh: '病人监护',
    description: 'Modular patient monitor for critical care settings.',
    description_zh: '用于重症监护的模块化病人监护仪',
    model_number: 'B650',
    fda_number: 'K468135',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222070048',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440048',
    company_id: '550e8400-e29b-41d4-a716-446655440051',
    name: 'Nihon Kohden Bedside Monitor',
    name_zh: '日本光电床旁监护仪',
    category: 'Patient Monitoring',
    category_zh: '病人监护',
    description: 'Compact bedside monitor with essential parameters.',
    description_zh: '带基本参数的紧凑型床旁监护仪',
    model_number: 'BSM-2301K',
    fda_number: 'K791468',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222070049',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440049',
    company_id: '550e8400-e29b-41d4-a716-446655440033',
    name: 'Welch Allyn Spot Vital Signs',
    name_zh: '伟伦生命体征检测仪',
    category: 'Patient Monitoring',
    category_zh: '病人监护',
    description: 'Portable device for quick vital signs measurement.',
    description_zh: '用于快速生命体征测量的便携式设备',
    model_number: '42NTB-E1',
    fda_number: 'K024681',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222070050',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440050',
    company_id: '550e8400-e29b-41d4-a716-446655440032',
    name: 'Masimo Radical-7 Pulse Oximeter',
    name_zh: '迈心诺Radical-7脉搏血氧仪',
    category: 'Patient Monitoring',
    category_zh: '病人监护',
    description: 'Non-invasive pulse oximeter with rainbow technology.',
    description_zh: '带彩虹技术的无创脉搏血氧仪',
    model_number: 'Radical-7',
    fda_number: 'K357924',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222070051',
    status: 'active'
  },
  
  // 血糖仪类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440051',
    company_id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Abbott FreeStyle Lite',
    name_zh: '雅培FreeStyle Lite血糖仪',
    category: 'Diabetes Care',
    category_zh: '糖尿病护理',
    description: 'Blood glucose monitoring system with small sample size.',
    description_zh: '小样本量的血糖监测系统',
    model_number: '7091027',
    fda_number: 'K681357',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222070052',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440052',
    company_id: '550e8400-e29b-41d4-a716-446655440008',
    name: 'Abbott FreeStyle Precision Neo',
    name_zh: '雅培FreeStyle Precision Neo血糖仪',
    category: 'Diabetes Care',
    category_zh: '糖尿病护理',
    description: 'Blood glucose and ketone monitoring system.',
    description_zh: '血糖和血酮监测系统',
    model_number: '7091507',
    fda_number: 'K914682',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222070053',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440053',
    company_id: '550e8400-e29b-41d4-a716-446655440013',
    name: 'BD Blood Glucose Monitor',
    name_zh: 'BD血糖监测仪',
    category: 'Diabetes Care',
    category_zh: '糖尿病护理',
    description: 'Digital blood glucose monitoring system.',
    description_zh: '数字血糖监测系统',
    model_number: 'BD-001',
    fda_number: 'K246913',
    ce_number: 'CE 0051',
    nmpa_number: '国械注进20222070054',
    status: 'active'
  },
  
  // 轮椅类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440054',
    company_id: '550e8400-e29b-41d4-a716-446655440035',
    name: 'Invacare Manual Wheelchair',
    name_zh: '英维康手动轮椅',
    category: 'Rehabilitation',
    category_zh: '康复设备',
    description: 'Lightweight manual wheelchair for daily mobility.',
    description_zh: '用于日常移动的轻型手动轮椅',
    model_number: '9000XT',
    fda_number: 'K579246',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222190055',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440055',
    company_id: '550e8400-e29b-41d4-a716-446655440035',
    name: 'Invacare Power Wheelchair',
    name_zh: '英维康电动轮椅',
    category: 'Rehabilitation',
    category_zh: '康复设备',
    description: 'Electric wheelchair with joystick control.',
    description_zh: '带操纵杆控制的电动轮椅',
    model_number: 'TDX SP2',
    fda_number: 'K802467',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222190056',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440056',
    company_id: '550e8400-e29b-41d4-a716-446655440036',
    name: 'Ottobock Prosthetic Leg',
    name_zh: '奥托博克假肢腿',
    category: 'Rehabilitation',
    category_zh: '康复设备',
    description: 'Microprocessor-controlled prosthetic knee system.',
    description_zh: '微处理器控制的假肢膝关节系统',
    model_number: 'C-Leg 4',
    fda_number: 'K135792',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222190057',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440057',
    company_id: '550e8400-e29b-41d4-a716-446655440053',
    name: 'Arjo Patient Lift',
    name_zh: '安究病人移位机',
    category: 'Rehabilitation',
    category_zh: '康复设备',
    description: 'Hydraulic patient lift for safe patient transfer.',
    description_zh: '用于安全病人转移的液压移位机',
    model_number: 'Maxi Move',
    fda_number: 'K468135',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222190058',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440058',
    company_id: '550e8400-e29b-41d4-a716-446655440054',
    name: 'Linet Hospital Bed',
    name_zh: '林奈特医院病床',
    category: 'Rehabilitation',
    category_zh: '康复设备',
    description: 'Electric hospital bed with advanced positioning.',
    description_zh: '带高级定位功能的电动医院病床',
    model_number: 'Multicare',
    fda_number: 'K791468',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222190059',
    status: 'active'
  },
  
  // 助听器类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440059',
    company_id: '550e8400-e29b-41d4-a716-446655440037',
    name: 'Sonova Phonak Hearing Aid',
    name_zh: '索诺瓦峰力助听器',
    category: 'Audiology',
    category_zh: '听力学',
    description: 'Premium rechargeable hearing aid with Bluetooth connectivity.',
    description_zh: '带蓝牙连接的高级可充电助听器',
    model_number: 'Paradise P90',
    fda_number: 'K024681',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222190060',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440060',
    company_id: '550e8400-e29b-41d4-a716-446655440038',
    name: 'Demant Oticon Hearing Aid',
    name_zh: '戴蒙特奥迪康助听器',
    category: 'Audiology',
    category_zh: '听力学',
    description: 'AI-powered hearing aid with deep neural network.',
    description_zh: '带深度神经网络的AI助听器',
    model_number: 'More 1',
    fda_number: 'K357924',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222190061',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440061',
    company_id: '550e8400-e29b-41d4-a716-446655440039',
    name: 'Cochlear Nucleus Implant',
    name_zh: '科利耳Nucleus人工耳蜗',
    category: 'Audiology',
    category_zh: '听力学',
    description: 'Cochlear implant system for severe hearing loss.',
    description_zh: '用于重度听力损失的人工耳蜗系统',
    model_number: 'Nucleus 7',
    fda_number: 'K681357',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20222190062',
    status: 'active'
  },
  
  // 诊断设备类产品
  {
    id: '660e8400-e29b-41d4-a716-446655440062',
    company_id: '550e8400-e29b-41d4-a716-446655440040',
    name: 'BioMerieux VITEK System',
    name_zh: '生物梅里埃VITEK系统',
    category: 'Microbiology',
    category_zh: '微生物学',
    description: 'Automated microbial identification and susceptibility testing.',
    description_zh: '自动化微生物鉴定和药敏测试系统',
    model_number: 'VITEK 2',
    fda_number: 'K914682',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223400063',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440063',
    company_id: '550e8400-e29b-41d4-a716-446655440041',
    name: 'Sysmex Hematology Analyzer',
    name_zh: '希森美康血液分析仪',
    category: 'Hematology',
    category_zh: '血液学',
    description: 'Automated hematology analyzer for complete blood count.',
    description_zh: '用于全血细胞计数的自动化血液分析仪',
    model_number: 'XN-1000',
    fda_number: 'K246913',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223400064',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440064',
    company_id: '550e8400-e29b-41d4-a716-446655440043',
    name: 'Thermo Fisher Centrifuge',
    name_zh: '赛默飞世尔离心机',
    category: 'Laboratory Equipment',
    category_zh: '实验室设备',
    description: 'High-speed refrigerated centrifuge for laboratory use.',
    description_zh: '用于实验室的高速冷冻离心机',
    model_number: 'Sorvall ST 16R',
    fda_number: 'K579246',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223400065',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440065',
    company_id: '550e8400-e29b-41d4-a716-446655440047',
    name: 'Illumina Sequencing System',
    name_zh: '因美纳测序系统',
    category: 'Genomics',
    category_zh: '基因组学',
    description: 'Next-generation DNA sequencing platform.',
    description_zh: '下一代DNA测序平台',
    model_number: 'MiSeq',
    fda_number: 'K802467',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223400066',
    status: 'active'
  },
  {
    id: '660e8400-e29b-41d4-a716-446655440066',
    company_id: '550e8400-e29b-41d4-a716-446655440042',
    name: 'Danaher Beckman Coulter Analyzer',
    name_zh: '丹纳赫贝克曼库尔特分析仪',
    category: 'Clinical Chemistry',
    category_zh: '临床化学',
    description: 'Clinical chemistry analyzer for routine and specialized testing.',
    description_zh: '用于常规和特殊测试的临床化学分析仪',
    model_number: 'AU5800',
    fda_number: 'K135792',
    ce_number: 'CE 0123',
    nmpa_number: '国械注进20223400067',
    status: 'active'
  }
];

function escapeSql(value: string | null | undefined): string {
  if (value === null || value === undefined) return 'NULL';
  return "'" + value.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

function generateCompanySql(company: any): string {
  return `INSERT INTO companies (id, name, name_zh, country, address, website, business_type, description, description_zh, created_at, updated_at)
VALUES (
  ${escapeSql(company.id)},
  ${escapeSql(company.name)},
  ${escapeSql(company.name_zh)},
  ${escapeSql(company.country)},
  ${escapeSql(company.address)},
  ${escapeSql(company.website)},
  ${escapeSql(company.business_type)},
  ${escapeSql(company.description)},
  ${escapeSql(company.description_zh)},
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_zh = EXCLUDED.name_zh,
  country = EXCLUDED.country,
  address = EXCLUDED.address,
  website = EXCLUDED.website,
  business_type = EXCLUDED.business_type,
  description = EXCLUDED.description,
  description_zh = EXCLUDED.description_zh,
  updated_at = NOW();`;
}

function generateProductSql(product: any): string {
  return `INSERT INTO products (id, company_id, name, name_zh, category, category_zh, description, description_zh, model_number, fda_number, ce_number, nmpa_number, status, created_at, updated_at)
VALUES (
  ${escapeSql(product.id)},
  ${escapeSql(product.company_id)},
  ${escapeSql(product.name)},
  ${escapeSql(product.name_zh)},
  ${escapeSql(product.category)},
  ${escapeSql(product.category_zh)},
  ${escapeSql(product.description)},
  ${escapeSql(product.description_zh)},
  ${escapeSql(product.model_number)},
  ${escapeSql(product.fda_number)},
  ${escapeSql(product.ce_number)},
  ${escapeSql(product.nmpa_number)},
  ${escapeSql(product.status)},
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  company_id = EXCLUDED.company_id,
  name = EXCLUDED.name,
  name_zh = EXCLUDED.name_zh,
  category = EXCLUDED.category,
  category_zh = EXCLUDED.category_zh,
  description = EXCLUDED.description,
  description_zh = EXCLUDED.description_zh,
  model_number = EXCLUDED.model_number,
  fda_number = EXCLUDED.fda_number,
  ce_number = EXCLUDED.ce_number,
  nmpa_number = EXCLUDED.nmpa_number,
  status = EXCLUDED.status,
  updated_at = NOW();`;
}

function generateSqlFile() {
  const lines: string[] = [];
  
  lines.push('-- ============================================');
  lines.push('-- MDLooker 种子数据导入 SQL');
  lines.push('-- 生成时间: ' + new Date().toISOString());
  lines.push('-- ============================================');
  lines.push('');
  lines.push('-- 开始事务');
  lines.push('BEGIN;');
  lines.push('');
  
  // 公司数据
  lines.push('-- ============================================');
  lines.push('-- 公司数据 (62家)');
  lines.push('-- ============================================');
  lines.push('');
  
  [...baseCompanies, ...extendedCompanies].forEach((company, index) => {
    lines.push(`-- 公司 ${index + 1}: ${company.name}`);
    lines.push(generateCompanySql(company));
    lines.push('');
  });
  
  // 产品数据
  lines.push('-- ============================================');
  lines.push('-- 产品数据 (92个)');
  lines.push('-- ============================================');
  lines.push('');
  
  [...baseProducts, ...extendedProducts].forEach((product, index) => {
    lines.push(`-- 产品 ${index + 1}: ${product.name}`);
    lines.push(generateProductSql(product));
    lines.push('');
  });
  
  lines.push('-- 提交事务');
  lines.push('COMMIT;');
  lines.push('');
  lines.push('-- ============================================');
  lines.push('-- 数据导入完成！');
  lines.push('-- 公司: 62 家');
  lines.push('-- 产品: 92 个');
  lines.push('-- ============================================');
  
  return lines.join('\n');
}

// 生成 SQL 文件
const sqlContent = generateSqlFile();
const outputPath = path.join(__dirname, '..', 'database', 'seed_data.sql');

// 确保目录存在
const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// 写入文件
fs.writeFileSync(outputPath, sqlContent, 'utf-8');

console.log('✅ SQL 文件生成成功！');
console.log(`📁 文件路径: ${outputPath}`);
console.log('');
console.log('📖 使用方法:');
console.log('1. 打开 Supabase Dashboard');
console.log('2. 进入 SQL Editor');
console.log('3. 点击 "New Query"');
console.log('4. 复制 seed_data.sql 文件的内容');
console.log('5. 粘贴到 SQL Editor');
console.log('6. 点击 "Run" 执行');
console.log('');
console.log(`📊 数据概览:`);
console.log(`   - 公司: ${baseCompanies.length + extendedCompanies.length} 家`);
console.log(`   - 产品: ${baseProducts.length + extendedProducts.length} 个`);
