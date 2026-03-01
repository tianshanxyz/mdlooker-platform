import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '../../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        user: null,
        message: 'Not authenticated' 
      });
    }

    const supabase = createClient();
    
    // 获取用户资料
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // 计算等级和经验值
    const level = calculateLevel(profile);
    
    return NextResponse.json({
      user: {
        ...profile,
        level: level.level,
        experience: level.experience,
      }
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 计算用户等级
function calculateLevel(profile: any) {
  // 基础经验值计算
  let experience = 0;
  
  // 根据用户行为计算经验值
  // 这里可以根据实际业务逻辑调整
  if (profile.created_at) {
    const daysSinceJoin = Math.floor(
      (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    experience += daysSinceJoin * 5; // 每天5点经验
  }
  
  // VIP用户额外经验
  if (profile.role === 'vip') {
    experience += 500;
  } else if (profile.role === 'user') {
    experience += 100;
  }
  
  // 计算等级 (每100经验升一级)
  const level = Math.floor(experience / 100) + 1;
  
  return { level, experience: experience % 100 };
}
