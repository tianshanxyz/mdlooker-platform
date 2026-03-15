'use client';

import { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';

interface FavoriteButtonProps {
  companyId: string;
  userId?: string;
  className?: string;
}

export function FavoriteButton({ companyId, userId, className = '' }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    // 检查是否已收藏
    const checkFavorite = async () => {
      try {
        const response = await fetch(`/api/favorites?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          const fav = data.favorites.find((f: any) => f.company_id === companyId);
          if (fav) {
            setIsFavorite(true);
            setFavoriteId(fav.id);
          }
        }
      } catch (error) {
        console.error('Check favorite error:', error);
      }
    };
    
    checkFavorite();
  }, [userId, companyId]);

  const toggleFavorite = async () => {
    if (!userId) {
      alert('请先登录');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isFavorite && favoriteId) {
        // 取消收藏
        const response = await fetch(`/api/favorites?id=${favoriteId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } else {
        // 添加收藏
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            company_id: companyId
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(true);
          setFavoriteId(data.favorite.id);
        }
      }
    } catch (error) {
      console.error('Toggle favorite error:', error);
      alert('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading || !userId}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isFavorite
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      title={isFavorite ? '取消收藏' : '收藏该公司'}
    >
      {isFavorite ? (
        <>
          <HeartOff className="w-5 h-5" />
          <span>已收藏</span>
        </>
      ) : (
        <>
          <Heart className="w-5 h-5" />
          <span>收藏</span>
        </>
      )}
    </button>
  );
}
