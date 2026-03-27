'use client';

import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import TemplateSelector from './TemplateSelector';
import type { TemplateType } from '@/types';

export default function PageManager() {
  const {
    pages,
    currentPageIndex,
    setCurrentPageIndex,
    addPage,
    deletePage,
    reorderPages,
  } = useEditorStore();

  const handleAddPage = () => {
    const newPage = {
      id: `temp-${Date.now()}`,
      order: pages.length,
      templateType: 'full_illustration' as TemplateType,
      canvasJSON: {},
      textContent: null,
    };
    addPage(newPage);
  };

  const handleDeletePage = () => {
    if (pages.length <= 1) {
      alert('최소 1페이지는 필요합니다.');
      return;
    }
    if (!confirm(`${currentPageIndex + 1}페이지를 삭제하시겠습니까?`)) return;
    deletePage(currentPageIndex);
  };

  const handleMoveUp = () => {
    if (currentPageIndex > 0) {
      reorderPages(currentPageIndex, currentPageIndex - 1);
    }
  };

  const handleMoveDown = () => {
    if (currentPageIndex < pages.length - 1) {
      reorderPages(currentPageIndex, currentPageIndex + 1);
    }
  };

  return (
    <div className="bg-white border-l border-gray-200 w-48 lg:w-56 flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-gray-200">
        <TemplateSelector />
      </div>

      <div className="p-2 border-b border-gray-200 flex gap-1">
        <Button variant="secondary" size="sm" onClick={handleAddPage} className="flex-1 text-xs">
          + 추가
        </Button>
        <Button variant="ghost" size="sm" onClick={handleDeletePage} className="text-xs text-red-500">
          삭제
        </Button>
      </div>

      {/* 순서 변경 */}
      <div className="px-2 py-1 flex gap-1 border-b border-gray-200">
        <button
          onClick={handleMoveUp}
          disabled={currentPageIndex === 0}
          className="flex-1 text-xs py-1 hover:bg-gray-100 rounded disabled:opacity-30"
        >
          ↑ 위로
        </button>
        <button
          onClick={handleMoveDown}
          disabled={currentPageIndex === pages.length - 1}
          className="flex-1 text-xs py-1 hover:bg-gray-100 rounded disabled:opacity-30"
        >
          ↓ 아래로
        </button>
      </div>

      {/* 페이지 목록 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {pages.map((page, index) => (
          <button
            key={page.id}
            onClick={() => setCurrentPageIndex(index)}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
              currentPageIndex === index
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <span className="font-medium">{index + 1}p</span>
            <span className="text-xs text-gray-400 ml-2">
              {templateLabel(page.templateType)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function templateLabel(type: string): string {
  const labels: Record<string, string> = {
    full_illustration: '전면 그림',
    illustration_top: '그림↑',
    illustration_bottom: '그림↓',
    illustration_left: '그림←',
    full_text: '전면 텍스트',
  };
  return labels[type] || type;
}
