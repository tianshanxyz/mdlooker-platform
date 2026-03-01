import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  locale: 'en' | 'zh';
  userTier: 'guest' | 'registered' | 'vip';
  history: ChatMessage[];
}

// 知识库数据 - 医疗器械合规常见问题
const knowledgeBase: Record<string, { en: string; zh: string }> = {
  'fda 510k': {
    en: `FDA 510(k) is a premarket submission made to FDA to demonstrate that the device to be marketed is at least as safe and effective (substantially equivalent) to a legally marketed device (21 CFR 807.92(a)(3)).

Key steps:
1. Device Classification - Determine your device's classification
2. Predicate Device Selection - Find a similar legally marketed device
3. 510(k) Preparation - Compile substantial equivalence documentation
4. Submission - Submit via FDA eSubmitter
5. FDA Review - 90-180 days review period
6. Clearance - Receive 510(k) clearance letter

Required documents:
- 510(k) Summary
- Substantial Equivalence Comparison
- Performance Testing Data
- Biocompatibility Data
- Sterilization Information (if applicable)
- Software Documentation (if applicable)

Estimated cost: $15,000-50,000 (including FDA user fee)`,
    zh: `FDA 510(k)是向FDA提交的上市前申请，用于证明拟上市设备与合法上市的设备具有实质等效性（21 CFR 807.92(a)(3)）。

关键步骤：
1. 设备分类 - 确定您的设备分类
2. 对比设备选择 - 找到类似的合法上市设备
3. 510(k)准备 - 编制实质等效性文件
4. 提交 - 通过FDA eSubmitter提交
5. FDA审查 - 90-180天审查期
6. 批准 - 收到510(k)批准函

所需文件：
- 510(k)摘要
- 实质等效性对比
- 性能测试数据
- 生物相容性数据
- 灭菌信息（如适用）
- 软件文档（如适用）

预估费用：15,000-50,000美元（包括FDA用户费）`
  },
  'eu mdr': {
    en: `EU MDR (Medical Device Regulation 2017/745) is the regulation for medical devices in the European Union, replacing the MDD (Medical Device Directive).

Key requirements:
1. Device Classification - Class I, IIa, IIb, III
2. Conformity Assessment - Depending on device class
3. Notified Body Involvement - Required for Class IIa and above
4. Technical Documentation - Comprehensive device documentation
5. Clinical Evidence - Clinical evaluation report
6. EUDAMED Registration - EU database registration
7. UDI System - Unique Device Identification

Timeline: 6-18 months
Cost: €10,000-100,000+ depending on device class and complexity`,
    zh: `欧盟MDR（医疗器械法规2017/745）是欧盟医疗器械的法规，取代了MDD（医疗器械指令）。

关键要求：
1. 设备分类 - I类、IIa类、IIb类、III类
2. 符合性评估 - 根据设备类别
3. 公告机构参与 - IIa类及以上需要
4. 技术文件 - 全面的设备文档
5. 临床证据 - 临床评估报告
6. EUDAMED注册 - 欧盟数据库注册
7. UDI系统 - 唯一器械标识

时间线：6-18个月
费用：10,000-100,000+欧元，取决于设备类别和复杂性`
  },
  'nmpa': {
    en: `NMPA (National Medical Products Administration) is China's regulatory authority for medical devices.

Registration pathways:
1. Class I - Filing management (备案)
2. Class II - Registration (注册)
3. Class III - Registration with more stringent review

Key requirements:
- Local testing in China (for most devices)
- Clinical evaluation or trials
- Quality system certification (ISO 13485)
- Chinese labeling and IFU
- Legal representative in China (for foreign manufacturers)

Timeline: 12-24 months
Cost: $50,000-200,000+`,
    zh: `NMPA（国家药品监督管理局）是中国医疗器械的监管机构。

注册途径：
1. I类 - 备案管理
2. II类 - 注册
3. III类 - 严格审查的注册

关键要求：
- 在中国进行本地检测（大多数设备）
- 临床评估或试验
- 质量体系认证（ISO 13485）
- 中文标签和说明书
- 在中国的法定代表人（外国制造商）

时间线：12-24个月
费用：50,000-200,000+美元`
  },
  'market access': {
    en: `Market access strategy depends on your product characteristics, target markets, and business goals.

Priority market considerations:

USA (FDA):
- Pros: Large market, clear pathways, fast approval for 510(k)
- Cons: High competition, stringent requirements
- Best for: Innovative devices with predicate

EU (MDR):
- Pros: Large unified market, mutual recognition
- Cons: Complex MDR transition, Notified Body capacity issues
- Best for: Devices with CE mark already

China (NMPA):
- Pros: Fastest growing market, local production incentives
- Cons: Long approval time, local testing required
- Best for: Companies with China presence

Recommendation: Start with your home market, then expand based on commercial opportunities.`,
    zh: `市场准入策略取决于您的产品特性、目标市场和业务目标。

优先市场考虑：

美国（FDA）：
- 优点：大市场、明确途径、510(k)批准快
- 缺点：竞争激烈、要求严格
- 适合：有对比设备的创新设备

欧盟（MDR）：
- 优点：大统一市场、互认
- 缺点：MDR过渡复杂、公告机构容量问题
- 适合：已有CE标志的设备

中国（NMPA）：
- 优点：增长最快的市场、本地生产激励
- 缺点：批准时间长、需要本地检测
- 适合：在中国有业务的公司

建议：从本土市场开始，然后根据商业机会扩展。`
  }
};

// 简单的关键词匹配
function findRelevantKnowledge(query: string, locale: 'en' | 'zh'): string | null {
  const lowerQuery = query.toLowerCase();
  
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (lowerQuery.includes(key) || key.split(' ').some(k => lowerQuery.includes(k))) {
      return locale === 'zh' ? value.zh : value.en;
    }
  }
  
  // 中文关键词匹配
  if (locale === 'zh') {
    if (lowerQuery.includes('fda') || lowerQuery.includes('510')) {
      return knowledgeBase['fda 510k'].zh;
    }
    if (lowerQuery.includes('欧盟') || lowerQuery.includes('mdr') || lowerQuery.includes('ce')) {
      return knowledgeBase['eu mdr'].zh;
    }
    if (lowerQuery.includes('中国') || lowerQuery.includes('nmpa') || lowerQuery.includes('药监局')) {
      return knowledgeBase['nmpa'].zh;
    }
    if (lowerQuery.includes('市场') || lowerQuery.includes('优先') || lowerQuery.includes('建议')) {
      return knowledgeBase['market access'].zh;
    }
  }
  
  return null;
}

// 生成AI回复
async function generateResponse(request: ChatRequest): Promise<{ response: string; suggestions?: string[] }> {
  const { message, locale, userTier, history } = request;
  const isZh = locale === 'zh';
  
  // 首先检查知识库
  const knowledgeResponse = findRelevantKnowledge(message, locale);
  
  if (knowledgeResponse) {
    // 根据用户级别添加额外信息
    let response = knowledgeResponse;
    
    if (userTier === 'vip') {
      response += isZh 
        ? '\n\n💎 VIP专属建议：\n• 建议聘请当地监管顾问协助申请\n• 考虑进行预提交会议以加快审查\n• 我们可以为您推荐经验丰富的咨询公司'
        : '\n\n💎 VIP Exclusive Advice:\n• Consider hiring local regulatory consultants\n• Request pre-submission meetings to expedite review\n• We can recommend experienced consulting firms';
    } else if (userTier === 'registered') {
      response += isZh
        ? '\n\n💡 提示：升级VIP可获得更多个性化建议和推荐服务。'
        : '\n\n💡 Tip: Upgrade to VIP for more personalized advice and recommendation services.';
    }
    
    return {
      response,
      suggestions: isZh 
        ? ['注册流程详解', '所需文件清单', '费用估算', '时间规划']
        : ['Registration Process', 'Required Documents', 'Cost Estimation', 'Timeline Planning']
    };
  }
  
  // 通用回复
  const genericResponses = {
    en: `Thank you for your question about medical device compliance. 

Based on your inquiry, I recommend:

1. Review the specific regulations for your target market
2. Consult with a regulatory expert for personalized guidance
3. Check our Guides section for detailed step-by-step instructions

Would you like me to provide more specific information about:
- FDA 510(k) process
- EU MDR requirements
- NMPA registration
- Market access strategy`,
    zh: `感谢您关于医疗器械合规的咨询。

根据您的问题，我建议：

1. 查看目标市场的具体法规要求
2. 咨询监管专家获取个性化指导
3. 查看我们的指南部分获取详细步骤说明

您希望我提供更具体的信息吗：
- FDA 510(k)流程
- 欧盟MDR要求
- NMPA注册
- 市场准入策略`
  };
  
  return {
    response: isZh ? genericResponses.zh : genericResponses.en,
    suggestions: isZh
      ? ['FDA注册', '欧盟MDR', '中国NMPA', '市场准入']
      : ['FDA Registration', 'EU MDR', 'China NMPA', 'Market Access']
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    // 验证请求
    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // 生成回复
    const result = await generateResponse(body);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 限制请求频率
export const runtime = 'edge';
export const preferredRegion = 'iad';
