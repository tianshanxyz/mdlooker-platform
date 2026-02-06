'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Comment {
  id: number;
  content: string;
  rating: number;
  created_at: string;
  is_approved: boolean;
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    role: string;
  };
  replies?: Comment[];
}

interface CommentsResponse {
  comments: Comment[];
  userVotes: Record<number, number>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Icons
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ThumbsUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
    </svg>
  );
}

function ThumbsDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

export default function CompanyComments({
  companyId,
  locale,
}: {
  companyId: string;
  locale: string;
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [userVotes, setUserVotes] = useState<Record<number, number>>({});
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasAgreed, setHasAgreed] = useState(false);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/companies/${companyId}/comments?page=${page}&limit=10`
      );
      if (response.ok) {
        const data: CommentsResponse = await response.json();
        setComments(data.comments);
        setUserVotes(data.userVotes);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [companyId, page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !hasAgreed) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/companies/${companyId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setNewComment('');
        setHasAgreed(false);
      } else {
        const errorData = await response.json();
        setError(
          errorData.error ||
            (locale === 'zh' ? '发表评论失败' : 'Failed to post comment')
        );
      }
    } catch (err) {
      setError(locale === 'zh' ? '网络错误' : 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (commentId: number, voteType: number) => {
    if (!session) {
      alert(locale === 'zh' ? '请先登录' : 'Please sign in');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserVotes({ ...userVotes, [commentId]: data.voteType });
        // Refresh comments to get updated vote counts
        fetchComments();
      }
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm(locale === 'zh' ? '确定删除这条评论？' : 'Delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/companies/${companyId}/comments?commentId=${commentId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      locale === 'zh' ? 'zh-CN' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const getRoleBadge = (role: string) => {
    const badges: Record<string, { text: string; class: string }> = {
      vip: {
        text: locale === 'zh' ? 'VIP' : 'VIP',
        class: 'bg-amber-100 text-amber-700',
      },
      user: {
        text: locale === 'zh' ? '用户' : 'User',
        class: 'bg-blue-100 text-blue-700',
      },
      guest: {
        text: locale === 'zh' ? '访客' : 'Guest',
        class: 'bg-slate-100 text-slate-600',
      },
    };
    return badges[role] || badges.guest;
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {locale === 'zh' ? '评论与观点' : 'Comments & Reviews'}
      </h2>

      {/* Legal Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">
              {locale === 'zh'
                ? '法律责任声明'
                : 'Legal Responsibility Disclaimer'}
            </p>
            <p>
              {locale === 'zh'
                ? '评论区内容仅代表发表者个人观点，不代表本平台立场。用户应对其发布内容的真实性、合法性负责。严禁发布虚假信息、诽谤他人或侵犯知识产权的内容。违规内容将被删除，情节严重者将被封禁账号。'
                : 'Comments represent personal views only and do not reflect the platform\'s position. Users are responsible for the authenticity and legality of their content. False information, defamation, or intellectual property infringement is strictly prohibited. Violating content will be removed, and serious offenders will be banned.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                locale === 'zh'
                  ? '分享您对该公司的看法...'
                  : 'Share your thoughts about this company...'
              }
              className="w-full h-32 p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#339999]"
              disabled={isSubmitting}
            />

            {/* Agreement Checkbox */}
            <div className="mt-3 flex items-start gap-2">
              <input
                type="checkbox"
                id="agreement"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-[#339999] focus:ring-[#339999]"
              />
              <label htmlFor="agreement" className="text-sm text-slate-600">
                {locale === 'zh' ? (
                  <>
                    我已阅读并同意
                    <Link href={`/${locale}/terms`} className="text-[#339999] hover:underline">
                      服务条款
                    </Link>
                    和
                    <Link href={`/${locale}/privacy`} className="text-[#339999] hover:underline">
                      隐私政策
                    </Link>
                    ，确认发布内容真实合法，并承担相应法律责任。
                  </>
                ) : (
                  <>
                    I have read and agree to the{' '}
                    <Link href={`/${locale}/terms`} className="text-[#339999] hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href={`/${locale}/privacy`} className="text-[#339999] hover:underline">
                      Privacy Policy
                    </Link>
                    , confirm that my content is true and legal, and accept corresponding legal responsibility.
                  </>
                )}
              </label>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || !hasAgreed || isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendIcon className="w-4 h-4" />
                {isSubmitting
                  ? locale === 'zh'
                    ? '发布中...'
                    : 'Posting...'
                  : locale === 'zh'
                  ? '发表评论'
                  : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 rounded-xl p-6 text-center mb-8">
          <p className="text-slate-600 mb-4">
            {locale === 'zh'
              ? '登录后即可发表评论'
              : 'Sign in to post comments'}
          </p>
          <Link
            href={`/${locale}/auth/signin?callbackUrl=/${locale}/companies/${companyId}`}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors"
          >
            {locale === 'zh' ? '立即登录' : 'Sign In'}
          </Link>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#339999] mx-auto" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          {locale === 'zh' ? '暂无评论，成为第一个评论者吧！' : 'No comments yet. Be the first to comment!'}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const roleBadge = getRoleBadge(comment.user.role);
            const userVote = userVotes[comment.id] || 0;

            return (
              <div
                key={comment.id}
                className="bg-white rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {comment.user.avatar_url ? (
                      <img
                        src={comment.user.avatar_url}
                        alt={comment.user.full_name || ''}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#339999] to-[#2a7a7a] flex items-center justify-center text-white font-medium">
                        {comment.user.full_name?.charAt(0) ||
                          comment.user.email?.charAt(0) ||
                          '?'}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {comment.user.full_name ||
                          (locale === 'zh' ? '匿名用户' : 'Anonymous')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${roleBadge.class}`}
                      >
                        {roleBadge.text}
                      </span>
                      <span className="text-sm text-slate-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    <p className="text-slate-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>

                    {/* Actions */}
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={() => handleVote(comment.id, 1)}
                        className={`flex items-center gap-1 text-sm ${
                          userVote === 1
                            ? 'text-[#339999]'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <ThumbsUpIcon className="w-4 h-4" />
                        <span>{comment.rating > 0 ? comment.rating : 0}</span>
                      </button>

                      <button
                        onClick={() => handleVote(comment.id, -1)}
                        className={`flex items-center gap-1 text-sm ${
                          userVote === -1
                            ? 'text-red-500'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <ThumbsDownIcon className="w-4 h-4" />
                      </button>

                      {session?.user?.id === comment.user.id && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-sm text-slate-400 hover:text-red-500"
                        >
                          {locale === 'zh' ? '删除' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                {locale === 'zh' ? '上一页' : 'Previous'}
              </button>
              <span className="px-4 py-2 text-slate-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
              >
                {locale === 'zh' ? '下一页' : 'Next'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
