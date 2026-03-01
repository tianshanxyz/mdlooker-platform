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
  // 新增：详细操作指南
  detailedGuide?: {
    description: string;
    descriptionZh: string;
    forms?: FormInfo[];
    contacts?: ContactInfo[];
    submissionMethods?: SubmissionMethod[];
    tips?: string[];
    tipsZh?: string[];
  };
}

export interface FormInfo {
  name: string;
  nameZh: string;
  downloadUrl?: string;
  onlineUrl?: string;
  description?: string;
  descriptionZh?: string;
}

export interface ContactInfo {
  name: string;
  nameZh: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  descriptionZh?: string;
}

export interface SubmissionMethod {
  method: string;
  methodZh: string;
  url?: string;
  email?: string;
  address?: string;
  description?: string;
  descriptionZh?: string;
}

export interface RegulationLink {
  name: string;
  nameZh: string;
  url: string;
  description?: string;
  descriptionZh?: string;
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
  regulationLinks: RegulationLink[];
  notifiedBodies?: string[];
  localRepresentativeRequired: boolean;
  clinicalDataRequired: boolean;
  // 新增：总体提示
  generalTips?: string[];
  generalTipsZh?: string[];
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
    singapore: () => generateSingaporePathway(productCategory, sourceCountry, deviceClass, locale),
    middleeast: () => generateMiddleEastPathway(productCategory, sourceCountry, deviceClass, locale),
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
        detailedGuide: {
          description: 'Use the FDA Product Classification Database to determine your device\'s classification. For novel devices, you may need to submit a 513(g) Request for Information.',
          descriptionZh: '使用FDA产品分类数据库确定您的设备分类。对于新型设备，您可能需要提交513(g)信息请求。',
          forms: [
            {
              name: '513(g) Request Form',
              nameZh: '513(g)请求表格',
              downloadUrl: 'https://www.fda.gov/media/71029/download',
              onlineUrl: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPCD/classification.cfm',
              description: 'Request for Information - Device Classification',
              descriptionZh: '信息请求 - 设备分类'
            }
          ],
          contacts: [
            {
              name: 'FDA Division of Industry and Consumer Education (DICE)',
              nameZh: 'FDA行业与消费者教育司',
              email: 'DICE@fda.hhs.gov',
              phone: '+1-800-638-2041',
              website: 'https://www.fda.gov/medical-devices/medical-device-safety/medical-device-reporting-mdr-how-report-medical-device-problems',
              description: 'General questions about device classification',
              descriptionZh: '设备分类的一般问题'
            }
          ],
          submissionMethods: [
            {
              method: 'Online Database',
              methodZh: '在线数据库',
              url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPCD/classification.cfm',
              description: 'Search product classification database',
              descriptionZh: '搜索产品分类数据库'
            },
            {
              method: 'Email Submission',
              methodZh: '邮件提交',
              email: 'DICE@fda.hhs.gov',
              description: 'For 513(g) requests and classification questions',
              descriptionZh: '用于513(g)请求和分类问题'
            }
          ],
          tips: [
            'Search for similar devices already on the market to identify your predicate device',
            'If no predicate exists, consider the De Novo pathway for novel devices',
            'Document your classification rationale for future reference',
            'Consult with FDA early if classification is unclear'
          ],
          tipsZh: [
            '搜索市场上已有的类似设备以识别您的对比设备',
            '如果不存在对比设备，请考虑De Novo途径用于新型设备',
            '记录您的分类依据以供将来参考',
            '如果分类不明确，请尽早咨询FDA'
          ]
        }
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
        detailedGuide: {
          description: isClassIII 
            ? 'Submit your PMA application through the FDA eSubmitter system. Include all clinical data, manufacturing information, and labeling. FDA will conduct a thorough review including facility inspection.'
            : 'Prepare your 510(k) submission demonstrating substantial equivalence to a predicate device. Use the FDA eSubmitter tool for electronic submission.',
          descriptionZh: isClassIII 
            ? '通过FDA eSubmitter系统提交您的PMA申请。包括所有临床数据、生产信息和标签。FDA将进行彻底审查，包括设施检查。'
            : '准备您的510(k)提交，证明与对比设备的实质等效性。使用FDA eSubmitter工具进行电子提交。',
          forms: [
            {
              name: '510(k) Submission Template',
              nameZh: '510(k)提交模板',
              downloadUrl: 'https://www.fda.gov/media/99946/download',
              onlineUrl: 'https://www.fda.gov/medical-devices/premarket-submissions/premarket-notification-510k',
              description: 'Standard format for 510(k) submissions',
              descriptionZh: '510(k)提交的标准格式'
            },
            {
              name: 'PMA Application Form',
              nameZh: 'PMA申请表',
              downloadUrl: 'https://www.fda.gov/media/71273/download',
              onlineUrl: 'https://www.fda.gov/medical-devices/premarket-submissions/premarket-approval-pma',
              description: 'Premarket Approval application',
              descriptionZh: '上市前批准申请'
            }
          ],
          contacts: [
            {
              name: 'FDA CDRH Premarket Review',
              nameZh: 'FDA CDRH上市前审查',
              email: 'CDRH-Submission-Support@fda.hhs.gov',
              phone: '+1-301-796-5640',
              website: 'https://www.fda.gov/medical-devices/premarket-submissions',
              description: 'Questions about submission requirements and process',
              descriptionZh: '关于提交要求和流程的问题'
            }
          ],
          submissionMethods: [
            {
              method: 'FDA eSubmitter (Electronic)',
              methodZh: 'FDA eSubmitter（电子）',
              url: 'https://www.fda.gov/industry/electronic-submissions-gateway',
              description: 'Preferred method for all submissions',
              descriptionZh: '所有提交的首选方法'
            },
            {
              method: 'CDRH Document Control Center',
              methodZh: 'CDRH文件控制中心',
              address: 'Food and Drug Administration, Center for Devices and Radiological Health, Document Control Center - WO66-G609, 10903 New Hampshire Avenue, Silver Spring, MD 20993-0002',
              description: 'Mail submissions (not recommended)',
              descriptionZh: '邮寄提交（不推荐）'
            }
          ],
          tips: [
            'Use the FDA eSubmitter tool for faster processing',
            'Include a comprehensive cover letter summarizing your submission',
            'Ensure all testing is conducted by accredited laboratories',
            'Respond to FDA questions within the specified timeframe to avoid delays',
            'Consider a pre-submission meeting with FDA for complex devices'
          ],
          tipsZh: [
            '使用FDA eSubmitter工具以加快处理速度',
            '包括一封全面的求职信，总结您的提交',
            '确保所有测试均由认可实验室进行',
            '在指定时间内回复FDA的问题以避免延误',
            '对于复杂设备，考虑与FDA进行预提交会议'
          ]
        }
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
        detailedGuide: {
          description: 'All medical device establishments must register with FDA annually and list their devices. Foreign establishments must designate a US agent.',
          descriptionZh: '所有医疗器械企业必须每年向FDA注册并列名其设备。外国企业必须指定美国代理人。',
          forms: [
            {
              name: 'FDA Form 2891 - Establishment Registration',
              nameZh: 'FDA表格2891 - 企业注册',
              downloadUrl: 'https://www.fda.gov/media/71736/download',
              onlineUrl: 'https://www.access.fda.gov/oaa/registration.htm',
              description: 'Annual establishment registration',
              descriptionZh: '年度企业注册'
            },
            {
              name: 'FDA Form 2892 - Device Listing',
              nameZh: 'FDA表格2892 - 设备列名',
              downloadUrl: 'https://www.fda.gov/media/71737/download',
              onlineUrl: 'https://www.access.fda.gov/oaa/registration.htm',
              description: 'Device listing form',
              descriptionZh: '设备列名表格'
            }
          ],
          contacts: [
            {
              name: 'FDA Registration and Listing',
              nameZh: 'FDA注册和列名',
              email: 'registrationandlisting@fda.hhs.gov',
              phone: '+1-301-796-7400',
              website: 'https://www.fda.gov/medical-devices/registration-and-listing',
              description: 'Questions about registration and listing',
              descriptionZh: '关于注册和列名的问题'
            }
          ],
          submissionMethods: [
            {
              method: 'FURLS Online System',
              methodZh: 'FURLS在线系统',
              url: 'https://www.access.fda.gov/oaa/registration.htm',
              description: 'FDA Unified Registration and Listing System',
              descriptionZh: 'FDA统一注册和列名系统'
            }
          ],
          tips: [
            'Registration must be renewed annually between October 1 and December 31',
            'Foreign establishments must have a US agent with a US address',
            'User fees must be paid before registration is complete',
            'Keep your establishment information up to date',
            'Device listing should be updated when products are added or modified'
          ],
          tipsZh: [
            '注册必须在每年10月1日至12月31日之间续期',
            '外国企业必须拥有具有美国地址的美国代理人',
            '必须在注册完成前支付用户费用',
            '保持您的企业信息最新',
            '当产品添加或修改时，应更新设备列名'
          ]
        }
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
        detailedGuide: {
          description: 'Establish a quality system compliant with 21 CFR Part 820 (QSR). FDA may conduct inspections to verify compliance.',
          descriptionZh: '建立符合21 CFR Part 820（QSR）的质量体系。FDA可以进行检查以验证合规性。',
          forms: [
            {
              name: 'QSIT Inspection Guide',
              nameZh: 'QSIT检查指南',
              downloadUrl: 'https://www.fda.gov/media/11671/download',
              description: 'Quality System Inspection Technique guide',
              descriptionZh: '质量体系检查技术指南'
            }
          ],
          contacts: [
            {
              name: 'FDA Office of Compliance',
              nameZh: 'FDA合规办公室',
              email: 'CDRH-Compliance@fda.hhs.gov',
              phone: '+1-301-796-5500',
              website: 'https://www.fda.gov/medical-devices/compliance',
              description: 'Quality system compliance questions',
              descriptionZh: '质量体系合规问题'
            }
          ],
          tips: [
            'Develop comprehensive SOPs covering all QSR requirements',
            'Implement design controls early in product development',
            'Maintain detailed records of all quality activities',
            'Conduct internal audits regularly',
            'Be prepared for FDA inspections at any time'
          ],
          tipsZh: [
            '制定涵盖所有QSR要求的全面SOP',
            '在产品开发早期实施设计控制',
            '保持所有质量活动的详细记录',
            '定期进行内部审核',
            '随时准备FDA检查'
          ]
        }
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
    regulationLinks: [
      {
        name: '21 CFR Part 820 - QSR',
        nameZh: '21 CFR Part 820 - 质量体系法规',
        url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-820',
        description: 'FDA Quality System Regulation',
        descriptionZh: 'FDA质量体系法规',
      },
      {
        name: '21 CFR Part 807 - Registration',
        nameZh: '21 CFR Part 807 - 企业注册',
        url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-807',
        description: 'Establishment Registration and Device Listing',
        descriptionZh: '企业注册和设备列名',
      },
      {
        name: '21 CFR Part 801 - Labeling',
        nameZh: '21 CFR Part 801 - 标签',
        url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-801',
        description: 'Device Labeling Requirements',
        descriptionZh: '设备标签要求',
      },
      {
        name: '21 CFR Part 814 - PMA',
        nameZh: '21 CFR Part 814 - 上市前批准',
        url: 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-814',
        description: 'Premarket Approval of Medical Devices',
        descriptionZh: '医疗器械上市前批准',
      },
      {
        name: 'FDA Device Advice',
        nameZh: 'FDA设备指南',
        url: 'https://www.fda.gov/medical-devices/device-advice-comprehensive-regulatory-assistance',
        description: 'Comprehensive Regulatory Assistance',
        descriptionZh: '综合监管协助',
      },
    ],
    localRepresentativeRequired: true,
    clinicalDataRequired: isClassIII,
    generalTips: [
      'Start early - FDA review times can be lengthy',
      'Maintain open communication with FDA throughout the process',
      'Keep detailed records of all submissions and correspondence',
      'Consider hiring a regulatory consultant for complex devices',
      'Stay updated on FDA guidance documents and policy changes'
    ],
    generalTipsZh: [
      '尽早开始 - FDA审查时间可能很长',
      '在整个过程中与FDA保持开放沟通',
      '保持所有提交和通信的详细记录',
      '考虑为复杂设备聘请监管顾问',
      '及时了解FDA指导文件和政策变化'
    ]
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
        detailedGuide: {
          description: 'Use the MDR classification rules in Annex VIII to determine your device class. Classes range from I (low risk) to III (high risk).',
          descriptionZh: '使用MDR附件VIII中的分类规则确定您的设备类别。类别范围从I类（低风险）到III类（高风险）。',
          forms: [
            {
              name: 'MDR Classification Guide',
              nameZh: 'MDR分类指南',
              downloadUrl: 'https://health.ec.europa.eu/system/files/2022-01/md_mdcg_2021_24_guidance_classification_en_0.pdf',
              description: 'MDCG 2021-24 Classification guidance',
              descriptionZh: 'MDCG 2021-24分类指南'
            }
          ],
          contacts: [
            {
              name: 'European Commission DG SANTE',
              nameZh: '欧盟委员会DG SANTE',
              email: 'SANTE-MEDICAL-DEVICES@ec.europa.eu',
              website: 'https://health.ec.europa.eu/medical-devices-sector_en',
              description: 'General MDR questions',
              descriptionZh: '一般MDR问题'
            }
          ],
          tips: [
            'Carefully review all 22 classification rules in Annex VIII',
            'Consider borderline cases carefully - consult MDCG guidance',
            'Document your classification rationale thoroughly',
            'Classification determines the conformity assessment route'
          ],
          tipsZh: [
            '仔细审查附件VIII中的所有22条分类规则',
            '仔细考虑边界情况 - 咨询MDCG指南',
            '彻底记录您的分类依据',
            '分类决定了合格评定路线'
          ]
        }
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
        detailedGuide: {
          description: 'Choose a Notified Body designated under MDR for your device class and type. Check NANDO database for available bodies.',
          descriptionZh: '选择根据MDR为您的设备类别和类型指定的公告机构。检查NANDO数据库了解可用机构。',
          contacts: [
            {
              name: 'NANDO Database',
              nameZh: 'NANDO数据库',
              website: 'https://ec.europa.eu/growth/tools-databases/nando/',
              description: 'Search for Notified Bodies by country and scope',
              descriptionZh: '按国家和范围搜索公告机构'
            }
          ],
          tips: [
            'Verify the Notified Body is designated for your device type',
            'Compare costs and timelines between different bodies',
            'Consider the body\'s experience with similar devices',
            'Check the body\'s workload and availability'
          ],
          tipsZh: [
            '验证公告机构是否为您的设备类型指定',
            '比较不同机构之间的成本和时间表',
            '考虑机构对类似设备的经验',
            '检查机构的工作量和可用性'
          ]
        }
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
        detailedGuide: {
          description: 'Compile comprehensive technical documentation according to MDR Annexes II and III. This is the core of your conformity assessment.',
          descriptionZh: '根据MDR附件II和III编制全面的技术文件。这是您合格评定的核心。',
          forms: [
            {
              name: 'MDR Technical Documentation Template',
              nameZh: 'MDR技术文件模板',
              downloadUrl: 'https://health.ec.europa.eu/system/files/2022-01/md_mdcg_2021_25_tech_doc_en_0.pdf',
              description: 'MDCG 2021-25 Technical Documentation guidance',
              descriptionZh: 'MDCG 2021-25技术文件指南'
            }
          ],
          tips: [
            'Start with a detailed device description and specifications',
            'Ensure risk management covers all identified risks',
            'Clinical evaluation must be thorough and up-to-date',
            'Include post-market surveillance procedures',
            'Maintain a technical documentation file throughout device lifecycle'
          ],
          tipsZh: [
            '从详细的设备描述和规格开始',
            '确保风险管理涵盖所有已识别的风险',
            '临床评估必须彻底且最新',
            '包括上市后监督程序',
            '在设备整个生命周期中保持技术文件档案'
          ]
        }
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
        detailedGuide: {
          description: 'Register as an economic operator in EUDAMED and obtain your Single Registration Number (SRN). This is mandatory for market access.',
          descriptionZh: '在EUDAMED中注册为经济运营商并获取您的单一注册号（SRN）。这是市场准入的强制性要求。',
          contacts: [
            {
              name: 'EUDAMED Helpdesk',
              nameZh: 'EUDAMED帮助台',
              email: 'SANTE-EUDAMED@ec.europa.eu',
              website: 'https://ec.europa.eu/tools/eudamed',
              description: 'EUDAMED technical support',
              descriptionZh: 'EUDAMED技术支持'
            }
          ],
          submissionMethods: [
            {
              method: 'EUDAMED Portal',
              methodZh: 'EUDAMED门户',
              url: 'https://ec.europa.eu/tools/eudamed',
              description: 'European Database on Medical Devices',
              descriptionZh: '欧洲医疗器械数据库'
            }
          ],
          tips: [
            'Ensure you have an EORI number before registering',
            'All economic operators must register (manufacturers, importers, authorized representatives)',
            'UDI assignment is required for most devices',
            'Keep your EUDAMED information updated'
          ],
          tipsZh: [
            '确保在注册前拥有EORI号码',
            '所有经济运营商必须注册（制造商、进口商、授权代表）',
            '大多数设备需要UDI分配',
            '保持您的EUDAMED信息更新'
          ]
        }
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
    regulationLinks: [
      {
        name: 'MDR 2017/745',
        nameZh: 'MDR 2017/745 - 医疗器械法规',
        url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32017R0745',
        description: 'Medical Device Regulation (EU)',
        descriptionZh: '欧盟医疗器械法规',
      },
      {
        name: 'MDCG Guidelines',
        nameZh: 'MDCG指南',
        url: 'https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en',
        description: 'Medical Device Coordination Group Guidelines',
        descriptionZh: '医疗器械协调组指南',
      },
      {
        name: 'EUDAMED',
        nameZh: 'EUDAMED数据库',
        url: 'https://ec.europa.eu/tools/eudamed',
        description: 'European Database on Medical Devices',
        descriptionZh: '欧洲医疗器械数据库',
      },
      {
        name: 'NANDO Database',
        nameZh: 'NANDO公告机构数据库',
        url: 'https://ec.europa.eu/growth/tools-databases/nando/',
        description: 'Notified Bodies Database',
        descriptionZh: '公告机构数据库',
      },
      {
        name: 'ISO 13485:2016',
        nameZh: 'ISO 13485:2016',
        url: 'https://www.iso.org/standard/59752.html',
        description: 'Medical devices - Quality management systems',
        descriptionZh: '医疗器械-质量管理体系',
      },
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
        detailedGuide: {
          description: 'Check the NMPA Medical Device Classification Catalog. For unclear cases, submit a classification inquiry to CMDE.',
          descriptionZh: '查看NMPA医疗器械分类目录。对于不明确的情况，向CMDE提交分类界定申请。',
          contacts: [
            {
              name: 'CMDE (Center for Medical Device Evaluation)',
              nameZh: '医疗器械技术审评中心',
              website: 'https://www.cmde.org.cn/',
              description: 'Classification and technical review',
              descriptionZh: '分类界定和技术审评'
            }
          ],
          tips: [
            'Reference the latest NMPA Classification Catalog',
            'Classification determines the registration pathway',
            'For novel devices, classification inquiry is recommended',
            'Classification decisions can affect testing requirements'
          ],
          tipsZh: [
            '参考最新的NMPA分类目录',
            '分类决定了注册路径',
            '对于新型设备，建议进行分类界定',
            '分类决定可能影响测试要求'
          ]
        }
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
        detailedGuide: {
          description: 'Submit your device for testing at NMPA-accredited testing centers. Testing must comply with Chinese national standards (GB).',
          descriptionZh: '将您的设备提交给NMPA认可的检测中心进行检测。检测必须符合中国国家标准（GB）。',
          contacts: [
            {
              name: 'NMPA Testing Center Directory',
              nameZh: 'NMPA检测中心目录',
              website: 'https://www.nmpa.gov.cn/xxgk/ggtg/qtggtg/20210308160001253.html',
              description: 'List of accredited testing institutions',
              descriptionZh: '认可的检测机构名单'
            }
          ],
          tips: [
            'Select a testing center with experience in your device type',
            'Ensure all GB standards are covered in testing',
            'Plan for sample preparation and shipping time',
            'Testing reports are valid for 1 year'
          ],
          tipsZh: [
            '选择对您的设备类型有经验的检测中心',
            '确保检测涵盖所有GB标准',
            '计划样品准备和运输时间',
            '检测报告有效期为1年'
          ]
        }
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
        detailedGuide: {
          description: isClassIII 
            ? 'Conduct clinical trials at approved sites in China with NMPA oversight. Requires ethics committee approval.'
            : 'Prepare a clinical evaluation report based on literature review and/or equivalence to approved devices.',
          descriptionZh: isClassIII 
            ? '在NMPA监督下在中国批准的地点进行临床试验。需要伦理委员会批准。'
            : '根据文献综述和/或与已批准设备的等同性准备临床评价报告。',
          tips: [
            'Clinical trials must be conducted at NMPA-approved sites',
            'Ethics committee approval is mandatory',
            'For Class II devices, clinical evaluation may be sufficient',
            'Clinical trial data from overseas may be accepted with justification'
          ],
          tipsZh: [
            '临床试验必须在NMPA批准的地点进行',
            '伦理委员会批准是强制性的',
            '对于II类设备，临床评价可能就足够了',
            '海外临床试验数据可以在有理由的情况下被接受'
          ]
        }
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
        detailedGuide: {
          description: 'Submit complete registration dossier through the NMPA eRPS system. CMDE will conduct technical review.',
          descriptionZh: '通过NMPA eRPS系统提交完整的注册档案。CMDE将进行技术审评。',
          contacts: [
            {
              name: 'NMPA Medical Device Registration',
              nameZh: 'NMPA医疗器械注册',
              website: 'https://www.nmpa.gov.cn/ylqx/ylqxjgdt/index.html',
              description: 'Registration information and guidance',
              descriptionZh: '注册信息和指南'
            }
          ],
          submissionMethods: [
            {
              method: 'eRPS Electronic System',
              methodZh: 'eRPS电子系统',
              url: 'https://www.nmpa.gov.cn/ylqx/ylqxjgdt/index.html',
              description: 'NMPA electronic registration system',
              descriptionZh: 'NMPA电子注册系统'
            }
          ],
          tips: [
            'Ensure all documents are in Chinese or with Chinese translation',
            'Technical requirements document is critical',
            'Respond promptly to CMDE inquiries',
            'Import devices require China agent appointment'
          ],
          tipsZh: [
            '确保所有文件为中文或有中文翻译',
            '技术要求文件至关重要',
            '及时回复CMDE查询',
            '进口设备需要指定中国代理人'
          ]
        }
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
    regulationLinks: [
      {
        name: 'Medical Device Regulations',
        nameZh: '医疗器械监督管理条例',
        url: 'https://www.nmpa.gov.cn/xxgk/fgwj/flxzhfg/20210308160000153.html',
        description: 'State Council Order No. 739',
        descriptionZh: '国务院令第739号',
      },
      {
        name: 'Registration Measures',
        nameZh: '医疗器械注册管理办法',
        url: 'https://www.nmpa.gov.cn/xxgk/fgwj/bmgzh/20210308160001153.html',
        description: 'NMPA Order No. 47',
        descriptionZh: '国家市场监督管理总局令第47号',
      },
      {
        name: 'NMPA Database',
        nameZh: 'NMPA数据查询',
        url: 'https://www.nmpa.gov.cn/datasearch/home-index.html',
        description: 'Medical Device Registration Database',
        descriptionZh: '医疗器械注册证信息查询',
      },
      {
        name: 'CMDE Guidelines',
        nameZh: 'CMDE技术审查指导原则',
        url: 'https://www.cmde.org.cn/flfg/zdyz/index.html',
        description: 'Center for Medical Device Evaluation Guidelines',
        descriptionZh: '医疗器械技术审评中心指导原则',
      },
      {
        name: 'GB/T 16886.1',
        nameZh: 'GB/T 16886.1 生物学评价',
        url: 'https://openstd.samr.gov.cn/bzgk/gb/newGbInfo?hcno=5C8A8A8A8A8A8A8A8A8A8A8A8A8A8A8A',
        description: 'Biological evaluation of medical devices',
        descriptionZh: '医疗器械生物学评价',
      },
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
        detailedGuide: {
          description: 'Use the Nihonbashi portal to determine your device classification and select an appropriate RCB for your device class.',
          descriptionZh: '使用日本桥门户确定您的设备分类，并为您的设备类别选择合适的RCB。',
          contacts: [
            {
              name: 'Nihonbashi Portal',
              nameZh: '日本桥门户',
              website: 'https://www.nihonbashi-pmda.jp/english/',
              description: 'Regulatory consultation portal',
              descriptionZh: '监管咨询门户'
            }
          ],
          tips: [
            'Japan uses a 4-class system (Class I-IV)',
            'Class I devices can be self-certified',
            'Classes II-IV require RCB or PMDA review',
            'Foreign manufacturers need a Marketing Authorization Holder (MAH)'
          ],
          tipsZh: [
            '日本使用4类系统（I-IV类）',
            'I类设备可以自我认证',
            'II-IV类需要RCB或PMDA审查',
            '外国制造商需要营销授权持有人（MAH）'
          ]
        }
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
        detailedGuide: {
          description: 'Obtain ISO 13485 certification from a MHLW-accredited certification body. This is mandatory for medical device manufacturers.',
          descriptionZh: '从MHLW认可的认证机构获得ISO 13485认证。这是医疗器械制造商的强制性要求。',
          tips: [
            'Certification must be from MHLW-recognized body',
            'QMS must comply with Japanese Ministerial Ordinances',
            'Annual surveillance audits are required',
            'Foreign manufacturers may need on-site audits'
          ],
          tipsZh: [
            '认证必须来自MHLW认可的机构',
            'QMS必须符合日本省令',
            '需要年度监督审核',
            '外国制造商可能需要现场审核'
          ]
        }
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
        detailedGuide: {
          description: 'Submit your pre-market application through your MAH. Class IV devices require PMDA review; lower classes can use RCB certification.',
          descriptionZh: '通过您的MAH提交上市前申请。IV类设备需要PMDA审查；较低类别可以使用RCB认证。',
          contacts: [
            {
              name: 'PMDA Consultation',
              nameZh: 'PMDA咨询',
              website: 'https://www.pmda.go.jp/english/review-services/regulatory-info/0002.html',
              description: 'Pre-submission consultation services',
              descriptionZh: '预提交咨询服务'
            }
          ],
          tips: [
            'Foreign manufacturers cannot submit directly - must use MAH',
            'STED format documentation is recommended',
            'Japanese labeling is required',
            'Consider pre-submission meetings for novel devices'
          ],
          tipsZh: [
            '外国制造商不能直接提交 - 必须使用MAH',
            '建议使用STED格式文件',
            '需要日文标签',
            '对于新型设备，考虑预提交会议'
          ]
        }
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
    regulationLinks: [
      {
        name: 'PMD Act (Act No. 145)',
        nameZh: '药事法（昭和35年法律第145号）',
        url: 'https://www.mhlw.go.jp/english/topics/medicaldevices/',
        description: 'Pharmaceutical and Medical Device Act',
        descriptionZh: '医薬品、医療機器等の品質、有効性及び安全性の確保等に関する法律',
      },
      {
        name: 'PMDA Guidelines',
        nameZh: 'PMDA指导原则',
        url: 'https://www.pmda.go.jp/english/review-services/regulatory-info/0002.html',
        description: 'Pharmaceuticals and Medical Devices Agency',
        descriptionZh: '医药品医疗器械综合机构',
      },
      {
        name: 'MHLW Medical Devices',
        nameZh: 'MHLW医疗器械',
        url: 'https://www.mhlw.go.jp/english/policy/health-medical/medical-care/medical-devices/',
        description: 'Ministry of Health, Labour and Welfare',
        descriptionZh: '厚生劳动省医疗器械',
      },
      {
        name: 'JIS Standards',
        nameZh: 'JIS标准',
        url: 'https://www.jisc.go.jp/eng/',
        description: 'Japanese Industrial Standards',
        descriptionZh: '日本工业标准',
      },
      {
        name: 'Nihonbashi Portal',
        nameZh: '日本桥医疗器械门户',
        url: 'https://www.nihonbashi-pmda.jp/english/',
        description: 'Regulatory Consultation Portal',
        descriptionZh: '监管咨询门户',
      },
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
        detailedGuide: {
          description: 'Use Health Canada\'s classification rules to determine your device class. Canada uses a 4-class system similar to the EU.',
          descriptionZh: '使用Health Canada的分类规则确定您的设备类别。加拿大使用与欧盟类似的4类系统。',
          contacts: [
            {
              name: 'Health Canada Medical Devices',
              nameZh: 'Health Canada医疗器械',
              website: 'https://www.canada.ca/en/health-canada/services/medical-devices.html',
              description: 'Classification and general inquiries',
              descriptionZh: '分类和一般查询'
            }
          ],
          tips: [
            'Classification rules are similar to EU MDR',
            'Use the MDALL database to check similar devices',
            'Class I devices are exempt from MDL but require registration',
            'Consider special rules for combination devices'
          ],
          tipsZh: [
            '分类规则与欧盟MDR相似',
            '使用MDALL数据库检查类似设备',
            'I类设备免于MDL但需要注册',
            '考虑组合产品的特殊规则'
          ]
        }
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
        detailedGuide: {
          description: 'Obtain ISO 13485 certification from a registrar recognized by Health Canada\'s Canadian Medical Devices Conformity Assessment System (CMDCAS).',
          descriptionZh: '从Health Canada加拿大医疗器械合格评定系统（CMDCAS）认可的注册机构获得ISO 13485认证。',
          contacts: [
            {
              name: 'Health Canada CMDCAS',
              nameZh: 'Health Canada CMDCAS',
              website: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/quality-management-system.html',
              description: 'List of recognized registrars',
              descriptionZh: '认可注册机构名单'
            }
          ],
          tips: [
            'CMDCAS recognition is required for Canadian market',
            'Annual surveillance audits required',
            'QMS must address Canadian Medical Devices Regulations',
            'Certificate must be current for MDL application'
          ],
          tipsZh: [
            '加拿大市场需要CMDCAS认可',
            '需要年度监督审核',
            'QMS必须解决加拿大医疗器械法规',
            'MDL申请需要当前证书'
          ]
        }
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
        detailedGuide: {
          description: 'Submit your Medical Device License (MDL) application through Health Canada\'s Medical Devices Active Licence Listing (MDALL) system.',
          descriptionZh: '通过Health Canada的医疗器械活跃许可证清单（MDALL）系统提交您的医疗器械许可证（MDL）申请。',
          forms: [
            {
              name: 'MDL Application Form',
              nameZh: 'MDL申请表',
              downloadUrl: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/forms/medical-device-license-application-form-instructions.html',
              description: 'Medical Device Licence Application',
              descriptionZh: '医疗器械许可证申请'
            }
          ],
          contacts: [
            {
              name: 'Health Canada MDL Support',
              nameZh: 'Health Canada MDL支持',
              email: 'mdl@hc-sc.gc.ca',
              website: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices.html',
              description: 'MDL application questions',
              descriptionZh: 'MDL申请问题'
            }
          ],
          submissionMethods: [
            {
              method: 'Health Canada Online Portal',
              methodZh: 'Health Canada在线门户',
              url: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices.html',
              description: 'Electronic submission preferred',
              descriptionZh: '首选电子提交'
            }
          ],
          tips: [
            'Include comprehensive device description and intended use',
            'Labeling must comply with Canadian requirements',
            'Include risk management documentation',
            'Respond promptly to information requests',
            'Consider hiring a Canadian regulatory consultant'
          ],
          tipsZh: [
            '包括全面的设备描述和预期用途',
            '标签必须符合加拿大要求',
            '包括风险管理文件',
            '及时回复信息请求',
            '考虑聘请加拿大监管顾问'
          ]
        }
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
    regulationLinks: [
      {
        name: 'Medical Devices Regulations',
        nameZh: '医疗器械法规',
        url: 'https://laws-lois.justice.gc.ca/eng/regulations/SOR-98-282/',
        description: 'SOR/98-282 - Canada Justice Laws',
        descriptionZh: 'SOR/98-282 - 加拿大司法部',
      },
      {
        name: 'Health Canada Devices',
        nameZh: 'Health Canada医疗器械',
        url: 'https://www.canada.ca/en/health-canada/services/medical-devices.html',
        description: 'Medical Devices Overview',
        descriptionZh: '医疗器械概览',
      },
      {
        name: 'MDL Application',
        nameZh: 'MDL许可证申请',
        url: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medical-devices/application-information/guidance-documents/medical-device-licence-application.html',
        description: 'Medical Device Licence Guidance',
        descriptionZh: '医疗器械许可证指南',
      },
      {
        name: 'Canadian Medical Devices',
        nameZh: '加拿大医疗器械数据库',
        url: 'https://health-products.canada.ca/mdall-limh/',
        description: 'MDALL - Medical Devices Active Licence Listing',
        descriptionZh: '医疗器械活跃许可证清单',
      },
      {
        name: 'ISO 13485:2016',
        nameZh: 'ISO 13485:2016',
        url: 'https://www.iso.org/standard/59752.html',
        description: 'Quality management systems for medical devices',
        descriptionZh: '医疗器械质量管理体系',
      },
    ],
    localRepresentativeRequired: sourceCountry !== 'canada',
    clinicalDataRequired: isClassIII,
  };
}

// 新加坡 HSA 准入路径
function generateSingaporePathway(
  productCategory: string,
  sourceCountry: string,
  deviceClass: string,
  locale: 'en' | 'zh'
): MarketAccessPathway {
  const isClassA = deviceClass === 'class_i';
  const isClassBCD = ['class_iia', 'class_iib', 'class_iii'].includes(deviceClass);

  return {
    targetMarket: 'Singapore',
    targetMarketZh: '新加坡',
    sourceCountry,
    productCategory,
    deviceClass,
    requirements: [
      {
        step: 1,
        title: 'Device Classification',
        titleZh: '设备分类',
        description: 'Determine HSA risk classification (Class A/B/C/D) based on device risk',
        descriptionZh: '根据设备风险确定HSA风险分类（A/B/C/D类）',
        documents: ['Product description', 'Risk analysis', 'Intended use statement'],
        documentsZh: ['产品描述', '风险分析', '预期用途声明'],
        timeline: '1-2 weeks',
        timelineZh: '1-2周',
        cost: '$0',
        costZh: '免费',
        detailedGuide: {
          description: 'Use the HSA GN-13 guidance to determine your device classification. Singapore follows GHTF classification principles.',
          descriptionZh: '使用HSA GN-13指南确定您的设备分类。新加坡遵循GHTF分类原则。',
          forms: [
            {
              name: 'Classification Enquiry Form',
              nameZh: '分类查询表格',
              downloadUrl: 'https://www.hsa.gov.sg/medical-devices/guidances',
              description: 'Request for classification determination',
              descriptionZh: '分类确定请求'
            }
          ],
          contacts: [
            {
              name: 'HSA Medical Devices Branch',
              nameZh: 'HSA医疗器械分部',
              email: 'hsa_md_info@hsa.gov.sg',
              phone: '+65 6866 3500',
              website: 'https://www.hsa.gov.sg/medical-devices',
              description: 'Classification and general inquiries',
              descriptionZh: '分类和一般查询'
            }
          ],
          tips: [
            'Singapore follows ASEAN MDD and GHTF principles',
            'Class A devices may be exempt from registration',
            'Reference similar devices in the Singapore Register',
            'Consider professional regulatory consultation'
          ],
          tipsZh: [
            '新加坡遵循东盟MDD和GHTF原则',
            'A类设备可能免于注册',
            '参考新加坡注册中的类似设备',
            '考虑专业监管咨询'
          ]
        }
      },
      {
        step: 2,
        title: isClassA ? 'Exemption Application' : 'Product Registration',
        titleZh: isClassA ? '豁免申请' : '产品注册',
        description: isClassA
          ? 'Apply for Class A exemption or register via immediate route'
          : 'Submit product registration application via full or abridged route',
        descriptionZh: isClassA
          ? '申请A类豁免或通过即时途径注册'
          : '通过完整或简化途径提交产品注册申请',
        documents: isClassA
          ? ['Exemption application', 'Product information', 'Declaration of conformity']
          : ['Technical documentation', 'Quality system certificate', 'Clinical evidence', 'Labels and IFU'],
        documentsZh: isClassA
          ? ['豁免申请', '产品信息', '符合性声明']
          : ['技术文件', '质量体系证书', '临床证据', '标签和说明书'],
        timeline: isClassA ? '2-4 weeks' : '90-180 days',
        timelineZh: isClassA ? '2-4周' : '90-180天',
        cost: isClassA ? '$0-500' : '$2,000-15,000',
        costZh: isClassA ? '0-500新元' : '2,000-15,000新元',
        detailedGuide: {
          description: isClassA
            ? 'Class A devices can apply for exemption or register through the immediate route. Submit via MEDICS (Medical Device Information & Communication System).'
            : 'Submit registration via MEDICS. Choose full route for new devices or abridged route if reference country approval exists.',
          descriptionZh: isClassA
            ? 'A类设备可以申请豁免或通过即时途径注册。通过MEDICS（医疗器械信息与通信系统）提交。'
            : '通过MEDICS提交注册。新设备选择完整途径，如有参考国家批准可选择简化途径。',
          forms: [
            {
              name: 'MEDICS Registration Portal',
              nameZh: 'MEDICS注册门户',
              onlineUrl: 'https://medics.hsa.gov.sg/',
              description: 'Online registration system',
              descriptionZh: '在线注册系统'
            }
          ],
          contacts: [
            {
              name: 'HSA MEDICS Support',
              nameZh: 'HSA MEDICS支持',
              email: 'hsa_md_info@hsa.gov.sg',
              website: 'https://medics.hsa.gov.sg/',
              description: 'Technical support for MEDICS',
              descriptionZh: 'MEDICS技术支持'
            }
          ],
          tips: [
            'Prepare all documents before starting MEDICS application',
            'Ensure ISO 13485 certification is current',
            'Reference approvals from recognized countries (FDA, TGA, Health Canada) can expedite process',
            'Labels must include Singapore registration number after approval'
          ],
          tipsZh: [
            '在开始MEDICS申请前准备好所有文件',
            '确保ISO 13485认证有效',
            '参考认可国家（FDA、TGA、Health Canada）的批准可以加快流程',
            '批准后标签必须包含新加坡注册号'
          ]
        }
      },
      {
        step: 3,
        title: 'Dealer Licensing',
        titleZh: '经销商许可',
        description: 'Obtain importer, wholesaler, or manufacturer license',
        descriptionZh: '获得进口商、批发商或制造商许可',
        documents: ['Company registration', 'Quality system documentation', 'Storage facilities description'],
        documentsZh: ['公司注册', '质量体系文件', '仓储设施描述'],
        timeline: '4-8 weeks',
        timelineZh: '4-8周',
        cost: '$500-2,000',
        costZh: '500-2,000新元',
        detailedGuide: {
          description: 'All dealers (importers, wholesalers, manufacturers) must obtain a license from HSA before supplying medical devices in Singapore.',
          descriptionZh: '所有经销商（进口商、批发商、制造商）必须在新加坡供应医疗器械前获得HSA许可。',
          forms: [
            {
              name: 'Dealer License Application',
              nameZh: '经销商许可申请',
              onlineUrl: 'https://licence1.business.gov.sg/',
              description: 'Apply via GoBusiness Licensing',
              descriptionZh: '通过GoBusiness Licensing申请'
            }
          ],
          tips: [
            'Apply for dealer license before or concurrently with product registration',
            'Maintain proper storage and distribution records',
            'Report adverse events to HSA within specified timeframes',
            'License must be renewed annually'
          ],
          tipsZh: [
            '在产品注册之前或同时申请经销商许可',
            '保持适当的储存和分销记录',
            '在规定时限内向HSA报告不良事件',
            '许可必须每年续期'
          ]
        }
      },
    ],
    keyRegulations: [
      'Health Products Act',
      'Health Products (Medical Devices) Regulations',
      'GN-13: Guidance on Risk Classification',
      'GN-15: Guidance on Product Registration',
    ],
    keyRegulationsZh: [
      '健康产品法',
      '健康产品（医疗器械）法规',
      'GN-13：风险分类指南',
      'GN-15：产品注册指南',
    ],
    regulationLinks: [
      {
        name: 'HSA Medical Devices',
        nameZh: 'HSA医疗器械',
        url: 'https://www.hsa.gov.sg/medical-devices',
        description: 'Official HSA medical devices portal',
        descriptionZh: 'HSA医疗器械官方门户',
      },
      {
        name: 'MEDICS Portal',
        nameZh: 'MEDICS门户',
        url: 'https://medics.hsa.gov.sg/',
        description: 'Medical Device Information & Communication System',
        descriptionZh: '医疗器械信息与通信系统',
      },
      {
        name: 'GN-13 Classification',
        nameZh: 'GN-13分类指南',
        url: 'https://www.hsa.gov.sg/docs/default-source/hprg-medical-devices/guidances/gn-13-risk-classification.pdf',
        description: 'Risk classification guidance',
        descriptionZh: '风险分类指南',
      },
      {
        name: 'GoBusiness Licensing',
        nameZh: 'GoBusiness许可',
        url: 'https://licence1.business.gov.sg/',
        description: 'Dealer licensing portal',
        descriptionZh: '经销商许可门户',
      },
    ],
    localRepresentativeRequired: sourceCountry !== 'singapore',
    clinicalDataRequired: isClassBCD,
  };
}

// 中东 SFDA 准入路径 (沙特阿拉伯)
function generateMiddleEastPathway(
  productCategory: string,
  sourceCountry: string,
  deviceClass: string,
  locale: 'en' | 'zh'
): MarketAccessPathway {
  const isLowRisk = deviceClass === 'class_i' || deviceClass === 'class_iia';

  return {
    targetMarket: 'Saudi Arabia (SFDA)',
    targetMarketZh: '沙特阿拉伯 (SFDA)',
    sourceCountry,
    productCategory,
    deviceClass,
    requirements: [
      {
        step: 1,
        title: 'Appoint Authorized Representative',
        titleZh: '指定授权代表',
        description: 'Appoint Saudi Arabia Authorized Representative (AR) and establish legal presence',
        descriptionZh: '指定沙特阿拉伯授权代表（AR）并建立法律存在',
        documents: ['AR agreement', 'Company establishment documents', 'Power of attorney'],
        documentsZh: ['授权代表协议', '公司成立文件', '授权书'],
        timeline: '2-4 weeks',
        timelineZh: '2-4周',
        cost: '$5,000-15,000',
        costZh: '5,000-15,000美元',
        detailedGuide: {
          description: 'Foreign manufacturers must appoint a Saudi Arabia Authorized Representative (AR) who will be responsible for regulatory compliance and communication with SFDA.',
          descriptionZh: '外国制造商必须指定沙特阿拉伯授权代表（AR），负责监管合规和与SFDA的沟通。',
          contacts: [
            {
              name: 'SFDA Medical Devices Sector',
              nameZh: 'SFDA医疗器械部门',
              email: 'md.info@sfda.gov.sa',
              phone: '+966 11 203 8222',
              website: 'https://www.sfda.gov.sa/',
              description: 'General inquiries about AR requirements',
              descriptionZh: '关于授权代表要求的一般查询'
            }
          ],
          tips: [
            'Choose an AR with experience in your device category',
            'AR must be a Saudi national or Saudi-registered company',
            'AR is responsible for post-market surveillance and adverse event reporting',
            'Consider AR\'s regulatory expertise and market knowledge'
          ],
          tipsZh: [
            '选择具有您设备类别经验的授权代表',
            '授权代表必须是沙特国民或沙特注册公司',
            '授权代表负责上市后监督和不良事件报告',
            '考虑授权代表的监管专业知识和市场知识'
          ]
        }
      },
      {
        step: 2,
        title: 'MDMA Application',
        titleZh: 'MDMA申请',
        description: 'Submit Medical Device Marketing Authorization (MDMA) application via MDMA system',
        descriptionZh: '通过MDMA系统提交医疗器械上市许可（MDMA）申请',
        documents: ['Technical file', 'ISO 13485 certificate', 'FSC/CFG', 'Clinical evidence', 'Labeling'],
        documentsZh: ['技术文件', 'ISO 13485证书', '自由销售证书/CFG', '临床证据', '标签'],
        timeline: isLowRisk ? '30-60 days' : '90-180 days',
        timelineZh: isLowRisk ? '30-60天' : '90-180天',
        cost: '$3,000-25,000',
        costZh: '3,000-25,000美元',
        detailedGuide: {
          description: 'Submit MDMA application through the SFDA MDMA electronic system. Saudi Arabia accepts MDMA applications through four pathways based on reference country approvals.',
          descriptionZh: '通过SFDA MDMA电子系统提交MDMA申请。沙特阿拉伯根据参考国家批准接受四种途径的MDMA申请。',
          forms: [
            {
              name: 'MDMA Application Portal',
              nameZh: 'MDMA申请门户',
              onlineUrl: 'https://mdma.sfda.gov.sa/',
              description: 'Electronic MDMA submission system',
              descriptionZh: '电子MDMA提交系统'
            }
          ],
          contacts: [
            {
              name: 'SFDA MDMA Support',
              nameZh: 'SFDA MDMA支持',
              email: 'md.info@sfda.gov.sa',
              website: 'https://mdma.sfda.gov.sa/',
              description: 'MDMA system technical support',
              descriptionZh: 'MDMA系统技术支持'
            }
          ],
          tips: [
            'SFDA accepts reference approvals from FDA, TGA, Health Canada, and EU Notified Bodies',
            'Arabic labeling is required for devices sold in Saudi Arabia',
            'Include IFU in both English and Arabic',
            'Ensure ISO 13485 certification covers the device manufacturing'
          ],
          tipsZh: [
            'SFDA接受FDA、TGA、Health Canada和欧盟公告机构的参考批准',
            '在沙特阿拉伯销售的设备需要阿拉伯语标签',
            '包括英文和阿拉伯文的使用说明书',
            '确保ISO 13485认证涵盖设备制造'
          ]
        }
      },
      {
        step: 3,
        title: 'Establishment Registration',
        titleZh: '企业注册',
        description: 'Register manufacturing and importing establishments with SFDA',
        descriptionZh: '向SFDA注册制造和进口企业',
        documents: ['Establishment registration form', 'Quality system documentation', 'Facility information'],
        documentsZh: ['企业注册表', '质量体系文件', '设施信息'],
        timeline: '2-4 weeks',
        timelineZh: '2-4周',
        cost: '$1,000-3,000',
        costZh: '1,000-3,000美元',
        detailedGuide: {
          description: 'All establishments involved in manufacturing, importing, or distributing medical devices must register with SFDA and obtain an Establishment License.',
          descriptionZh: '所有参与医疗器械制造、进口或分销的企业必须向SFDA注册并获得企业许可。',
          tips: [
            'Establishment registration must be completed before MDMA approval',
            'SFDA may conduct inspections of foreign manufacturing facilities',
            'Maintain compliance with Saudi Quality System Requirements',
            'Annual renewal required for establishment licenses'
          ],
          tipsZh: [
            '企业注册必须在MDMA批准前完成',
            'SFDA可能对外国制造设施进行检查',
            '保持符合沙特质量体系要求',
            '企业许可需要每年续期'
          ]
        }
      },
    ],
    keyRegulations: [
      'Medical Devices Law (Royal Decree No. M/54)',
      'Medical Devices Regulations',
      'SFDA Medical Devices Guidance',
      'Saudi Quality System Requirements',
    ],
    keyRegulationsZh: [
      '医疗器械法（皇家法令M/54号）',
      '医疗器械法规',
      'SFDA医疗器械指南',
      '沙特质量体系要求',
    ],
    regulationLinks: [
      {
        name: 'SFDA Medical Devices',
        nameZh: 'SFDA医疗器械',
        url: 'https://www.sfda.gov.sa/en/medical-devices',
        description: 'Official SFDA medical devices portal',
        descriptionZh: 'SFDA医疗器械官方门户',
      },
      {
        name: 'MDMA System',
        nameZh: 'MDMA系统',
        url: 'https://mdma.sfda.gov.sa/',
        description: 'Medical Device Marketing Authorization',
        descriptionZh: '医疗器械上市许可',
      },
      {
        name: 'SFDA Regulations',
        nameZh: 'SFDA法规',
        url: 'https://www.sfda.gov.sa/en/regulations',
        description: 'Medical devices regulations and guidance',
        descriptionZh: '医疗器械法规和指南',
      },
      {
        name: 'Saudi Business Center',
        nameZh: '沙特商业中心',
        url: 'https://sbmc.gov.sa/',
        description: 'Business establishment and licensing',
        descriptionZh: '企业成立和许可',
      },
    ],
    localRepresentativeRequired: true,
    clinicalDataRequired: !isLowRisk,
  };
}
