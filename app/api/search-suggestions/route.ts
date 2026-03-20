import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';
import { SYNONYM_DICTIONARY, expandSearchTerm, normalizeSearchTerm } from '../../lib/search-synonyms';

/**
 * GET /api/search-suggestions?q={query}&type={type}
 * 增强的搜索建议API - 支持同义词和智能分类
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const supabase = getSupabaseClient();
    const suggestions: Array<{ text: string; type: string; id?: string; category?: string; synonymOf?: string }> = [];
    const queryLower = query.toLowerCase();

    // 1. 搜索公司
    if (type === 'all' || type === 'company') {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, name_zh')
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
        .limit(limit);

      companies?.forEach(company => {
        suggestions.push({
          text: company.name_zh || company.name,
          type: 'company',
          id: company.id,
        });
      });
    }

    // 2. 搜索产品
    if (type === 'all' || type === 'product') {
      const { data: products } = await supabase
        .from('products')
        .select('id, name, name_zh, category')
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
        .limit(limit);

      products?.forEach(product => {
        suggestions.push({
          text: product.name_zh || product.name,
          type: 'product',
          id: product.id,
          category: product.category,
        });
      });
    }

    // 3. 搜索分类
    if (type === 'all' || type === 'category') {
      const { data: categories } = await supabase
        .from('products')
        .select('category')
        .ilike('category', `%${query}%`)
        .limit(limit);

      const uniqueCategories = [...new Set(categories?.map(p => p.category))];
      uniqueCategories.forEach(category => {
        if (category) {
          suggestions.push({
            text: category,
            type: 'category',
          });
        }
      });
    }

    // 4. 同义词建议
    const expandedTerms = expandSearchTerm(query);
    if (expandedTerms.length > 1) {
      const canonical = normalizeSearchTerm(query);
      if (canonical !== query) {
        suggestions.unshift({
          text: canonical,
          type: 'synonym',
          synonymOf: query,
        });
      }
    }

    // 5. 智能建议 - 基于同义词词典
    SYNONYM_DICTIONARY.forEach(group => {
      if (group.canonical.toLowerCase().includes(queryLower)) {
        suggestions.push({
          text: group.canonical,
          type: 'category',
          category: group.category,
        });
      }
      group.synonyms.forEach(synonym => {
        if (synonym.toLowerCase().includes(queryLower) && synonym.toLowerCase() !== queryLower) {
          suggestions.push({
            text: synonym,
            type: 'synonym',
            synonymOf: group.canonical,
            category: group.category,
          });
        }
      });
    });

    return NextResponse.json({
      suggestions: suggestions.slice(0, limit),
      query,
      expandedTerms: expandedTerms.length > 1 ? expandedTerms : undefined,
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/search-suggestions/popular
 * 返回热门搜索词和分类导航
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locale = 'en', type = 'all' } = body;

    const isZh = locale === 'zh';

    // 热门公司
    const popularCompanies = isZh ? [
      { text: '美敦力', icon: '🏥', subtext: 'Medtronic' },
      { text: '强生', icon: '💊', subtext: 'Johnson & Johnson' },
      { text: '西门子医疗', icon: '🔬', subtext: 'Siemens Healthineers' },
      { text: '迈瑞医疗', icon: '📊', subtext: 'Mindray' },
      { text: '3M', icon: '🛡️', subtext: '3M Health Care' },
      { text: 'BD', icon: '💉', subtext: 'Becton Dickinson' },
      { text: '飞利浦医疗', icon: '💡', subtext: 'Philips Healthcare' },
      { text: 'GE 医疗', icon: '🏥', subtext: 'GE HealthCare' },
    ] : [
      { text: 'Medtronic', icon: '🏥', subtext: 'Ireland/US' },
      { text: 'Johnson & Johnson', icon: '💊', subtext: 'US' },
      { text: 'Siemens Healthineers', icon: '🔬', subtext: 'Germany' },
      { text: 'Mindray', icon: '📊', subtext: 'China' },
      { text: '3M', icon: '🛡️', subtext: 'US' },
      { text: 'BD', icon: '💉', subtext: 'US' },
      { text: 'Philips Healthcare', icon: '💡', subtext: 'Netherlands' },
      { text: 'GE HealthCare', icon: '🏥', subtext: 'US' },
    ];

    // 热门产品
    const popularProducts = isZh ? [
      { text: '口罩', icon: '😷', subtext: '防护用品' },
      { text: '注射器', icon: '💉', subtext: '注射输液' },
      { text: '手套', icon: '🧤', subtext: '防护用品' },
      { text: '导管', icon: '🩺', subtext: '介入类' },
      { text: '监护仪', icon: '📈', subtext: '监护设备' },
      { text: '血糖仪', icon: '🩸', subtext: '诊断设备' },
      { text: '轮椅', icon: '♿', subtext: '康复设备' },
      { text: '超声设备', icon: '🔊', subtext: '影像设备' },
    ] : [
      { text: 'Face Mask', icon: '😷', subtext: 'PPE' },
      { text: 'Syringe', icon: '💉', subtext: 'Injection' },
      { text: 'Gloves', icon: '🧤', subtext: 'PPE' },
      { text: 'Catheter', icon: '🩺', subtext: 'Interventional' },
      { text: 'Patient Monitor', icon: '📈', subtext: 'Monitoring' },
      { text: 'Glucose Meter', icon: '🩸', subtext: 'Diagnostic' },
      { text: 'Wheelchair', icon: '♿', subtext: 'Rehabilitation' },
      { text: 'Ultrasound', icon: '🔊', subtext: 'Imaging' },
    ];

    // 产品分类导航
    const categories = isZh ? [
      { text: '个人防护设备', icon: '🛡️', subcategories: ['口罩', '手套', '防护服', '护目镜'] },
      { text: '注射输液', icon: '💉', subcategories: ['注射器', '针头', '输液器', '导管'] },
      { text: '伤口护理', icon: '🩹', subcategories: ['绷带', '敷料', '创可贴', '手术巾'] },
      { text: '监护设备', icon: '📊', subcategories: ['监护仪', '体温计', '血压计', '血糖仪'] },
      { text: '手术器械', icon: '🔪', subcategories: ['手术刀', '镊子', '剪刀', '缝合针'] },
      { text: '植入介入', icon: '💊', subcategories: ['支架', '起搏器', '人工关节', '导管'] },
      { text: '诊断影像', icon: '🔬', subcategories: ['超声', 'X光机', 'CT', '核磁共振'] },
      { text: '康复设备', icon: '♿', subcategories: ['轮椅', '拐杖', '助行器', '病床'] },
    ] : [
      { text: 'Personal Protective Equipment', icon: '🛡️', subcategories: ['Mask', 'Gloves', 'Gown', 'Goggles'] },
      { text: 'Injection & Infusion', icon: '💉', subcategories: ['Syringe', 'Needle', 'IV Set', 'Catheter'] },
      { text: 'Wound Care', icon: '🩹', subcategories: ['Bandage', 'Dressing', 'Adhesive Bandage', 'Surgical Drape'] },
      { text: 'Patient Monitoring', icon: '📊', subcategories: ['Monitor', 'Thermometer', 'BP Monitor', 'Glucose Meter'] },
      { text: 'Surgical Instruments', icon: '🔪', subcategories: ['Scalpel', 'Forceps', 'Scissors', 'Suture Needle'] },
      { text: 'Implants & Interventional', icon: '💊', subcategories: ['Stent', 'Pacemaker', 'Artificial Joint', 'Catheter'] },
      { text: 'Diagnostic Imaging', icon: '🔬', subcategories: ['Ultrasound', 'X-Ray', 'CT', 'MRI'] },
      { text: 'Rehabilitation', icon: '♿', subcategories: ['Wheelchair', 'Crutch', 'Walker', 'Hospital Bed'] },
    ];

    // 监管机构导航
    const regulatoryAgencies = isZh ? [
      { text: 'NMPA 中国', icon: '🇨🇳', subtext: '国家药品监督管理局' },
      { text: 'FDA 美国', icon: '🇺🇸', subtext: 'Food and Drug Administration' },
      { text: 'CE 欧盟', icon: '🇪🇺', subtext: 'European Conformity' },
      { text: 'PMDA 日本', icon: '🇯🇵', subtext: 'Pharmaceuticals and Medical Devices Agency' },
      { text: 'TGA 澳大利亚', icon: '🇦🇺', subtext: 'Therapeutic Goods Administration' },
      { text: 'HSA 新加坡', icon: '🇸🇬', subtext: 'Health Sciences Authority' },
    ] : [
      { text: 'NMPA China', icon: '🇨🇳', subtext: 'National Medical Products Administration' },
      { text: 'FDA US', icon: '🇺🇸', subtext: 'Food and Drug Administration' },
      { text: 'CE EU', icon: '🇪🇺', subtext: 'European Conformity' },
      { text: 'PMDA Japan', icon: '🇯🇵', subtext: 'Pharmaceuticals and Medical Devices Agency' },
      { text: 'TGA Australia', icon: '🇦🇺', subtext: 'Therapeutic Goods Administration' },
      { text: 'HSA Singapore', icon: '🇸🇬', subtext: 'Health Sciences Authority' },
    ];

    let results: any = {};

    if (type === 'all') {
      results = {
        companies: popularCompanies.map(t => ({ ...t, type: 'company' })),
        products: popularProducts.map(t => ({ ...t, type: 'product' })),
        categories: categories.map(t => ({ ...t, type: 'category' })),
        agencies: regulatoryAgencies.map(t => ({ ...t, type: 'agency' })),
      };
    } else if (type === 'company') {
      results = { companies: popularCompanies.map(t => ({ ...t, type: 'company' })) };
    } else if (type === 'product') {
      results = { products: popularProducts.map(t => ({ ...t, type: 'product' })) };
    } else if (type === 'category') {
      results = { categories: categories.map(t => ({ ...t, type: 'category' })) };
    } else if (type === 'agency') {
      results = { agencies: regulatoryAgencies.map(t => ({ ...t, type: 'agency' })) };
    }

    return NextResponse.json({
      ...results,
      locale,
    });

  } catch (error) {
    console.error('Popular terms error:', error);
    return NextResponse.json(
      { error: 'Failed to get popular terms' },
      { status: 500 }
    );
  }
}
