// Market Access Pathway Data
// 情景化准入导航数据配置

export interface AccessRequirement {
  step: number;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  documents: string[];
  documentsZh: string[];
  timeline: string;
  timelineZh: string;
  cost: string;
  costZh: string;
}

export interface MarketAccessPathway {
  targetMarket: string;
  targetMarketZh: string;
  sourceCountry: string;
  productCategory: string;
  deviceClass: string;
  requirements: AccessRequirement[];
  keyRegulations: string[];
  keyRegulationsZh: string[];
  notifiedBodies?: string[];
  localRepresentativeRequired: boolean;
  clinicalDataRequired: boolean;
}

// 产品类别定义
export const productCategories = [
  { id: 'cardiovascular', name: 'Cardiovascular', nameZh: '心血管器械' },
  { id: 'orthopedic', name: 'Orthopedic', nameZh: '骨科器械' },
  { id: 'diagnostic_imaging', name: 'Diagnostic Imaging', nameZh: '诊断影像' },
  { id: 'ivd', name: 'In Vitro Diagnostics', nameZh: '体外诊断' },
  { id: 'surgical', name: 'Surgical Instruments', nameZh: '外科器械' },
  { id: 'dental', name: 'Dental', nameZh: '牙科器械' },
  { id: 'ophthalmic', name: 'Ophthalmic', nameZh: '眼科器械' },
  { id: 'patient_monitoring', name: 'Patient Monitoring', nameZh: '患者监护' },
];

// 目标市场定义
export const targetMarkets = [
  { id: 'usa', name: 'USA', nameZh: '美国', flag: '🇺🇸' },
  { id: 'eu', name: 'EU', nameZh: '欧盟', flag: '🇪🇺' },
  { id: 'china', name: 'China', nameZh: '中国', flag: '🇨🇳' },
  { id: 'japan', name: 'Japan', nameZh: '日本', flag: '🇯🇵' },
  { id: 'canada', name: 'Canada', nameZh: '加拿大', flag: '🇨🇦' },
  { id: 'australia', name: 'Australia', nameZh: '澳大利亚', flag: '🇦🇺' },
  { id: 'brazil', name: 'Brazil', nameZh: '巴西', flag: '🇧🇷' },
  { id: 'singapore', name: 'Singapore', nameZh: '新加坡', flag: '🇸🇬' },
];

// 来源国定义
export const sourceCountries = [
  { id: 'usa', name: 'USA', nameZh: '美国' },
  { id: 'eu', name: 'EU', nameZh: '欧盟' },
  { id: 'china', name: 'China', nameZh: '中国' },
  { id: 'japan', name: 'Japan', nameZh: '日本' },
  { id: 'canada', name: 'Canada', nameZh: '加拿大' },
  { id: 'australia', name: 'Australia', nameZh: '澳大利亚' },
  { id: 'other', name: 'Other', nameZh: '其他' },
];

// 设备分类定义
export const deviceClasses = [
  { id: 'class_i', name: 'Class I', nameZh: 'I类' },
  { id: 'class_iia', name: 'Class IIa', nameZh: 'IIa类' },
  { id: 'class_iib', name: 'Class IIb', nameZh: 'IIb类' },
  { id: 'class_iii', name: 'Class III', nameZh: 'III类' },
];

// 准入路径生成函数
export function generateAccessPathway(
  productCategory: string,
  sourceCountry: string,
  targetMarket: string,
  deviceClass: string,
  locale: 'en' | 'zh' = 'en'
): MarketAccessPathway {
  // 根据目标市场返回对应的准入路径
  const pathways: Record<string, () => MarketAccessPathway> = {
    usa: () => generateUSAPathway(productCategory, sourceCountry, deviceClass, locale),
    eu: () => generateEUPathway(productCategory, sourceCountry, deviceClass, locale),
    china: () => generateChinaPathway(productCategory, sourceCountry, deviceClass, locale),
    japan: () => generateJapanPathway(productCategory, sourceCountry, deviceClass, locale),
    canada: () => generateCanadaPathway(productCategory, sourceCountry, deviceClass, locale),
  };

  return (pathways[targetMarket] || pathways.usa)();
}

// 美国 FDA 准入路径
function generateUSAPathway(
  productCategory: string,
  sourceCountry: string,
  deviceClass: string,
  locale: 'en' | 'zh'
): MarketAccessPathway {
  const isClassIII = deviceClass === 'class_iii';
  
  return {
    targetMarket: 'USA',
    targetMarketZh: '美国',
    sourceCountry,
    productCategory,
    deviceClass,
    requirements: [
      {
        step: 1,
        title: 'Device Classification',
        titleZh: '设备分类',
        description: 'Determine FDA device classification and identify predicate device',
        descriptionZh: '确定FDA设备分类并识别对比设备',
        documents: ['Product description', 'Intended use statement', 'Predicate device identification'],
        documentsZh: ['产品描述', '预期用途声明', '对比设备识别'],
        timeline: '1-2 weeks',
        timelineZh: '1-2周',
        cost: '$0',
        costZh: '免费',
      },
      {
        step: 2,
        title: isClassIII ? 'PMA Application' : '510(k) Submission',
        titleZh: isClassIII ? 'PMA申请' : '510(k)提交',
        description: isClassIII 
          ? 'Prepare and submit Premarket Approval application with clinical data'
          : 'Prepare substantial equivalence documentation',
        descriptionZh: isClassIII 
          ? '准备并提交包含临床数据的上市前批准申请'
          : '准备实质等效性文件',
        documents: isClassIII 
          ? ['PMA application', 'Clinical study data', 'Manufacturing information', 'Labeling']
          : ['510(k) summary', 'Substantial equivalence comparison', 'Performance testing', 'Biocompatibility data'],
        documentsZh: isClassIII 
          ? ['PMA申请', '临床研究数据', '生产信息', '标签']
          : ['510(k)摘要', '实质等效性对比', '性能测试', '生物相容性数据'],
        timeline: isClassIII ? '180-360 days' : '90-180 days',
        timelineZh: isClassIII ? '180-360天' : '90-180天',
        cost: isClassIII ? '$300,000+' : '$15,000-50,000',
        costZh: isClassIII ? '30万美元以上' : '1.5-5万美元',
      },
      {
        step: 3,
        title: 'Establishment Registration',
        titleZh: '企业注册',
        description: 'Register establishment and list device with FDA',
        descriptionZh: '向FDA注册企业并列名设备',
        documents: ['Establishment registration form', 'Device listing', 'US agent appointment'],
        documentsZh: ['企业注册表', '设备列名', '美国代理人任命'],
        timeline: '1-2 weeks',
        timelineZh: '1-2周',
        cost: '$5,000+',
        costZh: '5000美元以上',
      },
      {
        step: 4,
        title: 'Quality System',
        titleZh: '质量体系',
        description: 'Implement FDA Quality System Regulation (21 CFR Part 820)',
        descriptionZh: '实施FDA质量体系法规(21 CFR Part 820)',
        documents: ['Quality manual', 'SOPs', 'Design controls documentation'],
        documentsZh: ['质量手册', '标准操作程序', '设计控制文件'],
        timeline: '6-12 months',
        timelineZh: '6-12个月',
        cost: '$50,000-200,000',
        costZh: '5-20万美元',
      },
    ],
    keyRegulations: [
      '21 CFR Part 820 - Quality System Regulation',
      '21 CFR Part 807 - Establishment Registration',
      '21 CFR Part 801 - Labeling',
      '21 CFR Part 814 - Premarket Approval',
    ],
    keyRegulationsZh: [
      '21 CFR Part 820 - 质量体系法规',
      '21 CFR Part 807 - 企业注册',
      '21 CFR Part 801 - 标签',
      '21 CFR Part 814 - 上市前批准',
    ],
    localRepresentativeRequired: true,
    clinicalDataRequired: isClassIII,
  };
}

// 欧盟 MDR 准入路径
function generateEUPathway(
  productCategory: string,
  sourceCountry: string,
  deviceClass: string,
  locale: 'en' | 'zh'
): MarketAccessPathway {
  const needsNotifiedBody = deviceClass !== 'class_i';
  
  return {
    targetMarket: 'EU',
    targetMarketZh: '欧盟',
    sourceCountry,
    productCategory,
    deviceClass,
    requirements: [
      {
        step: 1,
        title: 'Device Classification',
        titleZh: '设备分类',
        description: 'Classify device according to MDR Annex VIII',
        descriptionZh: '根据MDR附件VIII进行设备分类',
        documents: ['Classification rationale', 'Intended use definition', 'Rule application'],
        documentsZh: ['分类依据', '预期用途定义', '规则应用'],
        timeline: '1-2 weeks',
        timelineZh: '1-2周',
        cost: '$0',
        costZh: '免费',
      },
      {
        step: 2,
        title: 'Notified Body Selection',
        titleZh: '选择公告机构',
        description: 'Select appropriate Notified Body for conformity assessment',
        descriptionZh: '选择合适的公告机构进行合格评定',
        documents: ['Technical documentation review', 'Quality system audit', 'Clinical evaluation assessment'],
        documentsZh: ['技术文件审查', '质量体系审核', '临床评估审查'],
        timeline: '2-4 weeks',
        timelineZh: '2-4周',
        cost: '$15,000-50,000',
        costZh: '1.5-5万欧元',
      },
      {
        step: 3,
        title: 'Technical Documentation',
        titleZh: '技术文件',
        description: 'Prepare technical documentation per Annexes II and III',
        descriptionZh: '按照附件II和III准备技术文件',
        documents: ['Device description', 'Risk management file', 'Clinical evaluation report', 'Post-market surveillance plan'],
        documentsZh: ['设备描述', '风险管理文件', '临床评估报告', '上市后监督计划'],
        timeline: '3-6 months',
        timelineZh: '3-6个月',
        cost: '$30,000-100,000',
        costZh: '3-10万欧元',
      },
      {
        step: 4,
        title: 'EUDAMED Registration',
        titleZh: 'EUDAMED注册',
        description: 'Register in EUDAMED database and obtain SRN',
        descriptionZh: '在EUDAMED数据库注册并获取SRN',
        documents: ['Actor registration', 'Device registration', 'UDI assignment'],
        documentsZh: ['参与者注册', '设备注册', 'UDI分配'],
        timeline: '2-4 weeks',
        timelineZh: '2-4周',
        cost: '$0',
        costZh: '免费',
      },
    ],
    keyRegulations: [
      'MDR 2017/745 - Medical Device Regulation',
      'MDCG Guidelines',
      'EN ISO 13485 - Quality Management',
      'EN ISO 14971 - Risk Management',
    ],
    keyRegulationsZh: [
      'MDR 2017/745 - 医疗器械法规',
      'MDCG指南',
      'EN ISO 13485 - 质量管理',
      'EN ISO 14971 - 风险管理',
    ],
    notifiedBodies: [
      'BSI Group (0086)',
      'TÜV SÜD (0123)',
      'DEKRA (0124)',
      'SGS (1639)',
    ],
    localRepresentativeRequired: sourceCountry !== 'eu',
    clinicalDataRequired: needsNotifiedBody,
  };
}

// 中国 NMPA 准入路径
function generateChinaPathway(
  productCategory: string,
  sourceCountry: string,
  deviceClass: string,
  locale: 'en' | 'zh'
): MarketAccessPathway {
  const isImport = sourceCountry !== 'china';
  const isClassIII = deviceClass === 'class_iii';
  
  return {
    targetMarket: 'China',
    targetMarketZh: '中国',
    sourceCountry,
    productCategory,
    deviceClass,
    requirements: [
      {
        step: 1,
        title: 'Classification Confirmation',
        titleZh: '分类确认',
        description: 'Confirm device classification according to NMPA catalog',
        descriptionZh: '根据NMPA目录确认设备分类',
        documents: ['Product technical requirements', 'Classification inquiry (if needed)'],
        documentsZh: ['产品技术要求', '分类界定（如需要）'],
        timeline: '2-4 weeks',
        timelineZh: '2-4周',
        cost: '$0-5,000',
        costZh: '0-5000美元',
      },
      {
        step: 2,
        title: 'Type Testing',
        titleZh: '型式检验',
        description: 'Conduct testing at NMPA-accredited laboratories',
        descriptionZh: '在NMPA认可的实验室进行检验',
        documents: ['Testing application', 'Product samples', 'Technical documentation'],
        documentsZh: ['检验申请', '产品样品', '技术文件'],
        timeline: '2-4 months',
        timelineZh: '2-4个月',
        cost: '$10,000-30,000',
        costZh: '1-3万美元',
      },
      {
        step: 3,
        title: 'Clinical Evaluation',
        titleZh: '临床评价',
        description: isClassIII 
          ? 'Conduct clinical trials in China'
          : 'Prepare clinical evaluation report',
        descriptionZh: isClassIII 
          ? '在中国进行临床试验'
          : '准备临床评价报告',
        documents: isClassIII 
          ? ['Clinical trial protocol', 'Ethics approval', 'Clinical trial report']
          : ['Clinical literature review', 'Equivalence analysis', 'Clinical data summary'],
        documentsZh: isClassIII 
          ? ['临床试验方案', '伦理批件', '临床试验报告']
          : ['临床文献综述', '等同性分析', '临床数据总结'],
        timeline: isClassIII ? '12-24 months' : '2-3 months',
        timelineZh: isClassIII ? '12-24个月' : '2-3个月',
        cost: isClassIII ? '$200,000-500,000' : '$20,000-50,000',
        costZh: isClassIII ? '20-50万美元' : '2-5万美元',
      },
      {
        step: 4,
        title: 'Registration Application',
        titleZh: '注册申请',
        description: 'Submit registration application to NMPA',
        descriptionZh: '向NMPA提交注册申请',
        documents: ['Registration application form', 'Technical documentation', 'Testing reports', 'Clinical data'],
        documentsZh: ['注册申请表', '技术文件', '检验报告', '临床数据'],
        timeline: isClassIII ? '12-18 months' : '6-12 months',
        timelineZh: isClassIII ? '12-18个月' : '6-12个月',
        cost: '$15,000-30,000',
        costZh: '1.5-3万美元',
      },
    ],
    keyRegulations: [
      'Regulations on Supervision and Administration of Medical Devices',
      'Measures for Medical Device Registration',
      'GB/T 16886 - Biological Evaluation',
      'YY/T 0316 - Risk Management',
    ],
    keyRegulationsZh: [
      '医疗器械监督管理条例',
      '医疗器械注册管理办法',
      'GB/T 16886 - 生物学评价',
      'YY/T 0316 - 风险管理',
    ],
    localRepresentativeRequired: isImport,
    clinicalDataRequired: isClassIII || deviceClass === 'class_iib',
  };
}

// 日本 PMDA 准入路径
function generateJapanPathway(
  productCategory: string,
  sourceCountry: string,
  deviceClass: string,
  locale: 'en' | 'zh'
): MarketAccessPathway {
  const isClassIV = deviceClass === 'class_iii';
  
  return {
    targetMarket: 'Japan',
    targetMarketZh: '日本',
    sourceCountry,
    productCategory,
    deviceClass,
    requirements: [
      {
        step: 1,
        title: 'Classification & Certification',
        titleZh: '分类与认证',
        description: 'Determine classification and select Registered Certification Body (RCB)',
        descriptionZh: '确定分类并选择注册认证机构(RCB)',
        documents: ['Classification confirmation', 'RCB selection', 'Pre-consultation'],
        documentsZh: ['分类确认', 'RCB选择', '事前咨询'],
        timeline: '2-4 weeks',
        timelineZh: '2-4周',
        cost: '$5,000-10,000',
        costZh: '5000-1万美元',
      },
      {
        step: 2,
        title: 'QMS Certification',
        titleZh: 'QMS认证',
        description: 'Obtain ISO 13485 certification from accredited body',
        descriptionZh: '从认可机构获得ISO 13485认证',
        documents: ['Quality manual', 'Audit report', 'Corrective actions'],
        documentsZh: ['质量手册', '审核报告', '纠正措施'],
        timeline: '3-6 months',
        timelineZh: '3-6个月',
        cost: '$20,000-40,000',
        costZh: '2-4万美元',
      },
      {
        step: 3,
        title: 'Pre-market Submission',
        titleZh: '上市前提交',
        description: isClassIV 
          ? 'Submit to PMDA for approval'
          : 'Submit to RCB for certification',
        descriptionZh: isClassIV 
          ? '向PMDA提交批准申请'
          : '向RCB提交认证申请',
        documents: ['Application form', 'Technical documentation', 'Clinical data', 'QMS certificate'],
        documentsZh: ['申请表', '技术文件', '临床数据', 'QMS证书'],
        timeline: isClassIV ? '12-18 months' : '6-12 months',
        timelineZh: isClassIV ? '12-18个月' : '6-12个月',
        cost: isClassIV ? '$50,000-100,000' : '$20,000-40,000',
        costZh: isClassIV ? '5-10万美元' : '2-4万美元',
      },
    ],
    keyRegulations: [
      'Pharmaceutical and Medical Device Act (PMD Act)',
      'MHLW Ministerial Ordinances',
      'JIS T 14971 - Risk Management',
      'JIS T 13485 - Quality Management',
    ],
    keyRegulationsZh: [
      '药事法',
      '厚生劳动省令',
      'JIS T 14971 - 风险管理',
      'JIS T 13485 - 质量管理',
    ],
    localRepresentativeRequired: true,
    clinicalDataRequired: isClassIV,
  };
}

// 加拿大 Health Canada 准入路径
function generateCanadaPathway(
  productCategory: string,
  sourceCountry: string,
  deviceClass: string,
  locale: 'en' | 'zh'
): MarketAccessPathway {
  const isClassIII = deviceClass === 'class_iii';
  
  return {
    targetMarket: 'Canada',
    targetMarketZh: '加拿大',
    sourceCountry,
    productCategory,
    deviceClass,
    requirements: [
      {
        step: 1,
        title: 'Device Classification',
        titleZh: '设备分类',
        description: 'Determine classification according to Canadian Medical Devices Regulations',
        descriptionZh: '根据加拿大医疗器械法规确定分类',
        documents: ['Classification determination', 'Risk assessment', 'Intended use statement'],
        documentsZh: ['分类确定', '风险评估', '预期用途声明'],
        timeline: '1-2 weeks',
        timelineZh: '1-2周',
        cost: '$0',
        costZh: '免费',
      },
      {
        step: 2,
        title: 'ISO 13485 Certification',
        titleZh: 'ISO 13485认证',
        description: 'Obtain ISO 13485 certification from Health Canada-recognized registrar',
        descriptionZh: '从Health Canada认可的注册机构获得ISO 13485认证',
        documents: ['Quality system documentation', 'Audit by recognized registrar'],
        documentsZh: ['质量体系文件', '认可注册机构审核'],
        timeline: '3-6 months',
        timelineZh: '3-6个月',
        cost: '$15,000-30,000',
        costZh: '1.5-3万加元',
      },
      {
        step: 3,
        title: 'Medical Device License Application',
        titleZh: '医疗器械许可证申请',
        description: 'Submit MDL application to Health Canada',
        descriptionZh: '向Health Canada提交MDL申请',
        documents: ['Application form', 'Device description', 'Labeling', 'Quality system certificate'],
        documentsZh: ['申请表', '设备描述', '标签', '质量体系证书'],
        timeline: isClassIII ? '6-12 months' : '2-4 months',
        timelineZh: isClassIII ? '6-12个月' : '2-4个月',
        cost: '$5,000-15,000',
        costZh: '5000-1.5万加元',
      },
    ],
    keyRegulations: [
      'Medical Devices Regulations (SOR/98-282)',
      'ISO 13485 - Quality Management Systems',
      'CMDR - Canadian Medical Devices Regulations',
    ],
    keyRegulationsZh: [
      '医疗器械法规 (SOR/98-282)',
      'ISO 13485 - 质量管理体系',
      'CMDR - 加拿大医疗器械法规',
    ],
    localRepresentativeRequired: sourceCountry !== 'canada',
    clinicalDataRequired: isClassIII,
  };
}
