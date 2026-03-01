import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '../../../../lib/supabase';

// 获取用户收藏
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ favorites: [] });
    }

    const supabase = createClient();
    
    // 获取用户ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!profile) {
      return NextResponse.json({ favorites: [] });
    }

    // 获取收藏列表
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        company:companies(id, name, name_zh, country, logo_url)
      `)
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({ favorites: favorites || [] });

  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 添加/删除收藏
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { company_id, action } = body;

    const supabase = createClient();
    
    // 获取用户ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (action === 'add') {
      // 添加收藏
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: profile.id,
          company_id: company_id,
        });

      if (error) {
        console.error('Error adding favorite:', error);
        return NextResponse.json(
          { error: 'Failed to add favorite' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'added' });

    } else if (action === 'remove') {
      // 删除收藏
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', profile.id)
        .eq('company_id', company_id);

      if (error) {
        console.error('Error removing favorite:', error);
        return NextResponse.json(
          { error: 'Failed to remove favorite' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: 'removed' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
