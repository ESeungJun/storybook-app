'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEditorStore } from '@/stores/editorStore';
import Button from '@/components/ui/Button';

export default function EditorHeader() {
  const { bookId, bookTitle, setBookTitle, isSaving, isDirty, lastSavedAt } = useEditorStore();
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const router = useRouter();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBookTitle(e.target.value);
  };

  const handleSave = async () => {
    if (!bookId) return;
    // 타이틀 저장
    await fetch(`/api/books/${bookId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: bookTitle }),
    });
  };

  const handleSubmit = async () => {
    if (!bookId) return;
    await handleSave();

    const res = await fetch(`/api/books/${bookId}/submit`, { method: 'POST' });
    if (res.ok) {
      router.push('/my-books');
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 h-12 flex items-center gap-3">
      <button
        onClick={() => router.push('/my-books')}
        className="text-gray-400 hover:text-gray-600"
      >
        ← 뒤로
      </button>

      <input
        type="text"
        value={bookTitle}
        onChange={handleTitleChange}
        className="flex-1 text-sm font-medium border-none outline-none bg-transparent max-w-xs"
        placeholder="그림책 제목"
      />

      <span className="text-xs text-gray-400">
        {isSaving ? '저장 중...' : isDirty ? '변경됨' : lastSavedAt ? '저장됨' : ''}
      </span>

      <Button variant="secondary" size="sm" onClick={handleSave}>
        저장
      </Button>

      <Button variant="ghost" size="sm" onClick={() => window.open(`/book/${bookId}`, '_blank')}>
        미리보기
      </Button>

      {!showSubmitConfirm ? (
        <Button size="sm" onClick={() => setShowSubmitConfirm(true)}>
          제출
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">제출하시겠습니까?</span>
          <Button size="sm" onClick={handleSubmit}>
            확인
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowSubmitConfirm(false)}>
            취소
          </Button>
        </div>
      )}
    </div>
  );
}
