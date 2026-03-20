import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'zh';
    const categoryId = searchParams.get('category');
    const featured = searchParams.get('featured') === 'true';
    const search = searchParams.get('search');
    const faqId = searchParams.get('id');

    // Get FAQ by ID
    if (faqId) {
      const { data: faq, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('id', faqId)
        .single();

      if (error || !faq) {
        return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
      }

      // Increment view count
      await supabase
        .from('faqs')
        .update({ view_count: (faq.view_count || 0) + 1 })
        .eq('id', faqId);

      return NextResponse.json({
        success: true,
        data: {
          ...faq,
          question: locale === 'zh' ? faq.question_zh : faq.question_en,
          answer: locale === 'zh' ? faq.answer_zh : faq.answer_en,
        }
      });
    }

    // Build query
    let query = supabase
      .from('faqs')
      .select(`
        *,
        category:faq_categories(id, name_en, name_zh)
      `)
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (featured) {
      query = query.eq('is_featured', true);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`question_en.ilike.${searchTerm},question_zh.ilike.${searchTerm},answer_en.ilike.${searchTerm},answer_zh.ilike.${searchTerm}`);
    }

    const { data: faqs, error } = await query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('FAQ fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
    }

    // Transform data based on locale
    const transformedFaqs = faqs?.map(faq => ({
      id: faq.id,
      question: locale === 'zh' ? faq.question_zh : faq.question_en,
      answer: locale === 'zh' ? faq.answer_zh : faq.answer_en,
      tags: faq.tags,
      viewCount: faq.view_count,
      isFeatured: faq.is_featured,
      category: faq.category ? {
        id: faq.category.id,
        name: locale === 'zh' ? faq.category.name_zh : faq.category.name_en
      } : null,
      createdAt: faq.created_at,
      updatedAt: faq.updated_at,
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedFaqs,
      total: transformedFaqs.length
    });

  } catch (error) {
    console.error('FAQ API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Submit contact message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'contact') {
      const { user_email, user_name, subject, message, category } = body;

      if (!subject || !message) {
        return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          user_email,
          user_name,
          subject,
          message,
          category,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Contact message error:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        data
      });
    }

    if (action === 'feedback') {
      const { user_email, page_url, feedback_type, content } = body;

      if (!feedback_type || !content) {
        return NextResponse.json({ error: 'Feedback type and content are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('feedback')
        .insert({
          user_email,
          page_url,
          feedback_type,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error('Feedback error:', error);
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Feedback submitted successfully',
        data
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('FAQ POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
