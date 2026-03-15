'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
}

export function Pagination({ currentPage, totalPages, totalResults, pageSize }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updatePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // 总页数较少，全部显示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数较多，智能显示
      if (currentPage <= 3) {
        // 当前页靠近开头
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 当前页靠近结尾
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startResult = (currentPage - 1) * pageSize + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  if (totalPages === 0) return null;

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-3 mt-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* 结果数量显示 */}
        <div className="text-sm text-gray-700">
          显示 <span className="font-medium">{startResult}</span> 到{' '}
          <span className="font-medium">{endResult}</span> 条，共{' '}
          <span className="font-medium">{totalResults}</span> 条结果
        </div>

        {/* 分页按钮 */}
        <div className="flex items-center gap-1">
          {/* 首页 */}
          <button
            onClick={() => updatePage(1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="首页"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>

          {/* 上一页 */}
          <button
            onClick={() => updatePage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="上一页"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* 页码 */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && updatePage(page)}
                disabled={page === '...'}
                className={`min-w-[40px] px-3 py-2 rounded text-sm font-medium ${
                  page === currentPage
                    ? 'bg-[#339999] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${page === '...' ? 'cursor-default' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* 下一页 */}
          <button
            onClick={() => updatePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="下一页"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* 末页 */}
          <button
            onClick={() => updatePage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="末页"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
