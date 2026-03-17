/**
 * FAQ 内容生成器
 * 
 * 生成 AI 友好的问答内容，提升在生成式 AI 引擎中的引用概率
 */

import { FAQItem, DataPoint, Citation } from './geo-content-optimizer';

/**
 * 医疗器械领域 FAQ 模板库
 */
export const MEDICAL_DEVICE_FAQ_TEMPLATES: Record<string, FAQItem[]> = {
  // FDA 注册相关
  fda_registration: [
    {
      question: '什么是 FDA 注册？',
      answer: 'FDA 注册是指医疗器械制造商向美国食品药品监督管理局（FDA）提交企业信息，以便在美国市场销售医疗器械。所有在美国销售医疗器械的制造商都必须完成 FDA 注册，这是市场准入的基本要求。',
      keywords: ['FDA 注册', '美国市场准入', '医疗器械注册'],
    },
    {
      question: 'FDA 注册的要求有哪些？',
      answer: 'FDA 注册的主要要求包括：1）企业注册（Establishment Registration）；2）产品列名（Device Listing）；3）指定美国代理人（U.S. Agent）；4）支付年度费用；5）遵守质量管理体系（QSR 21 CFR Part 820）。',
      keywords: ['FDA 要求', '企业注册', '产品列名'],
    },
    {
      question: 'FDA 注册需要多长时间？',
      answer: 'FDA 注册的处理时间因产品类型而异：I 类器械通常只需企业注册，可立即完成；II 类器械通过 510(k) 途径，审评时间为 3-6 个月；III 类器械通过 PMA 途径，审评时间可达 6-10 个月。',
      keywords: ['FDA 注册时间', '510(k)', 'PMA'],
    },
    {
      question: 'FDA 注册的费用是多少？',
      answer: 'FDA 注册费用包括：1）企业注册年费约 7,208 美元（2024 财年）；2）510(k) 申请费约 12,676 美元（小企业减免后约 3,169 美元）；3）PMA 申请费约 332,171 美元。具体费用以 FDA 官方公布为准。',
      keywords: ['FDA 费用', '注册成本', '510k 费用'],
    },
    {
      question: 'FDA 注册的有效期是多久？',
      answer: 'FDA 企业注册的有效期为一年，需要每年更新（10 月 1 日至 12 月 31 日期间）。产品列名无需年费，但企业信息变更时需及时更新。',
      keywords: ['FDA 有效期', '年度更新', '注册续期'],
    },
  ],

  // NMPA 注册相关
  nmpa_registration: [
    {
      question: '什么是 NMPA 注册？',
      answer: 'NMPA 注册是指医疗器械向中国国家药品监督管理局（NMPA）申请注册证的过程。根据风险等级，中国将医疗器械分为 I、II、III 类，其中 II 类和 III 类器械需要获得 NMPA 注册证才能在中国市场销售。',
      keywords: ['NMPA 注册', '中国注册', '药监局'],
    },
    {
      question: 'NMPA 注册的分类是怎样的？',
      answer: 'NMPA 根据风险等级将医疗器械分为三类：I 类（低风险）实行备案管理；II 类（中风险）实行注册管理，由省级药监部门审批；III 类（高风险）实行注册管理，由国家药监局审批。',
      keywords: ['器械分类', 'I 类', 'II 类', 'III 类'],
    },
    {
      question: 'NMPA 注册需要多长时间？',
      answer: 'NMPA 注册时间因类别而异：I 类备案约 1-2 个月；II 类注册约 6-12 个月；III 类注册约 12-18 个月。时间包括技术审评、临床试验（如需要）和行政审批等环节。',
      keywords: ['NMPA 时间', '注册周期', '审评时间'],
    },
    {
      question: 'NMPA 注册需要临床试验吗？',
      answer: '是否需要临床试验取决于产品类别和风险：I 类通常免临床；II 类部分产品可免临床，通过同品种比对证明安全有效性；III 类通常需要进行临床试验。具体可参考 NMPA 发布的免临床目录。',
      keywords: ['临床试验', '免临床', '同品种比对'],
    },
    {
      question: 'NMPA 注册证的有效期是多久？',
      answer: 'NMPA 医疗器械注册证有效期为 5 年。有效期届满需要延续注册的，应当在有效期届满 6 个月前向原注册部门提出延续申请。',
      keywords: ['注册证有效期', '延续注册', '5 年'],
    },
  ],

  // EU MDR 相关
  eu_mdr: [
    {
      question: '什么是 EU MDR？',
      answer: 'EU MDR（EU Medical Device Regulation，欧盟医疗器械法规）是欧盟于 2017 年发布、2021 年 5 月 26 日正式实施的医疗器械法规，取代了之前的 MDD（93/42/EEC）和 AIMDD（90/385/EEC）指令。MDR 提高了对医疗器械安全性和有效性的要求。',
      keywords: ['EU MDR', '欧盟法规', 'CE 认证'],
    },
    {
      question: 'EU MDR 与 MDD 的主要区别是什么？',
      answer: '主要区别包括：1）更严格的临床证据要求；2）加强上市后监管；3）引入 UDI 系统；4）扩大法规范围（包含某些美容产品）；5）更严格的公告机构要求；6）建立 EUDAMED 数据库。',
      keywords: ['MDR vs MDD', '法规变化', '新要求'],
    },
    {
      question: 'CE 认证需要多长时间？',
      answer: 'CE 认证时间取决于产品分类和途径：I 类（非无菌、非测量）可自我声明，约 1-3 个月；IIa 类约 6-12 个月；IIb 类约 12-18 个月；III 类约 18-24 个月。时间包括技术文件准备、公告机构审评和工厂审核。',
      keywords: ['CE 认证时间', '认证周期', '公告机构'],
    },
    {
      question: '什么是 EUDAMED？',
      answer: 'EUDAMED（European DAtabase on MEdical Devices）是欧盟医疗器械数据库，包含经济运营商、器械、证书、临床调查、警戒和市场监督等模块。该数据库旨在提高透明度和信息共享。',
      keywords: ['EUDAMED', '欧盟数据库', 'SRN'],
    },
    {
      question: '英国脱欧后 CE 证书还有效吗？',
      answer: '英国脱欧后，CE 证书在欧盟成员国仍然有效。但在英国市场，需要 UKCA 标志。过渡期内（至 2025 年 6 月 30 日），CE 标志在英国仍可接受。企业需关注最新政策变化。',
      keywords: ['英国脱欧', 'UKCA', 'CE 有效性'],
    },
  ],

  // 市场准入相关
  market_access: [
    {
      question: '什么是医疗器械市场准入？',
      answer: '医疗器械市场准入是指产品进入特定国家或地区市场所需满足的所有法规要求，包括注册/备案、质量管理体系认证、标签要求、上市后监管等。不同市场的准入要求差异很大。',
      keywords: ['市场准入', '准入策略', '法规要求'],
    },
    {
      question: '全球主要市场有哪些？',
      answer: '全球主要医疗器械市场包括：1）美国（FDA 监管）；2）中国（NMPA 监管）；3）欧盟（CE 认证）；4）日本（PMDA 监管）；5）加拿大（Health Canada）；6）澳大利亚（TGA）；7）韩国（MFDS）；8）巴西（ANVISA）等。',
      keywords: ['全球市场', '主要市场', '监管机构'],
    },
    {
      question: '如何选择目标市场？',
      answer: '选择目标市场应考虑：1）市场规模和增长潜力；2）竞争格局；3）法规难度和成本；4）注册周期；5）定价和 reimbursement 政策；6）渠道和分销网络；7）企业资源和战略。建议优先选择法规相对简单、市场潜力大的市场。',
      keywords: ['市场选择', '市场策略', '优先级'],
    },
    {
      question: '什么是 510(k) 途径？',
      answer: '510(k) 是 FDA 对 II 类器械的主要审批途径。申请人需要证明其产品与已合法上市的器械（Predicate Device）实质等同（Substantially Equivalent）。审评时间为 90 天，但实际通常需要 3-6 个月。',
      keywords: ['510k', '实质等同', 'FDA 途径'],
    },
    {
      question: '什么是 PMA 途径？',
      answer: 'PMA（Premarket Approval）是 FDA 对 III 类高风险器械的审批途径。需要提供充分的科学证据证明产品的安全性和有效性，通常包括临床数据。PMA 审评时间为 180 天，但实际通常需要 6-10 个月。',
      keywords: ['PMA', 'III 类器械', '临床数据'],
    },
  ],
};

/**
 * 生成特定主题的 FAQ 内容
 */
export function generateFAQsForTopic(topic: string): FAQItem[] {
  const topicMapping: Record<string, string> = {
    fda: 'fda_registration',
    nmpa: 'nmpa_registration',
    eu: 'eu_mdr',
    eudamed: 'eu_mdr',
    ce: 'eu_mdr',
    mdr: 'eu_mdr',
    market: 'market_access',
    registration: 'fda_registration',
  };

  const templateKey = Object.keys(topicMapping).find((key) =>
    topic.toLowerCase().includes(key)
  );

  if (templateKey && templateKey in MEDICAL_DEVICE_FAQ_TEMPLATES) {
    return MEDICAL_DEVICE_FAQ_TEMPLATES[templateKey];
  }

  // 返回默认 FAQ
  return getDefaultFAQs(topic);
}

/**
 * 生成默认 FAQ
 */
function getDefaultFAQs(topic: string): FAQItem[] {
  return [
    {
      question: `什么是${topic}？`,
      answer: `${topic}是指...（详细定义和解释）。这是医疗器械行业的重要概念，涉及...`,
      keywords: [topic, '定义', '概念'],
    },
    {
      question: `为什么${topic}很重要？`,
      answer: `${topic}的重要性体现在：1）合规要求；2）市场准入；3）患者安全；4）质量控制。`,
      keywords: [topic, '重要性', '价值'],
    },
    {
      question: `如何进行${topic}？`,
      answer: `进行${topic}的步骤包括：第一步准备材料；第二步提交申请；第三步技术审评；第四步行政审批。`,
      keywords: [topic, '方法', '流程'],
    },
    {
      question: `${topic}需要多长时间？`,
      answer: `${topic}的时间因具体情况而异，通常需要...（详细时间说明）。`,
      keywords: [topic, '时间', '周期'],
    },
    {
      question: `${topic}的费用是多少？`,
      answer: `${topic}的费用包括：1）官方费用；2）咨询费用；3）测试费用；4）其他相关费用。`,
      keywords: [topic, '费用', '成本'],
    },
  ];
}

/**
 * 优化 FAQ 内容以适配 AI 引擎
 */
export function optimizeFAQsForAI(faqs: FAQItem[]): FAQItem[] {
  return faqs.map((faq) => {
    // 1. 确保答案结构化（使用列表、编号）
    const structuredAnswer = structureAnswer(faq.answer);
    // 2. 添加更多关键词
    const expandedKeywords = expandKeywords(faq.keywords || [], faq.question);
    // 3. 确保答案长度适中（200-500 字）
    const optimizedAnswer = ensureOptimalLength(structuredAnswer);
    
    return {
      ...faq,
      answer: optimizedAnswer,
      keywords: expandedKeywords,
    };
  });
}

/**
 * 结构化答案
 */
function structureAnswer(answer: string): string {
  // 如果答案包含多个要点，添加编号
  if (answer.includes('；') || answer.includes(';')) {
    const points = answer.split(/[;;]/);
    if (points.length > 1) {
      return points
        .map((point, index) => `${index + 1}）${point.trim()}`)
        .join('\n');
    }
  }
  return answer;
}

/**
 * 扩展关键词
 */
function expandKeywords(keywords: string[], question: string): string[] {
  const expanded = [...keywords];

  // 添加问题中的关键词
  const questionWords = question
    .split(/[\s？?]/)
    .filter((word) => word.length > 1);
  questionWords.forEach((word) => {
    if (!expanded.includes(word)) {
      expanded.push(word);
    }
  });

  // 添加相关术语
  const relatedTerms: Record<string, string[]> = {
    FDA: ['美国', '510(k)', 'PMA', 'FDA 注册'],
    NMPA: ['中国', '药监局', '注册证', '临床试验'],
    CE: ['欧盟', 'MDR', '公告机构', 'EUDAMED'],
    '注册': ['市场准入', '审批', '许可'],
    '认证': ['审核', '合规', '标准'],
  };

  keywords.forEach((keyword) => {
    Object.entries(relatedTerms).forEach(([key, terms]) => {
      if (keyword.includes(key)) {
        terms.forEach((term) => {
          if (!expanded.includes(term)) {
            expanded.push(term);
          }
        });
      }
    });
  });

  return expanded.slice(0, 10); // 限制关键词数量
}

/**
 * 确保答案长度适中
 */
function ensureOptimalLength(answer: string): string {
  if (answer.length < 100) {
    // 如果太短，添加补充说明
    return answer + ' 这是行业标准和最佳实践建议。';
  }
  if (answer.length > 800) {
    // 如果太长，截取前 800 字
    return answer.substring(0, 800) + '...';
  }
  return answer;
}

/**
 * 生成 FAQ 页面 Schema 数据
 */
export function generateFAQPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 导出默认对象
 */
export default {
  generateFAQsForTopic,
  optimizeFAQsForAI,
  generateFAQPageSchema,
  MEDICAL_DEVICE_FAQ_TEMPLATES,
};
