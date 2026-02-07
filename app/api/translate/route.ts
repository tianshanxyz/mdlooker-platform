// 百度翻译API路由
// 用于前端调用百度翻译服务

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// 百度翻译API配置
const BAIDU_TRANSLATE_API = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 从环境变量获取配置
const BAIDU_APP_ID = process.env.BAIDU_TRANSLATE_APP_ID || '';
const BAIDU_SECRET_KEY = process.env.BAIDU_TRANSLATE_SECRET_KEY || '';

/**
 * 生成百度翻译API签名
 */
function generateSign(text: string, salt: string): string {
  const str = BAIDU_APP_ID + text + salt + BAIDU_SECRET_KEY;
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * POST /api/translate
 * 翻译文本
 */
export async function POST(request: NextRequest) {
  try {
    // 检查配置
    if (!BAIDU_APP_ID || !BAIDU_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Translation service not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { text, from = 'auto', to = 'en' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // 生成随机盐值
    const salt = Date.now().toString();
    
    // 生成签名
    const sign = generateSign(text, salt);

    // 构建请求参数
    const params = new URLSearchParams({
      q: text,
      from,
      to,
      appid: BAIDU_APP_ID,
      salt,
      sign,
    });

    // 调用百度翻译API
    const response = await fetch(`${BAIDU_TRANSLATE_API}?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      throw new Error(`Baidu API error: ${response.status}`);
    }

    const result = await response.json();

    // 检查错误
    if (result.error_code) {
      return NextResponse.json(
        { 
          error: 'Translation failed',
          error_code: result.error_code,
          error_msg: result.error_msg 
        },
        { status: 400 }
      );
    }

    // 提取翻译结果
    const translatedText = result.trans_result
      .map((r: any) => r.dst)
      .join('\n');

    const sourceText = result.trans_result
      .map((r: any) => r.src)
      .join('\n');

    return NextResponse.json({
      success: true,
      data: {
        translatedText,
        sourceText,
        from: result.from,
        to: result.to,
      },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/translate
 * 检查翻译服务状态
 */
export async function GET() {
  const isConfigured = !!(BAIDU_APP_ID && BAIDU_SECRET_KEY);
  
  return NextResponse.json({
    status: isConfigured ? 'available' : 'not_configured',
    message: isConfigured 
      ? 'Translation service is available'
      : 'Please configure BAIDU_TRANSLATE_APP_ID and BAIDU_TRANSLATE_SECRET_KEY',
  });
}
