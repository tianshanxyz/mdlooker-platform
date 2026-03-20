import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const locale = searchParams.get('locale') || 'zh';
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let query = supabase
      .from('reviews')
      .select('*')
      .eq('is_published', true);

    if (featured) {
      query = query.eq('is_featured', true);
    }

    const { data: reviews, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Reviews fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    const transformedReviews = reviews?.map(r => ({
      id: r.id,
      userName: r.user_name,
      userCompany: r.user_company,
      userAvatar: r.user_avatar,
      rating: r.rating,
      review: locale === 'zh' && r.review_zh ? r.review_zh : r.review_en,
      isFeatured: r.is_featured,
      isVerified: r.is_verified,
      helpfulCount: r.helpful_count,
      createdAt: r.created_at,
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedReviews,
      total: transformedReviews.length
    });

  } catch (error) {
    console.error('Reviews API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Submit new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'review') {
      const { user_name, user_company, user_avatar, rating, review_en, review_zh } = body;

      if (!user_name || !rating || !review_en) {
        return NextResponse.json({ error: 'Name, rating and review are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_name,
          user_company,
          user_avatar,
          rating,
          review_en,
          review_zh,
          is_published: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Review insert error:', error);
        return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Review submitted successfully. It will be visible after moderation.',
        data
      });
    }

    if (action === 'helpful') {
      const { review_id } = body;

      if (!review_id) {
        return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
      }

      const { data: currentReview } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', review_id)
        .single();
      
      const newCount = (currentReview?.helpful_count || 0) + 1;
      
      const { data, error } = await supabase
        .from('reviews')
        .update({ helpful_count: newCount })
        .eq('id', review_id)
        .select()
        .single();

      if (error) {
        console.error('Review update error:', error);
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Marked as helpful'
      });
    }

    if (action === 'suggestion') {
      const { user_email, user_name, category, title, description } = body;

      if (!category || !title || !description) {
        return NextResponse.json({ error: 'Category, title and description are required' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('suggestions')
        .insert({
          user_email,
          user_name,
          category,
          title,
          description,
        })
        .select()
        .single();

      if (error) {
        console.error('Suggestion insert error:', error);
        return NextResponse.json({ error: 'Failed to submit suggestion' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Suggestion submitted successfully',
        data
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
