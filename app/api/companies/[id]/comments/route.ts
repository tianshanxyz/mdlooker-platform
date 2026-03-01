import { createClient } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/companies/[id]/comments - Get comments for a company
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const supabase = createClient();

    // Get comments with user info
    const { data: comments, error, count } = await supabase
      .from('company_comments')
      .select(
        `
        *,
        user:profiles(id, full_name, email, avatar_url, role),
        replies:company_comments!parent_id(
          *,
          user:profiles(id, full_name, email, avatar_url, role)
        )
      `,
        { count: 'exact' }
      )
      .eq('company_id', companyId)
      .is('parent_id', null)
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Get user's vote for each comment if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    let userVotes: Record<number, number> = {};

    if (user) {
      const { data: votes } = await supabase
        .from('comment_votes')
        .select('comment_id, vote_type')
        .eq('user_id', user.id)
        .in(
          'comment_id',
          comments?.map((c) => c.id) || []
        );

      userVotes =
        votes?.reduce((acc, v) => {
          acc[v.comment_id] = v.vote_type;
          return acc;
        }, {} as Record<number, number>) || {};
    }

    return NextResponse.json({
      comments: comments || [],
      userVotes,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error in comments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = parseInt(params.id);
    const { content, parentId } = await request.json();

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has permission to comment (user or vip role)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role === 'guest') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Please upgrade your account.' },
        { status: 403 }
      );
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('company_comments')
      .insert({
        company_id: companyId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
      })
      .select(
        `
        *,
        user:profiles(id, full_name, email, avatar_url, role)
      `
      )
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Error in create comment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id]/comments - Soft delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Soft delete (mark as deleted)
    const { error } = await supabase
      .from('company_comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting comment:', error);
      return NextResponse.json(
        { error: 'Failed to delete comment' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete comment API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
