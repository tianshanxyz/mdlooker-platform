import { createClient } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/comments/[id]/vote - Vote on a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = parseInt(params.id);
    const { voteType } = await request.json();

    if (![1, -1].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
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

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      // Update existing vote
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking same button
        const { error } = await supabase
          .from('comment_votes')
          .delete()
          .eq('id', existingVote.id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to remove vote' },
            { status: 500 }
          );
        }

        return NextResponse.json({ voteType: 0 });
      } else {
        // Change vote
        const { error } = await supabase
          .from('comment_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);

        if (error) {
          return NextResponse.json(
            { error: 'Failed to update vote' },
            { status: 500 }
          );
        }

        return NextResponse.json({ voteType });
      }
    } else {
      // Create new vote
      const { error } = await supabase.from('comment_votes').insert({
        comment_id: commentId,
        user_id: user.id,
        vote_type: voteType,
      });

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create vote' },
          { status: 500 }
        );
      }

      return NextResponse.json({ voteType });
    }
  } catch (error) {
    console.error('Error in vote API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
