/**
 * 医疗器械搜索同义词词典
 * 支持中英文同义词映射
 */

export interface SynonymGroup {
  canonical: string; // 标准词
  synonyms: string[]; // 同义词列表
  category: string; // 分类
}

/**
 * 同义词词典
 */
export const SYNONYM_DICTIONARY: SynonymGroup[] = [
  // 公司类型同义词
  {
    canonical: '公司',
    synonyms: ['企业', '集团', '股份', '有限公司', '有限责任公司', 'company', 'corporation', 'inc', 'ltd', 'group'],
    category: 'organization'
  },
  {
    canonical: '医疗',
    synonyms: ['医药', '医学', '康健', 'medical', 'health', 'healthcare'],
    category: 'organization'
  },
  {
    canonical: '科技',
    synonyms: ['技术', '科创', 'technology', 'tech', 'scientific'],
    category: 'organization'
  },
  
  // 产品类型同义词 - 个人防护
  {
    canonical: '口罩',
    synonyms: ['医用口罩', '外科口罩', '防护口罩', 'N95', 'KN95', 'respirator', 'face mask', 'surgical mask', 'medical mask'],
    category: 'ppe'
  },
  {
    canonical: '手套',
    synonyms: ['医用手套', '检查手套', '手术手套', '乳胶手套', '丁腈手套', 'gloves', 'surgical gloves', 'exam gloves', 'latex gloves', 'nitrile gloves'],
    category: 'ppe'
  },
  {
    canonical: '防护服',
    synonyms: ['隔离衣', '防护服', 'protective clothing', 'isolation gown', 'protective suit'],
    category: 'ppe'
  },
  
  // 产品类型同义词 - 注射输液
  {
    canonical: '注射器',
    synonyms: ['针筒', '注射针', 'syringe', 'hypodermic syringe', 'injection syringe'],
    category: 'injection'
  },
  {
    canonical: '针头',
    synonyms: ['注射针', '穿刺针', 'needle', 'injection needle', 'hypodermic needle'],
    category: 'injection'
  },
  {
    canonical: '导管',
    synonyms: ['插管', 'catheter', 'tube', 'cannula'],
    category: 'injection'
  },
  {
    canonical: '输液器',
    synonyms: ['输液装置', '点滴器', 'infusion set', 'IV set', 'drip set'],
    category: 'injection'
  },
  
  // 产品类型同义词 - 伤口护理
  {
    canonical: '绷带',
    synonyms: ['纱布', '敷料', 'bandage', 'dressing', 'gauze', 'wound dressing'],
    category: 'wound_care'
  },
  {
    canonical: '创可贴',
    synonyms: ['胶布', ' adhesive bandage', 'plaster', 'sticking plaster'],
    category: 'wound_care'
  },
  
  // 产品类型同义词 - 监护设备
  {
    canonical: '监护仪',
    synonyms: ['病人监护仪', 'monitor', 'patient monitor', 'vital signs monitor'],
    category: 'monitoring'
  },
  {
    canonical: '体温计',
    synonyms: ['温度计', 'thermometer', 'clinical thermometer', 'digital thermometer'],
    category: 'monitoring'
  },
  {
    canonical: '血压计',
    synonyms: ['血压测量仪', 'blood pressure monitor', 'sphygmomanometer', 'BP monitor'],
    category: 'monitoring'
  },
  {
    canonical: '血糖仪',
    synonyms: ['血糖测试仪', 'glucose meter', 'blood glucose meter', 'glucometer'],
    category: 'monitoring'
  },
  
  // 产品类型同义词 - 手术器械
  {
    canonical: '手术器械',
    synonyms: ['手术工具', '外科器械', 'surgical instrument', 'surgical tool', 'operative instrument'],
    category: 'surgical'
  },
  {
    canonical: '手术刀',
    synonyms: ['解剖刀', 'scalpel', 'surgical blade', 'lancet'],
    category: 'surgical'
  },
  {
    canonical: '镊子',
    synonyms: ['手术镊', 'forceps', 'tweezers', 'surgical forceps'],
    category: 'surgical'
  },
  {
    canonical: '剪刀',
    synonyms: ['手术剪', 'scissors', 'surgical scissors', 'dissecting scissors'],
    category: 'surgical'
  },
  
  // 产品类型同义词 - 植入介入
  {
    canonical: '支架',
    synonyms: ['血管支架', '心脏支架', 'stent', 'vascular stent', 'coronary stent'],
    category: 'implant'
  },
  {
    canonical: '植入物',
    synonyms: ['植入体', '人工器官', 'implant', 'prosthetic', 'prosthesis'],
    category: 'implant'
  },
  {
    canonical: '起搏器',
    synonyms: ['心脏起搏器', 'pacemaker', 'cardiac pacemaker'],
    category: 'implant'
  },
  
  // 产品类型同义词 - 康复设备
  {
    canonical: '轮椅',
    synonyms: ['wheelchair', 'mobility scooter'],
    category: 'rehabilitation'
  },
  {
    canonical: '拐杖',
    synonyms: ['助行器', 'crutch', 'walking stick', 'walker'],
    category: 'rehabilitation'
  },
  
  // 产品类型同义词 - 诊断影像
  {
    canonical: '超声',
    synonyms: ['B 超', '彩超', 'ultrasound', 'ultrasonic', 'echography'],
    category: 'diagnostic'
  },
  {
    canonical: 'X 光机',
    synonyms: ['X 射线', '放射机', 'X-ray', 'radiography', 'X-ray machine'],
    category: 'diagnostic'
  },
  {
    canonical: 'CT',
    synonyms: ['CT 机', '计算机断层扫描', 'computed tomography', 'CT scanner'],
    category: 'diagnostic'
  },
  {
    canonical: '核磁共振',
    synonyms: ['MRI', '磁共振', 'magnetic resonance', 'MRI scanner', 'NMR'],
    category: 'diagnostic'
  },
  
  // 产品类型同义词 - 牙科
  {
    canonical: '牙科',
    synonyms: ['口腔', '齿科', 'dental', 'oral', 'odontological'],
    category: 'dental'
  },
  {
    canonical: '牙钻',
    synonyms: ['牙科钻机', 'dental drill', 'dental handpiece'],
    category: 'dental'
  },
  
  // 产品类型同义词 - 骨科
  {
    canonical: '骨科',
    synonyms: ['矫形', 'orthopedic', 'orthopaedic'],
    category: 'orthopedic'
  },
  {
    canonical: '人工关节',
    synonyms: ['关节置换', 'artificial joint', 'joint prosthesis', 'joint replacement'],
    category: 'orthopedic'
  },
  
  // 监管机构同义词
  {
    canonical: 'NMPA',
    synonyms: ['药监局', '国家药监局', '中国药监局', 'CFDA', '国家药品监督管理局'],
    category: 'regulatory'
  },
  {
    canonical: 'FDA',
    synonyms: ['美国药监局', '美国 FDA', 'US FDA', 'Food and Drug Administration'],
    category: 'regulatory'
  },
  {
    canonical: 'CE',
    synonyms: ['CE 认证', 'CE 标志', 'CE marking', 'European conformity'],
    category: 'regulatory'
  },
  {
    canonical: 'EUDAMED',
    synonyms: ['欧盟数据库', 'European database', 'EU database'],
    category: 'regulatory'
  },
  {
    canonical: 'PMDA',
    synonyms: ['日本药监局', '日本 PMDA', ' Pharmaceuticals and Medical Devices Agency'],
    category: 'regulatory'
  },
  {
    canonical: 'HSA',
    synonyms: ['新加坡药监局', 'Health Sciences Authority', 'Singapore HSA'],
    category: 'regulatory'
  },
  {
    canonical: 'TGA',
    synonyms: ['澳洲药监局', '澳大利亚药监局', 'Therapeutic Goods Administration'],
    category: 'regulatory'
  },
];

/**
 * 同义词映射表（快速查找）
 */
export const SYNONYM_MAP = new Map<string, SynonymGroup>();

// 初始化同义词映射表
SYNONYM_DICTIONARY.forEach(group => {
  // 标准词映射
  SYNONYM_MAP.set(group.canonical.toLowerCase(), group);
  // 同义词映射
  group.synonyms.forEach(synonym => {
    SYNONYM_MAP.set(synonym.toLowerCase(), group);
  });
});

/**
 * 获取同义词组
 * @param word 输入词
 * @returns 同义词组或 null
 */
export function getSynonymGroup(word: string): SynonymGroup | null {
  return SYNONYM_MAP.get(word.toLowerCase()) || null;
}

/**
 * 扩展搜索词
 * 输入一个词，返回包含同义词的扩展词列表
 * @param word 输入词
 * @returns 扩展词列表
 */
export function expandSearchTerm(word: string): string[] {
  const group = getSynonymGroup(word);
  if (!group) {
    return [word];
  }
  
  // 返回标准词和所有同义词
  return [group.canonical, ...group.synonyms];
}

/**
 * 扩展搜索查询
 * 将输入查询中的每个词都扩展为同义词组
 * @param query 原始查询
 * @returns 扩展后的查询词列表
 */
export function expandSearchQuery(query: string): string[] {
  // 分词（按空格和标点符号）
  const terms = query.split(/[\s,，.。]+/).filter(term => term.length > 0);
  
  // 扩展每个词
  const expandedTerms = terms.flatMap(term => expandSearchTerm(term));
  
  // 去重
  return [...new Set(expandedTerms)];
}

/**
 * 获取分类的所有同义词
 * @param category 分类
 * @returns 该分类下的所有同义词
 */
export function getSynonymsByCategory(category: string): string[] {
  return SYNONYM_DICTIONARY
    .filter(group => group.category === category)
    .flatMap(group => [group.canonical, ...group.synonyms]);
}

/**
 * 标准化搜索词
 * 将同义词映射到标准词
 * @param word 输入词
 * @returns 标准词或原词
 */
export function normalizeSearchTerm(word: string): string {
  const group = getSynonymGroup(word);
  return group ? group.canonical : word;
}

/**
 * 检测查询是否包含医疗器械相关词汇
 * @param query 查询
 * @returns 是否包含医疗词汇
 */
export function isMedicalRelatedQuery(query: string): boolean {
  const terms = query.toLowerCase().split(/[\s,，.。]+/);
  return terms.some(term => SYNONYM_MAP.has(term));
}

/**
 * 获取查询的分类
 * @param query 查询
 * @returns 分类列表
 */
export function detectQueryCategories(query: string): string[] {
  const terms = query.toLowerCase().split(/[\s,，.。]+/);
  const categories = new Set<string>();
  
  terms.forEach(term => {
    const group = SYNONYM_MAP.get(term);
    if (group) {
      categories.add(group.category);
    }
  });
  
  return Array.from(categories);
}
