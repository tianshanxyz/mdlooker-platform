import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

/**
 * 收藏功能 API
 * 
 * GET - 获取用户的收藏列表
 * POST - 添加收藏
 * DELETE - 删除收藏
 */

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // 获取用户的收藏列表
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        company:companies(
          id,
          name,
          name_zh,
          country,
          business_type,
          description
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // 获取每个收藏的通知数量
    const favoritesWithStats = await Promise.all(
      (favorites || []).map(async (favorite: any) => {
        const { count: unreadCount } = await supabase
          .from('favorite_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('favorite_id', favorite.id)
          .eq('is_read', false);
        
        return {
          ...favorite,
          unread_count: unreadCount || 0
        };
      })
    );
    
    return NextResponse.json({
      favorites: favoritesWithStats,
      total: favoritesWithStats.length
    });
    
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'Failed to get favorites', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    const { user_id, company_id, product_name, notes } = body;
    
    if (!user_id || !company_id) {
      return NextResponse.json(
        { error: 'User ID and Company ID are required' },
        { status: 400 }
      );
    }
    
    // 检查是否已存在
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user_id)
      .eq('company_id', company_id)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'Already favorited', id: existing.id },
        { status: 409 }
      );
    }
    
    // 添加收藏
    const { data: favorite, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id,
        company_id,
        product_name,
        notes
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      favorite
    });
    
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to add favorite', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    const favoriteId = searchParams.get('id');
    
    if (!favoriteId) {
      return NextResponse.json(
        { error: 'Favorite ID is required' },
        { status: 400 }
      );
    }
    
    // 删除收藏（同时会删除相关通知）
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', favoriteId);
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true
    });
    
  } catch (error) {
    console.error('Delete favorite error:', error);
    return NextResponse.json(
      { error: 'Failed to delete favorite', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
